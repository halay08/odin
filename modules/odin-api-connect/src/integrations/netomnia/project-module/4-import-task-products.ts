import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { getSplittersByClosureId } from './helpers/ClosureQueries';
import { getInAndOutConnectionsByClosureId, getTotalTraysByClosureId } from './helpers/ConnectionQueries';
import { getDuctById } from './helpers/DuctQueries';
import * as common from './helpers/EnvironmentMappings';
import {
    getSchemaByModuleAndEntityName,
    getTaskBySchemaIdAndPolygonId,
    searchRecordsBySchemaIdAndPolygonId,
} from './helpers/OdinQueries';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const httpClient = new BaseHttpClient();

export async function importProducts(
    l0PolygonId: number,
    polygonNames: string[],
    polygonId?: number,
    milestoneId?: string,
    taskId?: string,
) {
    try {

        const ignoredType = [ 'ADMIN' ];
        const ignoredCategory = [ 'AS_BUILT' ];

        const cosmosDb = await createConnection({
            type: 'postgres',
            name: 'netomniaConnection',
            host: process.env.DB_GIS_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_GIS_USERNAME,
            password: process.env.DB_GIS_PASSWORD,
            database: process.env.DB_GIS_NAME,
            synchronize: false,
            entities: [],
        });

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const featureSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'Feature');
        const taskSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'Task');

        let hasMore = true;
        let offset = 0;
        let limit = 50;

        if(taskId) {

            const taskRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Task/${taskId}`,
                apiToken,
            );
            console.log('taskRes', taskRes);
            const task = taskRes['data'];

            if(
                task.length &&
                task[0].properties['Type'].indexOf(ignoredType) === -1 &&
                task[0].properties['Category'].indexOf(ignoredCategory) === -1
            ) {
                const features = task[0]['Feature'].dbRecords ? task[0]['Feature'].dbRecords : [];

                for(let feature of features) {
                    await addFeatureProductsToTasks(task[0], feature, featureSchema, cosmosDb)
                }
            }
        } else if(milestoneId) {

            const miestoneRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Milestone/${milestoneId}?entities=[Task]`,
                apiToken,
            );
            console.log('miestoneRes', miestoneRes);
            const milestone = miestoneRes['data'];

            if(milestone) {

                const tasks = milestone['Task'].dbRecords;

                for(let task of tasks) {
                    if(
                        task.properties['Type'].indexOf(ignoredType) === -1 &&
                        task.properties['Category'].indexOf(ignoredCategory) === -1
                    ) {
                        const featureRecords = await httpClient.getRequest(
                            baseUrl,
                            `ProjectModule/v1.0/db-associations/Feature/${task.id}/relations?entities[]=Feature`,
                            apiToken,
                        );

                        const features = featureRecords['data']['Feature'].dbRecords;

                        for(let feature of features) {
                            await addFeatureProductsToTasks(task, feature, featureSchema, cosmosDb)
                        }
                    }
                }
            }
        } else if(polygonId) {


            while (hasMore) {

                const tasks = await getTaskBySchemaIdAndPolygonId(taskSchema.id, polygonId, pg);

                console.log({ offset, taskLen: tasks.length, polygonId });
                if(tasks.length < 1) {
                    hasMore = false;
                }

                for(let task of tasks) {
                    if(
                        task.properties['Type'].indexOf(ignoredType) === -1 &&
                        task.properties['Category'].indexOf(ignoredCategory) === -1
                    ) {
                        const features = task['Feature'].dbRecords ? task['Feature'].dbRecords : [];

                        for(let feature of features) {
                            await addFeatureProductsToTasks(task, feature, featureSchema, cosmosDb)
                        }
                    }
                }
            }
        } else if(l0PolygonId && polygonNames) {

            // get all the polygonNames inside of an L0
            for(let polyName of polygonNames) {

                const polygons = await cosmosDb.query(`
                    SELECT polygon_2.* \
                    FROM ftth.polygon as polygon_1, ftth.polygon as polygon_2 \
                    WHERE ST_Intersects(polygon_1.geometry, polygon_2.geometry) \
                    AND polygon_2.name = '${polyName}' \
                    AND polygon_1.id = ${l0PolygonId}
                    ORDER BY polygon_2.id ASC
                    `);

                console.log('polygonsLength', polygons.length);

                if(polygons[0]) {
                    for(const polygon of polygons) {
                        const tasks = await searchRecordsBySchemaIdAndPolygonId(taskSchema.id, polygon.id, 0, 500);

                        if(tasks) {
                            console.log({ offset, taskLen: tasks.length, polygonId: polygon.id });

                            for(let task of tasks) {
                                if(
                                    task.properties['Type'].indexOf(ignoredType) === -1 &&
                                    task.properties['Category'].indexOf(ignoredCategory) === -1
                                ) {

                                    const features = task['Feature'].dbRecords ? task['Feature'].dbRecords : [];

                                    for(let feature of features) {
                                        await addFeatureProductsToTasks(task, feature, featureSchema, cosmosDb)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log('end of task processing');
        }

    } catch (err) {
        console.error(err);
    }
}

/**
 *
 * @param task
 * @param feature
 * @param featureSchema
 * @param cosmosDb
 */
const addFeatureProductsToTasks = async (task, feature, featureSchema, cosmosDb) => {

    const allProducts = await getLaborAndMaterialProductsFromFeature(feature, featureSchema, cosmosDb);

    console.log('allProducts', allProducts);

    if(feature.properties['Feature'].includes('CLOSURE')) {

        const featureType = feature.properties['Type'];
        const closureId = feature.properties['ExternalRef'];

        if(task.properties['Type'] === 'DEPLOY') {

            // Add products for trays
            const { totalTrays, trayProducts } = await getTotalTraysByClosureId(closureId, cosmosDb);

            console.log({ totalTrays, trayProducts });

            if(totalTrays) {
                for(const trayProd of trayProducts) {
                    // Add tray product MANAGEMENT OF SINGLE FIBRE TO TRAY
                    const product = await getProductById(trayProd.id);
                    await addProductToFeature(feature, product, trayProd.quantity, trayProd.quantity);
                }
            }

            // L0, L1, L2 - Map labor product for deploying a closure LARGE TM JOINT / NODE U/G
            const largeTmJointNodeProductId = 'bd23a1d7-4a1a-445e-996b-53a6a90b11e8';
            // L3 - Map labor product
            const smallTmJoinNodeProductId = 'b1c98ba3-7117-4253-92dc-43b1d38383dc';
            // L4 - Map labor product
            const cbtBackToJointProductId = '3813454d-33a7-4593-ad6c-da1f266c4c07';

            for(let product of allProducts) {

                if(getProperty(product, 'Category') == 'LABOR') {
                    // for L1, L2, L3
                    const introduceCableId = '69e4876e-f698-4431-bc46-17779e5704f5';
                    if(product.id === introduceCableId && [ 'L1', 'L2', 'L3' ].includes(featureType)) {
                        await addProductToFeature(feature, product, 2, 2);
                    } else if([
                        cbtBackToJointProductId,
                        largeTmJointNodeProductId,
                        smallTmJoinNodeProductId,
                    ].includes(product.id)) {
                        await addProductToFeature(feature, product, 1, 1);
                    }
                }

                if(getProperty(product, 'Category') == 'MATERIAL') {
                    console.log('ADD MATERIAL PRODUCT', product.title);
                    await addProductToFeature(feature, product, product.quantity, product.quantity);
                }
            }

            // Add products for testing

            for(let product of allProducts) {
                const { totalSplitters } = await getSplittersByClosureId(closureId, cosmosDb);

                const opticalTestingProductId = '00661cc1-0f5d-40ac-bed6-00a2d8727e08';

                console.log('TEST TASK SPLITTERS', closureId, totalSplitters);
                if(product.id === opticalTestingProductId && totalSplitters) {
                    await addProductToFeature(feature, product, totalSplitters, totalSplitters);
                } else if(featureType === 'L4') {

                    const product = await getProductById(opticalTestingProductId);
                    await addProductToFeature(feature, product, 1, 1);
                }
            }


            // Add products for splicing
            const { totalSplices, sealProducts } = await getInAndOutConnectionsByClosureId(
                feature.properties['ExternalRef'],
                cosmosDb,
            );

            console.log({ totalSplices, sealProducts });

            for(let sealProduct of sealProducts) {
                if(sealProduct) {
                    const product = await getProductById(sealProduct.id);
                    console.log('seal product', product);
                    await addProductToFeature(feature, product, sealProduct.quantity, sealProduct.quantity);
                }
            }

            if(totalSplices) {
                // Add splicing product SPLICING OF FIBRES
                const splicingProductId = 'a8e9412e-5881-4faa-a703-7146665580ef';
                const product = await getProductById(splicingProductId);
                await addProductToFeature(feature, product, totalSplices, totalSplices);
            }
        }


    }

    if(feature.properties['Feature'].includes('CABLE')) {
        for(let product of allProducts) {

            if(getProperty(product, 'Category') == 'LABOR') {
                await addProductToFeature(feature, product, 1, 1);
            }

            if(getProperty(product, 'Category') == 'MATERIAL') {
                if(getProperty(product, 'UnitType') === '100_METER') {
                    await addProductToFeature(feature, product, Math.ceil(product.quantity), product.quantity);
                } else {
                    await addProductToFeature(feature, product, Math.ceil(product.quantity), product.quantity);
                }
            }
        }
    }

    if(feature.properties['Feature'].includes('DUCT')) {

        for(let product of allProducts) {

            if(getProperty(product, 'Category') == 'LABOR') {

                const gisFeature = await getDuctById(getProperty(feature, 'ExternalRef'), cosmosDb);

                if(gisFeature) {

                    const { length, duct_model, dig, duct_type, surface_type, odin_product_id } = gisFeature;

                    console.log({ length });

                    if([ '3- FW', '1-NULL' ].includes(surface_type)) {
                        // add product Laying Duct in Footway (One Way)
                        const productId = '034bc89e-8a5a-41c4-971c-d988da7891c0';
                        if(product.id === productId) {
                            await addProductToFeature(feature, product, Math.round(length), length);
                        }
                    }

                    if(surface_type === '2-Soft') {
                        // add product Laying Duct in Soft or Unsurfaced (One Way)
                        const productId = '3dea8f43-e0bf-4af9-b432-e2fdcf35df9f';
                        if(product.id === productId) {
                            await addProductToFeature(feature, product, Math.round(length), length);
                        }
                    }

                    if(surface_type === '4-CW') {
                        // add product Laying Duct in Carriageway (One Way)
                        const productId = 'eb0a17db-60b7-419d-80e7-b167827a8523';
                        if(product.id === productId) {
                            await addProductToFeature(feature, product, Math.round(length), length);
                        }
                    }

                }
            }
        }
    }


    if(feature.properties['Feature'].includes('DUCT_SUB_DUCT')) {

        for(let product of allProducts) {

            if(getProperty(product, 'Category') == 'LABOR') {
                await addProductToFeature(feature, product, 1, 1);
            }

            if(getProperty(product, 'Category') == 'MATERIAL') {

                if(getProperty(product, 'UnitType') == '100_METER') {
                    await addProductToFeature(feature, product, Math.ceil(product.quantity), product.quantity);
                } else {
                    await addProductToFeature(feature, product, Math.ceil(product.quantity), product.quantity);
                }
            }
        }
    }

    if(feature.properties['Feature'].includes('CHAMBER')) {

        for(let product of allProducts) {
            if(getProperty(product, 'Category') == 'LABOR') {
                await addProductToFeature(feature, product, 1, 1);
            }

            if(getProperty(product, 'Category') == 'MATERIAL') {
                await addProductToFeature(feature, product, product.quantity, product.quantity);
            }
        }
    }

    if(feature.properties['Feature'].includes('ROPE')) {
        const laborProducts = await getLaborProductFromFeature(feature.id);

        for(let product of laborProducts) {
            if(getProperty(product, 'Category') == 'LABOR') {
                await addProductToFeature(feature, product, 1, 1);
            }
        }
    }

    if(feature.properties['Feature'].includes('BLOCKAGE')) {
        for(let product of allProducts) {
            if(getProperty(product, 'Category') == 'LABOR') {
                await addProductToFeature(feature, product, 1, 1);
            }

            if(getProperty(product, 'Category') == 'MATERIAL') {
                await addProductToFeature(feature, product, product.quantity, product.quantity);
            }
        }
    }
}


/**
 * Helper method
 * @param task
 * @param product
 * @param quantity
 */
const addProductToFeature = async (feature, product, quantity, QuantityNonAdj) => {

    console.log({ feature, product, quantity });
    const newProductAssociation = new DbRecordAssociationCreateUpdateDto();

    if(product) {
        newProductAssociation.recordId = product.id;
        newProductAssociation.properties = product.properties;

        const createProductAssociationRes = await httpClient.postRequest(
            baseUrl,
            `ProjectModule/v1.0/db-associations/Feature/${feature.id}`,
            apiToken,
            [ newProductAssociation ],
        );

        console.log('createProductAssociationRes', createProductAssociationRes, feature.title, product.title);

        // update the product quantity
        if(createProductAssociationRes['data'].length > 0) {
            const associationId = createProductAssociationRes['data'][0].id;

            console.log('update product quantity', {
                properties: {
                    Quantity: quantity || 0,
                    QuantityNonAdj: QuantityNonAdj || 0,
                },
            });

            await httpClient.putRequest(
                baseUrl,
                `ProjectModule/v1.0/db-associations/${associationId}/${product.id}`,
                apiToken,
                {
                    properties: {
                        Quantity: quantity || 0,
                        QuantityNonAdj: QuantityNonAdj || 0,
                    },
                },
            );
        }
    }
}

/**
 *
 * @param prod_id
 */
const getProductById = async (prod_id) => {

    const productId = common.getSandboxProduct(prod_id);

    console.log('productId', productId);

    const productRes = await httpClient.getRequest(
        baseUrl,
        `ProductModule/v1.0/db/Product/${productId}`,
        apiToken,
    )

    return productRes['data'];
}


/**
 *
 * @param feature
 * @param featureSchema
 * @param cosmosDb
 */
const getLaborAndMaterialProductsFromFeature = async (feature, featureSchema, cosmosDb) => {

    console.log('feature.properties', feature.properties);
    const laborProduct = await getLaborProductFromFeature(feature.id);

    const materialProducts = await getMaterialProduct(
        getProperty(feature, 'ExternalRef'),
        featureSchema,
        cosmosDb,
        getProperty(feature, 'Feature'),
    );

    let allProducts = [];

    console.log('materialProducts', materialProducts);
    console.log('laborProduct', laborProduct);
    if(materialProducts) {
        allProducts = [ ...laborProduct, ...materialProducts ];
    } else {
        allProducts = laborProduct;
    }

    return allProducts;
}


/**
 *
 * @param externalId
 * @param schema
 * @param connection
 * @param featureType
 */
const getMaterialProduct = async (externalId, schema, connection, featureName) => {

    console.log('externalId', externalId);
    console.log('featureName', featureName);

    let type;
    if(featureName.includes('CLOSURE')) {
        type = 'closure';
    }

    if(featureName.includes('CABLE')) {
        type = 'cable';
    }
    if(featureName.includes('DUCT_SUB_DUCT')) {
        type = 'duct';
    }
    if(featureName.includes('CHAMBER')) {
        type = 'chamber';
    }
    if(featureName.includes('BLOCKAGE')) {
        type = 'blockage';
    }

    if(externalId && type) {

        if(type === 'cable' || type === 'duct') {
            const featureData = await connection.query(
                `SELECT ST_Length(
                    CASE
                        WHEN ST_GeometryType(ftth.${type}.geometry) <> 'ST_MultiCurve'
                            THEN ftth.${type}.geometry
                        WHEN ST_GeometryType(ftth.${type}.geometry) = 'ST_MultiCurve'
                            THEN ST_CurveToLine(ftth.${type}.geometry)
                    END
                    ) as quantity, ftth.${type}_model.odin_product_id as product_id
                FROM ftth.${type}, ftth.${type}_model
                WHERE ftth.${type}.id = ${externalId}
                AND ftth.${type}.model_id = ftth.${type}_model.id`,
            )

            console.log('cable_duct_length: ', featureData[0].quantity);

            if(featureData[0].product_id) {
                const productId = common.getSandboxProduct(featureData[0].product_id);
                console.log('productId', productId);

                const productRes = await httpClient.getRequest(
                    baseUrl,
                    `ProductModule/v1.0/db/Product/${productId}`,
                    apiToken,
                )

                const product = productRes['data'];
                const unitType = getProperty(product, 'UnitType');

                console.log('cable_duct_unitType', unitType);

                let quantity = featureData[0].quantity;

                if(unitType === '100_METER') {
                    quantity = (100 * Math.ceil(featureData[0].quantity / 100)) / 100;
                }

                return [
                    {
                        quantity,
                        ...productRes['data'],
                    },
                ]
            } else {
                return [
                    {
                        quantity: 0,
                    },
                ]
            }
        } else if(type === 'chamber' || type === 'closure' || type === 'blockage') {
            const featureData = await connection.query(`
                SELECT ftth.${type}_model.odin_product_id as product_id
                FROM ftth.${type}, ftth.${type}_model
                WHERE ftth.${type}.id = ${externalId}
                AND ftth.${type}.model_id = ftth.${type}_model.id
            `);

            if(featureData[0].product_id) {
                const productId = common.getSandboxProduct(featureData[0].product_id);

                const productRes = await httpClient.getRequest(
                    baseUrl,
                    `ProductModule/v1.0/db/Product/${productId}`,
                    apiToken,
                )

                return [
                    {
                        quantity: 1,
                        ...productRes['data'],
                    },
                ]
            } else {
                return [
                    {
                        quantity: 0,
                    },
                ]
            }
        }
    } else {
        return [
            {
                quantity: 0,
            },
        ]
    }
}

/**
 *
 * @param id
 * @param schema
 */
const getLaborProductFromFeature = async (featureId) => {

    const featureTemplate = await getFeatureTemplateFromFeatureById(featureId);

    if(featureTemplate) {

        const products = featureTemplate['Product'].dbRecords;

        if(products) {
            const laborProducts = products.filter(e => e.properties['Category'] === 'LABOR');

            return laborProducts;

        }
    }
    return [];
}

const getFeatureTemplateFromFeatureById = async (featureId) => {
    const featureRes = await httpClient.getRequest(
        baseUrl,
        `ProjectModule/v1.0/db/Feature/${featureId}?entities=[FeatureTemplate]`,
        apiToken,
    );

    const feature = featureRes['data'];
    const featureFeatureTemplate = feature['FeatureTemplate'].dbRecords;

    if(featureFeatureTemplate) {
        const featureTemplateRes = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/FeatureTemplate/${featureFeatureTemplate[0].id}?entities=[Product]`,
            apiToken,
        );

        return featureTemplateRes['data'];
    }

    return;
}


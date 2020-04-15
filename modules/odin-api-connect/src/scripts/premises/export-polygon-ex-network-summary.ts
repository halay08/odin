import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { getCableLengthByPolygon } from '../../integrations/netomnia/project-module/helpers/CableQueries';
import { getInAndOutConnectionsByClosureId } from '../../integrations/netomnia/project-module/helpers/ConnectionQueries';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

async function execute() {

    let myahDb;
    let cosmosDb;

    let argPolygonId = process.argv.find(arg => arg.indexOf('polyid') > -1);
    let polygonId = argPolygonId ? argPolygonId.split('=')[1] : null;

    try {
        myahDb = await createConnection({
            type: 'postgres',
            name: 'myahDb',
            host: process.env.DB_MYAH_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_MYAH_USERNAME,
            password: process.env.DB_MYAH_PASSWORD,
            database: process.env.DB_MYAH_NAME,
            entities: [],
        });
    } catch (e) {
        console.error(e);
        myahDb = await getConnection('myahDb');
    }

    try {

        cosmosDb = await createConnection({
            type: 'postgres',
            name: 'cosmosDb',
            host: process.env.DB_GIS_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_GIS_USERNAME,
            password: process.env.DB_GIS_PASSWORD,
            database: process.env.DB_GIS_NAME,
            entities: [],
        });
    } catch (e) {

        console.error(e);
        cosmosDb = await getConnection('cosmosDb');
    }

    const errors = [];
    const modified = [];

    // const exPoly = 6088; Durham
    // const exPoly = 40652;

    const l2Polygon = await cosmosDb.query(
        `SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'EX'
        AND ftth.polygon.id =${polygonId}
        ORDER BY ftth.polygon.id
        `);

    const report = await mergeFtthDataWithOrdinanceSurvey(l2Polygon, myahDb, cosmosDb);

    console.log({
        report: report.length,
    });

    let csv = '';
    const fields = Object.keys(report[0]).map(elem => (elem));

    try {
        // csv = parse({ data: report, fields });
        const parser = new Parser({ fields });
        csv = parser.parse(report);
    } catch (err) {
        console.error(err);
    }

    fs.writeFileSync(`export-ex-${polygonId}-network-summary-${moment().format('DD-MM-YYYY')}.csv`, csv)

    cosmosDb.close();
    myahDb.close();
    return { modified, errors };
}


/**
 *
 * @param records
 * @private
 */
const mergeFtthDataWithOrdinanceSurvey = async (polygons: any[], db: any, db2: any): Promise<any[]> => {

    const data = [];

    try {
        for(const polygon of polygons) {

            const l2Polygons = await db2.query(
                `SELECT
                ftth.polygon.id,
               ftth.polygon.geometry
            FROM ftth.polygon
            LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
            WHERE St_Intersects(ftth.polygon.geometry, '${polygon.geometry}')
            AND ftth.polygon.name = 'L2'
            `);


            const l0Closures = await db2.query(
                `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${polygon.geometry}')
                    AND ftth.closure_type.name = 'L0'
                    `)


            const l1Closures = await db2.query(
                `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${polygon.geometry}')
                    AND ftth.closure_type.name = 'L1'
                    `);

            // loop over each of the l2 polygons
            for(const l2polygon of l2Polygons) {


                const l2Closures = await db2.query(
                    `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${l2polygon.geometry}')
                    AND ftth.closure_type.name = 'L2'
                    `);

                const l3Closures = await db2.query(
                    `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${l2polygon.geometry}')
                    AND ftth.closure_type.name = 'L3'
                    `);

                // get the l4 closures
                const l4Closures = await db2.query(
                    `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${l2polygon.geometry}')
                    AND ftth.closure_type.name = 'L4'
                    `);

                // get total premise count
                const premises = await db.query(`
                    SELECT os.ab_plus.udprn, os.ab_plus.post_town
                    FROM os.ab_plus
                    WHERE St_Intersects(os.ab_plus.geom, '${l2polygon.geometry}')
                    `);

                const premisesR = await db.query(`
            SELECT count(*)
            FROM os.ab_plus
            WHERE St_Intersects(os.ab_plus.geom, '${l2polygon.geometry}')
            AND os.ab_plus.class_1 = 'R'
            `);

                const premisesC = await db.query(`
            SELECT count(*)
            FROM os.ab_plus
            WHERE St_Intersects(os.ab_plus.geom, '${l2polygon.geometry}')
            AND os.ab_plus.class_1 = 'C'
            `);


                const openReachDuctsND = await db.query(`
                SELECT ST_Length(
                        CASE
                        WHEN ST_GeometryType(openreach.duct.geom) <> 'ST_MultiCurve'
                            THEN openreach.duct.geom
                        WHEN ST_GeometryType(openreach.duct.geom) = 'ST_MultiCurve'
                            THEN ST_CurveToLine(openreach.duct.geom)
                        END
                    ) as duct_length
                FROM openreach.duct
                WHERE St_Intersects(openreach.duct.geom, '${l2polygon.geometry}')
                AND object_class = 'ND'`);

                const openReachDuctsExND = await db.query(`
                SELECT ST_Length(
                        CASE
                        WHEN ST_GeometryType(openreach.duct.geom) <> 'ST_MultiCurve'
                            THEN openreach.duct.geom
                        WHEN ST_GeometryType(openreach.duct.geom) = 'ST_MultiCurve'
                            THEN ST_CurveToLine(openreach.duct.geom)
                        END
                    ) as duct_length
                FROM openreach.duct
                WHERE St_Intersects(openreach.duct.geom, '${l2polygon.geometry}')
                AND object_class != 'ND'
                `);

                const onPLanDucts = await db2.query(`
                SELECT ST_Length(
                        CASE
                        WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
                            THEN ftth.duct.geometry
                        WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
                            THEN ST_CurveToLine(ftth.duct.geometry)
                        END
                    ) as length, ftth.duct_model.name
                FROM ftth.duct
                LEFT JOIN ftth.duct_model on (ftth.duct_model.id = ftth.duct.model_id)
                WHERE St_Intersects(ftth.duct.geometry, '${l2polygon.geometry}')
                GROUP BY ftth.duct.geometry, ftth.duct_model.name
                `);

                console.log('onPLanDuct', onPLanDucts);
                const totalOnPlanDuct = {};
                for(const duct of onPLanDucts) {
                    if(totalOnPlanDuct[`duct_${duct.name}`]) {
                        totalOnPlanDuct[`duct_${duct.name}`] += duct.length;
                    } else {
                        totalOnPlanDuct[`duct_${duct.name}`] = duct.length;
                    }
                }

                console.log('totalOnPlanDuct', totalOnPlanDuct);

                const polesNotOpenreach = await db2.query(`
                SELECT count(*)
                FROM ftth.pole
                LEFT JOIN ftth.pole_model on (ftth.pole_model.id = ftth.pole.model_id)
                WHERE St_Intersects(ftth.pole.geometry, '${l2polygon.geometry}')
                AND ftth.pole_model.name != 'Openreach';
                `);


                let totalL0ClosureSplices = 0;

                let totalL1ClosureSplices = 0;

                let totalL2ClosureSplices = 0;

                let totalL3ClosureSplices = 0;

                let totalL4AboveGround = 0;

                let totalL4UnderGround = 0;

                let totalL4ClosureSplices = 0;

                const accessCableLength = await getCableLengthByPolygon(l2polygon.geometry, 'Access', db2);

                console.log('l2polygon', l2polygon.id);
                const feedCableLength = await getCableLengthByPolygon(l2polygon.geometry, 'Feed', db2);

                // loop over each l3 closure
                for(const l0Closure of l0Closures) {

                    const { totalSplices } = await getInAndOutConnectionsByClosureId(l0Closure.id, db2);

                    totalL0ClosureSplices += totalSplices;
                }

                // loop over each l3 closure
                for(const l1Closure of l1Closures) {

                    const { totalSplices } = await getInAndOutConnectionsByClosureId(l1Closure.id, db2);

                    totalL1ClosureSplices += totalSplices;
                }
                // loop over each l3 closure
                for(const l2Closure of l2Closures) {

                    const { totalSplices } = await getInAndOutConnectionsByClosureId(l2Closure.id, db2);

                    totalL2ClosureSplices += totalSplices;
                }
                // loop over each l3 closure
                for(const l3Closure of l3Closures) {

                    const { totalSplices } = await getInAndOutConnectionsByClosureId(l3Closure.id, db2);

                    totalL3ClosureSplices += totalSplices;
                }
                // loop over each l4 closure
                for(const l4Closure of l4Closures) {

                    const { totalSplices } = await getInAndOutConnectionsByClosureId(l4Closure.id, db2);

                    totalL4ClosureSplices += totalSplices;

                    const openReachPoles = await db.query(`
                    SELECT openreach.structure.objectid
                    FROM openreach.structure
                    WHERE St_Intersects(openreach.structure.geom, '${l4Closure.geometry}')
                    AND category_name = 'POLE'
                    `);

                    console.log('openReachPoles', openReachPoles);

                    if(openReachPoles.length > 0) {
                        totalL4AboveGround += 1;
                    } else {
                        totalL4UnderGround += 1;
                    }

                }

                const obj = {
                    exPolygonId: polygon.id,
                    l2PolygonId: l2polygon.id,
                    postTown: premises.find(elem => ![ '', null, undefined ].includes(elem.post_town)).post_town,
                    premiseResidentialCount: Number(premisesR[0].count),
                    premiseCommercialCount: Number(premisesC[0].count),
                    openReachDuctsNotND: openReachDuctsExND[0] ? openReachDuctsExND[0].duct_length : 0,
                    openReachDuctsND: openReachDuctsND[0] ? openReachDuctsND[0].duct_length : 0,
                    totalL0Closures: l0Closures.length,
                    totalL1Closures: l1Closures.length,
                    totalL2Closures: l2Closures.length,
                    totalL3Closures: l3Closures.length,
                    totalL4Closures: l4Closures.length,
                    totalL4AboveGround,
                    totalL4UnderGround,
                    // totalL0ClosureSplices,
                    // totalL1ClosureSplices,
                    totalL2ClosureSplices,
                    totalL3ClosureSplices,
                    // totalL4ClosureSplices,
                    accessCableLength,
                    feedCableLength,
                    ...totalOnPlanDuct,
                    polesNotOpenreach: polesNotOpenreach[0] ? Number(polesNotOpenreach[0].count) : 0,
                }

                console.log('object', obj);

                data.push(obj);
            }
        }

        return data;
    } catch (e) {
        console.error(e);
    }
}

execute();


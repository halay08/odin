import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty, splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { constantCase } from 'change-case';
import { Connection } from 'typeorm';
import { chunkArray } from '../../helpers/utilities';
import { JiraIssueCreateDto } from '../../integrations/jira/issues/dto/jira.issue.create.dto';
import { JiraIssuesService } from '../../integrations/jira/issues/jira.issues.service';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class GisFtthFeaturesService {

    constructor(
        @InjectConnection('cosmosDatabase') private readonly cosmosConnection: Connection,
        @InjectConnection('myahDatabase') private readonly myahConnection: Connection,
        private readonly dbService: DbService,
        private readonly schemasService: SchemasService,
        private readonly jiraIssuesService: JiraIssuesService,
    ) {

        this.cosmosConnection = cosmosConnection;
        this.myahConnection = myahConnection;
        this.dbService = dbService;
        this.schemasService = schemasService;
        this.jiraIssuesService = jiraIssuesService;

    }

    /**
     * @param principal
     * @param featureId
     */
    public async createFeature(principal: OrganizationUserEntity, featureId: string) {
        // const feature = await this.dbService
        const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            featureId,
        );

        // if the record has a JiraProjectKey
        if(getProperty(feature, 'JiraProjectKey')) {
            await this.createJiraTicket(feature, principal);
        }

        // we want to exclude any feature types with PIA which is read only data
        if(feature.type.indexOf('PIA') === -1) {
            const schema = await this.schemasService.getSchemaByOrganizationAndId(
                principal.organization,
                { schemaId: feature.schemaId },
            );
            const filteredCols = feature.schemaTypeId ? schema.columns.filter(elem => elem.schemaTypeId === feature.schemaTypeId || !elem.schemaTypeId) : schema.columns;

            const isLine = [ 'CABLE', 'SURVEY_ROUTE', 'ROPE' ].includes(feature.type);

            const coordinates = getProperty(feature, 'Coordinates');

            if(coordinates) {
                // TODO: This should be dynamically mapped like we have for column mappings.
                const { schemaName, tableName } = this.getSchemaAndTableNameFromFeature(feature.type);

                const gisColumns = await this.getTableColumnsInCosmosDb(schemaName, tableName);
                console.log('gisColumns', gisColumns);

                const body = {
                    schemaName: schemaName,
                    tableName: tableName,
                    columns: [],
                    values: [],
                };

                const propKeys = Object.keys(feature.properties);

                for(const key of propKeys) {

                    const col = filteredCols.find(elem => elem.name === key);
                    const val = getProperty(feature, key);

                    if(key === 'Coordinates') {

                        const split = coordinates.split(',');

                        const pointsArray = chunkArray(split, 2).map(elem => `ST_MakePoint(${elem[0]}, ${elem[1]})`)

                        body.columns.push('geometry');

                        if(isLine) {
                            body.values.push(`ST_SetSRID(ST_MakeLine(ARRAY[${pointsArray}]), 27700)`);
                        } else {
                            body.values.push(`ST_SetSRID(${pointsArray[0]}, 27700)`)
                        }

                    } else if(col.mapping && col.mapping !== 'id' && gisColumns.includes(col.mapping)) {

                        body.columns.push(col.mapping);
                        const value = isNaN(val) ? `'${val}'` : Number(val);
                        body.values.push(value || 'NULL');

                    }
                }

                const res = await this.createFeatureInGis(principal, body);

                // update the feature in Odin
                if(res && res.id) {

                    const update = new DbRecordCreateUpdateDto();
                    update.entity = `${PROJECT_MODULE}:${FEATURE}`;
                    update.type = feature.type;
                    update.properties = {
                        ExternalRef: res.id,
                    };
                    update.options = {
                        skipUpdateEvent: true,
                    }
                    // Update the program properties
                    await this.dbService.updateDbRecordsByPrincipalAndId(principal, featureId, update);

                }

            }
        }
    }

    /**
     * @param principal
     * @param featureId
     */
    public async deleteFeature(principal: OrganizationUserEntity, featureId: string): Promise<{ affected: number }> {

        const feature = await this.dbService.getDeletedDbRecordById(principal.organization, featureId);

        // we want to exclude any feature types with PIA which is read only data
        if(feature.type.indexOf('PIA') === -1) {
            // TODO: This should be dynamically mapped like we have for column mappings.
            const setDbSchema = this.getSchemaAndTableNameFromFeature(feature.type);

            const externalRef = getProperty(feature, 'ExternalRef');
            const tableName = `${setDbSchema}.${feature.type.toLowerCase()}`;

            const res = await this.deleteFeatureInGis(principal, externalRef, tableName);

            return res;
        }

    }

    /**
     * @param principal
     * @param featureId
     */
    public async updateFeature(principal: OrganizationUserEntity, featureId: string) {
        // const feature = await this.dbService
        const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            featureId,
        );

        // we want to exclude any feature types with PIA which is read only data
        if(feature.type.indexOf('PIA') === -1) {
            const schema = await this.schemasService.getSchemaByOrganizationAndId(
                principal.organization,
                { schemaId: feature.schemaId },
            );

            const filteredCols = feature.schemaTypeId ? schema.columns.filter(elem => elem.schemaTypeId === feature.schemaTypeId || !elem.schemaTypeId) : schema.columns;

            const externalRef = getProperty(feature, 'ExternalRef');

            if(externalRef) {
                // TODO: This should be dynamically mapped like we have for column mappings.
                const { schemaName, tableName } = this.getSchemaAndTableNameFromFeature(feature.type);

                const gisColumns = await this.getTableColumnsInCosmosDb(schemaName, feature.type.toLowerCase());
                console.log('gisColumns', gisColumns);

                const body = {
                    schemaName: schemaName,
                    tableName: tableName,
                    updates: {},
                };

                const propKeys = Object.keys(feature.properties);

                for(const key of propKeys) {

                    const col = filteredCols.find(elem => elem.name === key);
                    const val = getProperty(feature, key);

                    if(col.mapping && col.mapping !== 'id' && key !== 'Coordinates' && gisColumns.includes(col.mapping)) {
                        const value = isNaN(val) ? val : Number(val);

                        body.updates = Object.assign({}, body.updates, { [col.mapping]: value || null })
                    }
                }

                // if the externalRef is a number
                if(!isNaN(externalRef)) {

                    const res = await this.updateFeatureInGis(principal, externalRef, body);
                    return res;
                }

            }

            return;
        }
    }

    /**
     * Update or Creates a Feature in Odin from a feature in GIS
     * Using the featureType and featureId
     *
     * @param principal
     * @param featureType
     * @param featureIds
     */
    public async importManyFeaturesFromGis(
        principal: OrganizationUserEntity,
        featureType: string,
        featureIds: number[],
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            if(!featureType || !featureIds) {
                throw new ExceptionType(400, 'featureType and featureIds are required')
            }

            // we want to exclude any feature types with PIA which is read only data
            // TODO: This should be dynamically mapped like we have for column mappings.
            const { schemaName, tableName } = this.getSchemaAndTableNameFromFeature(featureType);

            let data = [];

            if(featureType.toLowerCase().indexOf('pia') > -1) {

                data = await this.getDbConnection(featureType).query(`SELECT objectid as id, * FROM ${schemaName}.${tableName} WHERE objectid IN (${featureIds})`);

            } else {

                data = await this.getDbConnection(featureType).query(`SELECT * FROM ${schemaName}.${tableName} WHERE id IN (${featureIds})`);

            }

            if(data[0]) {

                const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    'ProjectModule:Feature',
                );

                if(!schema) {
                    throw new ExceptionType(400, `This schema is not supported ${featureType}`);
                }

                const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

                if(!schemaType) {
                    throw new ExceptionType(400, `This schema type is not supported ${featureType}`);
                }
                const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

                let creates: DbRecordCreateUpdateDto[] = [];

                for(const item of data) {

                    const create = new DbRecordCreateUpdateDto();
                    create.entity = `${PROJECT_MODULE}:${FEATURE}`;
                    create.type = constantCase(featureType);
                    create.properties = {};
                    create.options = {
                        skipCreateEvent: true,
                    };

                    for(const key of Object.keys(item)) {

                        const col = filteredCols.find(elem => elem.mapping === key);

                        if(col && col.name !== 'Coordinates') {
                            create.properties = Object.assign({}, create.properties, { [col.name]: item[key] })
                        }
                    }

                    creates.push(create);

                }

                // Update the program properties
                return await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, creates);

            }

        } catch (e) {

            throw new ExceptionType(e.statusCode, e.message);

        }
    }


    /**
     * Update or Creates a Feature in Odin from a feature in GIS
     * Using the featureType and featureId
     *
     * @param principal
     * @param featureType
     * @param featureId
     */
    public async importFeatureFromGis(
        principal: OrganizationUserEntity,
        featureType: string,
        featureId: number,
    ): Promise<any> {
        try {

            if(!featureType || !featureId) {
                throw new ExceptionType(400, 'featureType and featureId are required')
            }

            // we want to exclude any feature types with PIA which is read only data
            // TODO: This should be dynamically mapped like we have for column mappings.
            const { schemaName, tableName } = this.getSchemaAndTableNameFromFeature(featureType);

            let data = [];

            if(featureType.toLowerCase().indexOf('pia') > -1) {

                data = await this.getDbConnection(featureType).query(`SELECT objectid as id, * FROM ${schemaName}.${tableName} WHERE objectid = ${featureId}`);

            } else {

                data = await this.getDbConnection(featureType).query(`SELECT * FROM ${schemaName}.${tableName} WHERE id = ${featureId}`);

            }

            if(data[0]) {

                const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
                    principal.organization,
                    'ProjectModule:Feature',
                );

                if(!schema) {
                    throw new ExceptionType(400, `This schema is not supported ${featureType}`);
                }

                const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

                if(!schemaType) {
                    throw new ExceptionType(400, `This schema type is not supported ${featureType}`);
                }
                const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

                const create = new DbRecordCreateUpdateDto();
                create.entity = `${PROJECT_MODULE}:${FEATURE}`;
                create.type = constantCase(featureType);
                create.properties = {};
                create.options = {
                    skipCreateEvent: true,
                };

                for(const key of Object.keys(data[0])) {

                    const col = filteredCols.find(elem => elem.mapping === key);

                    if(col && col.name !== 'Coordinates') {
                        create.properties = Object.assign({}, create.properties, { [col.name]: data[0][key] })
                    }
                }

                // Update the program properties
                const createRes = await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [ create ]);

                return createRes[0];
            }

        } catch (e) {

            throw new ExceptionType(e.statusCode, e.message);

        }
    }

    /**
     * Deletes a Feature in Odin from a feature in GIS
     * Using the featureType and featureId
     *
     * @param principal
     * @param featureType
     * @param featureId
     */
    public async deleteOdinFeatureFromGis(principal: OrganizationUserEntity, featureType: string, featureId: number) {

        return undefined;

    }


    /**
     *
     * @param principal
     * @param body
     */
    private async createFeatureInGis(principal: OrganizationUserEntity, body: any): Promise<any> {
        try {

            const data = await this.getDbConnection(body.tableName).query(`
            INSERT INTO ${body.schemaName}.${body.tableName} (${body.columns.join()})
            VALUES (${body.values.join()})
            RETURNING id, ${body.columns.join()}`);

            return data[0];

        } catch (e) {

            console.error(e, { body });
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param body
     */
    private async updateFeatureInGis(principal: OrganizationUserEntity, id: number, body: any): Promise<any> {

        try {

            const updateRes = await this.getDbConnection(body.tableName).manager.createQueryBuilder()
                .update(`${body.schemaName}.${body.tableName}`)
                .set(body.updates)
                .where('id = :id', { id })
                .returning('id')
                .execute();

            return updateRes;

        } catch (e) {

            throw new ExceptionType(e.statusCode, e.message);

        }
    }

    /**
     *
     * @param principal
     * @param id
     * @param tableName
     */
    private async deleteFeatureInGis(
        principal: OrganizationUserEntity,
        id: number,
        tableName: string,
    ): Promise<{ affected: number }> {
        try {

            const data = await this.getDbConnection(tableName).query(`DELETE FROM ${tableName} WHERE id = ${id}`);

            return { affected: data[1] };

        } catch (e) {

            throw new ExceptionType(e.statusCode, e.message);

        }
    }

    /**
     *
     * @param type
     * @private
     */
    private getSchemaAndTableNameFromFeature(type: string) {

        // TODO: we need to configure a dynamic data source
        // that maps tables to entities / types
        const comosSurveyFeatures = [
            'BLOCKAGE',
            'HAZARD',
            'SURVEY_ROUTE',
            'SURVEY_STRUCTURE',
        ].includes(constantCase(type));

        if(type.toLowerCase().indexOf('pia') > -1) {

            if(constantCase(type) === 'PIA_DUCT') {

                return {
                    schemaName: 'openreach',
                    tableName: 'duct',
                };

            }

            if(constantCase(type) === 'PIA_STRUCTURE') {

                return {
                    schemaName: 'openreach',
                    tableName: 'structure',
                };

            }
        }

        if(comosSurveyFeatures) {

            return {
                schemaName: 'survey',
                tableName: type.toLowerCase(),
            };

        } else {

            return {
                schemaName: 'ftth',
                tableName: type.toLowerCase(),
            };

        }

    }

    /**
     * When we are inserting or updating columns into the database we want to
     * only include columns that exist in the database and match odin column
     * mappings.
     * @param schemaName
     * @param tableName
     * @private
     */
    private async getTableColumnsInCosmosDb(schemaName: string, tableName: string): Promise<string[]> {

        const columns = await this.getDbConnection(tableName).query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name   = '${tableName}';
        `);

        return columns.map(elem => elem.column_name);

    }

    /**
     * When we are inserting or updating columns into the database we want to
     * only include columns that exist in the database and match odin column
     * mappings.
     * @param schemaName
     * @param tableName
     * @private
     */
    private async getTableColumnsInMyahDb(schemaName: string, tableName: string): Promise<string[]> {

        const columns = await this.getDbConnection(tableName).query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name = '${tableName}';
        `);

        return columns.map(elem => elem.column_name);

    }

    /**
     * Based on the featureType we know which database it belongs to
     * temporary router to keep the code cleaner and replace when we can
     * dynamically handle data sources
     * @param featureType
     * @private
     */
    private getDbConnection(featureType: string): Connection {

        if(featureType.toLowerCase().indexOf('pia') > -1) {

            return this.myahConnection;

        } else {

            return this.cosmosConnection;
        }
    }


    /**
     *
     * @param feature
     * @param principal
     * @private
     */
    private async createJiraTicket(feature: DbRecordEntityTransform, principal: OrganizationUserEntity) {
        const { moduleName, entityName } = splitEntityToModuleAndEntity(feature.entity);

        const create = new JiraIssueCreateDto();
        create.fields = {
            project: {
                key: getProperty(feature, 'JiraProjectKey'),
            },
            summary: `New ${feature.type} feature created by ${principal.firstname}`,
            description: `
                odin record #: ${feature.recordNumber} \n
                odin url: ${principal.organization.webUrl}${moduleName}/${entityName}/${feature.id} \n
                odin description: ${getProperty(feature, 'Description')}
                odin external ref: ${getProperty(feature, 'ExternalRef')}
                `,
            issuetype: {
                name: 'Task',
            },
            labels: [
                'ODIN',
                feature.type,
                feature.recordNumber,
            ],
        }

        console.log('create', create);

        await this.jiraIssuesService.createIssue(principal, create);
    }


}

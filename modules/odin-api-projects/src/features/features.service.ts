import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getAllRelations, getFirstRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { DbRecordDeleted } from '@d19n/schema-manager/dist/db/types/db.record.deleted';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { constantCase } from 'change-case';
import { constructCableTubes } from '../featurecomponents/constructors/features.component.cable.tubes';
import { constructClosurePorts } from '../featurecomponents/constructors/features.component.closure.ports';
import { constructClosureSlots } from '../featurecomponents/constructors/features.component.closure.slots';
import { constructTubeFibres } from '../featurecomponents/constructors/features.component.tube.fibres';
import { TaskProductCalculations } from '../helpers/TaskProductCalculations';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;

const FEATURE = 'Feature';
const { PRODUCT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class FeaturesService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineStagesService: PipelineEntitysStagesService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private amqpConnection: AmqpConnection;

    constructor(
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        pipelineStagesService: PipelineEntitysStagesService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineStagesService = pipelineStagesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
    }

    /**
     * Get a feature by externalRef column and type
     *
     * @param principal
     * @param customerType
     * @param code
     */
    private async getFeatureByExternalRef(
        principal: OrganizationUserEntity,
        type: string,
        externalRef: string,
    ): Promise<DbRecordEntityTransform> {

        try {

            const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PROJECT_MODULE}:${FEATURE}`,
            );

            const schemaType = schema.types.find(elem => elem.name === constantCase(type));

            const externalRefCol = schema.columns.find(elem => elem.name === 'ExternalRef');

            if(externalRefCol) {

                const res: { record_id: string } = await this.dbRecordsService.getDbRecordBySchemaAndValues(
                    principal.organization,
                    {
                        schema,
                        schemaTypeId: schemaType.id,
                        query: [ { id: externalRefCol.id, value: externalRef } ],
                    },
                );

                return await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    res.record_id,
                );

            }

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }
    }

    /**
     *
     * @param principal
     * @param featureId
     */
    public async computeFeatureProductTotalsAndSave(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [],
            );

            // get the cost from products
            let { TotalCost } = await this.computeFeatureProductTotals(principal, featureId);

            const update = {
                entity: `${PROJECT_MODULE}:${FEATURE}`,
                properties: {
                    Cost: Number(TotalCost),
                },
            }
            // Update the properties
            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, feature.id, update);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param featureId
     */
    public async computeFeatureProductTotals(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<{ TotalCost: number }> {

        try {

            const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ PRODUCT ],
            );

            const featureProducts = feature[PRODUCT].dbRecords;

            let TotalCost = 0;
            if(!featureProducts) {

                TotalCost = 0;

            } else {

                TotalCost = TaskProductCalculations.computeTotalValue(featureProducts);

            }

            return { TotalCost: Number(Number(Number(TotalCost).toPrecision(10)).toFixed(2)) };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param orderId
     * @param headers
     */
    public async createFeatureComponentsFromFeatureModels(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ 'FeatureComponent', 'FeatureModel' ],
            );

            const modelSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                'ProjectModule:FeatureComponent',
            );

            if(feature.type === 'CABLE') {

                return await this.createCableFeatureComponents(principal, feature, modelSchema);

            } else if(feature.type === 'CLOSURE') {

                return await this.createClosureFeatureComponents(principal, feature, modelSchema);

            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param feature
     * @param modelSchema
     * @private
     */
    private async createCableFeatureComponents(
        principal: OrganizationUserEntity,
        feature: DbRecordEntityTransform,
        modelSchema: SchemaEntity,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            let created: IDbRecordCreateUpdateRes[] = [];

            const featureComponents = getAllRelations(feature, 'FeatureComponent');

            const hasTubes = featureComponents ? featureComponents.find(elem => elem.type === 'CABLE_TUBE') : undefined;

            // if the cable does not have tubes
            if(!hasTubes) {

                // create tubes for the cable
                const cableModel = getFirstRelation(feature, 'FeatureModel')
                const tubesToCreate = constructCableTubes(feature.id, cableModel, modelSchema)

                const tubesCreated = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    tubesToCreate,
                    { skipRelate: true },
                );

                // Create fibres for the cable tubes
                let fibresToCreate = [];
                for(const tube of tubesCreated) {

                    const fibres = constructTubeFibres(tube.id, cableModel, modelSchema)

                    console.log(`${tube.id}_FIBRES_TO_CREATE`, fibres)

                    fibresToCreate.push(...fibres);

                }

                console.log('_____FIBRE_TO_CREATE', fibresToCreate)

                const fibresCreated = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    fibresToCreate,
                    { skipRelate: true },
                );

                created.push(...tubesCreated, ...fibresCreated);
            }
            return created;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param feature
     * @param modelSchema
     * @private
     */
    private async createClosureFeatureComponents(
        principal: OrganizationUserEntity,
        feature: DbRecordEntityTransform,
        modelSchema: SchemaEntity,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            const featureComponents = getAllRelations(feature, 'FeatureComponent');

            const hasPorts = featureComponents ? featureComponents.find(elem => elem.type === 'CLOSURE_PORT') : undefined;
            const hasSlots = featureComponents ? featureComponents.find(elem => elem.type === 'CLOSURE_SLOT') : undefined;

            console.log('hasPorts', hasPorts);
            console.log('hasSlots', hasSlots);

            // create ports and seals
            const closureModel = getFirstRelation(feature, 'FeatureModel')

            console.log('closureModel', closureModel);

            const slotsToCreate = !hasSlots ? constructClosureSlots(feature.id, closureModel, modelSchema) : []
            const portsToCreate = !hasPorts ? constructClosurePorts(feature.id, closureModel, modelSchema) : []

            return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ ...slotsToCreate, ...portsToCreate ],
                { skipRelate: true },
            );

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param featureId
     */
    public async deleteFeatureComponents(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<DbRecordDeleted[]> {

        try {

            const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ 'FeatureComponent' ],
            );

            const components = getAllRelations(feature, 'FeatureComponent')

            let deleted = [];

            if(components) {

                for(const component of components) {

                    const res = await this.dbService.deleteByPrincipalAndId(principal, component.id)
                    deleted.push(...res);

                }

            }

            return deleted;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

}

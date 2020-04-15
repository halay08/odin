import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getAllRelations, getFirstRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { DbRecordDeleted } from '@d19n/schema-manager/dist/db/types/db.record.deleted';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { constructPortSeals } from './constructors/features.component.port.seals';
import { constructSlotTrays } from './constructors/features.component.slot.trays';
import { constructTraySplices } from './constructors/features.component.trays.splices';
import { constructTraySplitters } from './constructors/features.component.trays.splitters';

@Injectable()
export class FeatureComponentsService {

    constructor(
        private dbRecordsAssociationsService: DbRecordsAssociationsService,
        private dbService: DbService,
        private schemasService: SchemasService,
        private dbRecordsService: DbRecordsService,
        private amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param featureId
     */
    public async createFeatureComponentsFromFeatureModels(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            const featureComponent = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ 'FeatureComponent', 'FeatureModel' ],
            );

            const modelSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                'ProjectModule:FeatureComponent',
            );

            if(featureComponent.type === 'CLOSURE_PORT') {

                return await this.createPortSealInterfaceComponents(principal, featureComponent, modelSchema);

            }

            if(featureComponent.type === 'CLOSURE_SLOT') {

                return await this.createTrayComponentsComponents(principal, featureComponent, modelSchema);

            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param featureComponent
     * @param modelSchema
     * @private
     */
    private async createPortSealInterfaceComponents(
        principal: OrganizationUserEntity,
        featureComponent: DbRecordEntityTransform,
        modelSchema: SchemaEntity,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            const featureComponents = getAllRelations(featureComponent, 'FeatureComponent');

            const hasSeals = featureComponents ? featureComponents.find(elem => elem.type === 'PORT_SEAL') : undefined;

            // create ports and seals
            const sealModel = getFirstRelation(featureComponent, 'FeatureModel')

            if(sealModel.type === 'SEAL') {

                const sealsToCreate = !hasSeals ? constructPortSeals(featureComponent.id, sealModel, modelSchema) : []

                return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    sealsToCreate,
                    { skipRelate: true },
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
     * @param feature
     * @param modelSchema
     * @private
     */
    private async createTrayComponentsComponents(
        principal: OrganizationUserEntity,
        feature: DbRecordEntityTransform,
        modelSchema: SchemaEntity,
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {

            let created: IDbRecordCreateUpdateRes[] = [];

            const featureComponents = getAllRelations(feature, 'FeatureComponent');

            const hasTrays = featureComponents ? featureComponents.find(elem => elem.type === 'SLOT_TRAY') : undefined;

            // if the closure slot does not have trays, create them.
            if(!hasTrays) {

                // create  trays for the closure slot
                const trayModel = getFirstRelation(feature, 'FeatureModel')

                if(trayModel.type === 'TRAY') {

                    const traysToCreate = constructSlotTrays(feature.id, trayModel, modelSchema)

                    const traysCreated = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                        principal,
                        traysToCreate,
                        { skipRelate: true },
                    );

                    // Create splitters and splices for a tray based on the tray model
                    let trayComponentCreates = [];
                    for(const tray of traysCreated) {

                        const splices = constructTraySplices(tray.id, trayModel, modelSchema)
                        trayComponentCreates.push(...splices);

                        const splitters = constructTraySplitters(tray.id, trayModel, modelSchema)
                        trayComponentCreates.push(...splitters);

                    }


                    const trayComponentsCreated = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                        principal,
                        trayComponentCreates,
                        { skipRelate: true },
                    );

                    created.push(...traysCreated, ...trayComponentsCreated);
                }
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
     * @param featureId
     */
    public async deleteFeatureComponents(
        principal: OrganizationUserEntity,
        featureId: string,
    ): Promise<DbRecordDeleted[]> {

        try {

            const featureComponent = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ 'FeatureComponent' ],
            );

            const components = getAllRelations(featureComponent, 'FeatureComponent')

            let deleted = [];

            console.log('components', components);

            if(components) {

                // do not delete the FeatureComponent
                const filtered = components.filter(elem => elem.id !== featureId);

                for(const component of filtered) {

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

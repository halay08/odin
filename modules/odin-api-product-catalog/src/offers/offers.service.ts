import {OrganizationUserEntity} from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import {SearchQueryType} from '@d19n/models/dist/search/search.query.type';
import {Injectable} from '@nestjs/common';
import * as dotenv from 'dotenv';
import {SchemasService} from "@d19n/schema-manager/dist/schemas/schemas.service";
import {DbRecordsService} from "@d19n/schema-manager/dist/db/records/db.records.service";
import {DbRecordsAssociationsService} from "@d19n/schema-manager/dist/db/records/associations/db.records.associations.service";
import {DbService} from "@d19n/schema-manager/dist/db/db.service";
import {ProductsService} from "../products/products.service";
import {DbRecordEntityTransform} from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import {DbRecordEntity} from "@d19n/models/dist/schema-manager/db/record/db.record.entity";
import {getProperty} from "@d19n/models/dist/schema-manager/helpers/dbRecordHelpers";
import {ExceptionType} from "@d19n/common/dist/exceptions/types/ExceptionType";
import {SchemaModuleTypeEnums} from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";
import {SchemaModuleEntityTypeEnums} from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";
import moment = require('moment');

const {PRODUCT_MODULE} = SchemaModuleTypeEnums;
const {PRODUCT, OFFER} = SchemaModuleEntityTypeEnums;
dotenv.config();

@Injectable()
export class OffersService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param query
     */
    public async filterSearchResults(
        principal: OrganizationUserEntity,
        headers: { [key: string]: string },
        query: SearchQueryType,
    ): Promise<any | void> {
        try {
            // TODO: fetch a premise if exists
            // TODO: filter results for the premise
            // TODO: filter results by date range do not return offers before availabelFrom or after availableTo

            return true;
        } catch (e) {
            console.error(e);
            return false;
            // return reject(new ExceptionType(500, e.message));
        }
    }

    /**
     *
     * @param principal
     * @param customerType
     * @param code
     */
    public async getActiveOffer(principal: OrganizationUserEntity, customerType: string,  code?: string): Promise<DbRecordEntityTransform> {

        if (code) {
            const offer = await this.getOfferByCode(principal, customerType, code)


            if (offer) {

                return offer

            } else {

                return await this.getDefaultOffer(principal, customerType)

            }

        } else {

            return await this.getDefaultOffer(principal, customerType)

        }

    }

    /**
     *
     * @param principal
     * @param customerType
     * @param code
     */
    private async getOfferByCode(principal: OrganizationUserEntity, customerType:string, code: string): Promise<DbRecordEntityTransform> {

        try {

            const offerSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PRODUCT_MODULE}:${OFFER}`,
            );
            const codeCol = offerSchema.columns.find(elem => elem.name === 'Code');
            const customerTypeCol = offerSchema.columns.find(elem => elem.name === 'CustomerType');

            if (codeCol) {

                const res: { record_id: string } = await this.dbRecordsService.getDbRecordBySchemaAndValues(
                    principal.organization,
                    {
                        schema: offerSchema,
                        query: [{id: codeCol.id, value: code}, {id: customerTypeCol.id, value: customerType}],
                    },
                );


                if (res && res.record_id) {

                    const offer = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                        principal.organization,
                        res.record_id,
                        ["Product"]
                    )

                    const availableFrom = getProperty(offer, 'AvailableFrom');
                    const availableTo = getProperty(offer, 'AvailableTo');

                    const today = moment().utc().format('YYYY-MM-DD')

                    const isPastAvailFrom = moment(today).isSameOrAfter(moment(availableFrom, 'YYYY-MM-DD'));
                    const isBeforeAvailTo = availableTo ? moment(today).isSameOrBefore(moment(
                        availableTo,
                        'YYYY-MM-DD',
                    )) : true;

                    console.log('Today: ', today)
                    console.log('availableFrom: ', availableFrom)
                    console.log('isPastAvailFrom:', isPastAvailFrom)
                    console.log('isBeforeAvailTo:', isBeforeAvailTo)

                    if (isPastAvailFrom && isBeforeAvailTo) {
                        return offer;
                    } else {
                        return undefined;
                    }
                }
            }
            return;
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param customerType
     * @private
     */
    private async getDefaultOffer(principal: OrganizationUserEntity, customerType: string): Promise<DbRecordEntityTransform> {

        const offerSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
            principal.organization,
            `${PRODUCT_MODULE}:${OFFER}`,
        );
        const isDefaultCol = offerSchema.columns.find(elem => elem.name === 'IsDefault');
        const customerTypeCol = offerSchema.columns.find(elem => elem.name === 'CustomerType');

        if (isDefaultCol) {

            const res: { record_id: string } = await this.dbRecordsService.getDbRecordBySchemaAndValues(
                principal.organization,
                {
                    schema: offerSchema,
                    query: [{id: isDefaultCol.id, value: 'true'}, {id: customerTypeCol.id, value: customerType}],
                },
            );

            if (res && res.record_id) {
                return await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    res.record_id,
                    ["Product"]
                )
            } else {
                return undefined
            }

        }

        return undefined;
    }

}

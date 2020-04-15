import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ProductsService } from '../products/products.service';
import moment = require('moment');


const { PRODUCT_MODULE } = SchemaModuleTypeEnums;
const { PRODUCT, DISCOUNT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class DiscountsService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;
    private productsService: ProductsService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        productsService: ProductsService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.productsService = productsService;
    }


    /**
     *
     * @param principal
     * @param discountId
     */
    public async updateByPrincipalAndId(
        principal: OrganizationUserEntity,
        discountId: string,
    ): Promise<DbRecordEntityTransform> {
        try {
            const discount = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                discountId,
                [ PRODUCT ],
            );
            for(const record of discount[PRODUCT].dbRecords) {
                // update parent relations of entity type Product
                const body = {
                    entity: `${PRODUCT_MODULE}:${PRODUCT}`,
                    properties: {
                        DiscountValue: getProperty(discount, 'DiscountValue'),
                        DiscountType: getProperty(discount, 'DiscountType'),
                        DiscountUnit: getProperty(discount, 'DiscountUnit'),
                        DiscountLength: getProperty(discount, 'DiscountLength'),
                        TrialUnit: getProperty(discount, 'TrialUnit'),
                        TrialLength: getProperty(discount, 'TrialLength'),
                    },
                };
                await this.dbService.updateDbRecordsByPrincipalAndId(principal, record.id, body);
            }
            return discount;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param code
     */
    public async redeemDiscount(
        principal: OrganizationUserEntity,
        code: string,
    ): Promise<DbRecordEntityTransform> {

        try {

            const discountSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PRODUCT_MODULE}:${DISCOUNT}`,
            );
            const discountCodeColumn = discountSchema.columns.find(elem => elem.name === 'Code');

            if(discountCodeColumn) {

                const dbRecords: DbRecordEntity[] = await this.dbRecordsService.getDbRecordsByColumnAndValues(
                    principal.organization,
                    {
                        schemaColumnId: discountCodeColumn.id,
                        values: [ code ],
                    },
                );

                if(dbRecords && dbRecords.length === 1) {

                    const discount = DbRecordEntityTransform.transform(dbRecords[0], discountSchema);
                    const availableFrom = getProperty(discount, 'AvailableFrom');
                    const availableTo = getProperty(discount, 'AvailableTo');

                    const today = moment().utc().format('YYYY-MM-DD')

                    const isPastAvailFrom = moment(today).isSameOrAfter(moment(availableFrom, 'YYYY-MM-DD'));
                    const isBeforeAvailTo = availableTo ? moment(today).isSameOrBefore(moment(
                        availableTo,
                        'YYYY-MM-DD',
                    )) : true;

                    if(isPastAvailFrom && isBeforeAvailTo) {
                        return discount;
                    } else {
                        throw new ExceptionType(422, 'no discount available with that code');
                    }
                }
            }
            return;
        } catch (e) {
            throw new ExceptionType(422, 'no discount available with that code');
        }
    }
}

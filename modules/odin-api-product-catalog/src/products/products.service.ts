import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ProductCalculations } from '../helpers/ProductCalculations';
import { ProductsComponentsService } from './components/products.components.service';

dotenv.config();

@Injectable()
export class ProductsService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;
    private productsComponentsService: ProductsComponentsService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        @Inject(forwardRef(() => ProductsComponentsService)) productsComponentsService: ProductsComponentsService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.productsComponentsService = productsComponentsService;
    }

    /**
     *
     * @param principal
     * @param productId
     * @param headers
     */
    public async computeProductTotals(
        principal: OrganizationUserEntity,
        productId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const { PRODUCT_COMPONENT } = SchemaModuleEntityTypeEnums;

            const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                productId,
                [ PRODUCT_COMPONENT ],
            );

            let productUpdateBody: DbRecordCreateUpdateDto;
            if(product[PRODUCT_COMPONENT] && product[PRODUCT_COMPONENT].dbRecords) {
                const productComponents = product[PRODUCT_COMPONENT].dbRecords;

                productUpdateBody = {
                    schemaId: product.schemaId,
                    properties: {
                        UnitPrice: ProductCalculations.computeUnitPrice(productComponents, product),
                        UnitCost: ProductCalculations.computeUnitCost(productComponents, product),
                        MinimumSalePrice: ProductCalculations.computeMinimumSalePrice(productComponents, product),
                    },
                };
            } else {
                productUpdateBody = {
                    schemaId: product.schemaId,
                    properties: {
                        UnitPrice: 0,
                        UnitCost: 0,
                        MinimumSalePrice: 0,
                    },
                };
            }

            return await this.dbService.updateDbRecordsByPrincipalAndId(
                principal,
                productId,
                productUpdateBody,
            );
        } catch (e) {
            console.error(e);
            console.error(e.validation[0]);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}

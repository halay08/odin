import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ProductsService } from '../products.service';


dotenv.config();

@Injectable()
export class ProductsComponentsService {

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
        @Inject(forwardRef(() => ProductsService)) productsService: ProductsService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.productsService = productsService;
    }

    /**
     * @param principal
     * @param productId
     * @param childRecordId
     * @param headers
     */
    public async addProductComponentsByPrincipal(
        principal: OrganizationUserEntity,
        productId: string,
        productComponentId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const { RESTRICTION } = SchemaModuleEntityTypeEnums;

            let componentRestrictionAssociations: DbRecordAssociationCreateUpdateDto[] = [];
            const component = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                productComponentId,
                [ RESTRICTION ],
            );
            if(component[RESTRICTION] && component[RESTRICTION].dbRecords) {
                for(const restriction of component[RESTRICTION].dbRecords) {
                    componentRestrictionAssociations.push({
                        recordId: restriction.id,
                    });
                }
                // add component associations
                await this.dbRecordsAssociationsService.createRelatedRecords(
                    principal,
                    {
                        recordId: productId,
                        body: componentRestrictionAssociations,
                    },
                );
            }

            return await this.productsService.computeProductTotals(principal, productId);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param dbRecordAssociation
     */
    public async removeComponentByPrincipal(
        principal: OrganizationUserEntity,
        dbRecordAssociation: DbRecordAssociationEntity,
    ): Promise<boolean> {
        try {
            const { RESTRICTION, PRODUCT_COMPONENT } = SchemaModuleEntityTypeEnums;

            const product = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                dbRecordAssociation.parentRecord.id,
                [ PRODUCT_COMPONENT, RESTRICTION ],
            );
            const component = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                dbRecordAssociation.childRecord.id,
                [ RESTRICTION ],
            );

            if(!product[PRODUCT_COMPONENT].dbRecords) {
                throw new ExceptionType(500, 'no product components to remove');
            }

            await this.productsService.computeProductTotals(principal, product.id);

            if(product[RESTRICTION] && product[RESTRICTION].dbRecords) {
                for(const restriction of product[RESTRICTION].dbRecords) {
                    // remove restrictions from the product if other components do not also have this restriction;
                    // await this.dbRecordsAssociationsService.deleteByPrincipalAndAssociationId(
                    //     principal,
                    //     restriction.dbRecordAssociation.id,
                    // );
                }
            }

            return true;
        } catch (e) {
            console.log(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}

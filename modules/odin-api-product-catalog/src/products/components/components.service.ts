import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { ProductsComponentsService } from './products.components.service';

const { PRODUCT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class ComponentsService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;
    private productsService: ProductsService;
    private productsComponentsService: ProductsComponentsService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        @Inject(forwardRef(() => ProductsService)) productsService: ProductsService,
        productsComponentsService: ProductsComponentsService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.productsService = productsService;
        this.productsComponentsService = productsComponentsService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param componentId
     */
    public async updateByPrincipalAndId(
        principal: OrganizationUserEntity,
        componentId: string,
    ): Promise<boolean> {
        try {
            const component = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                componentId,
                [ PRODUCT ],
            );
            for(const record of component[PRODUCT].dbRecords) {
                await this.productsService.computeProductTotals(principal, record.id);
            }
            return true;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}

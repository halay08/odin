import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';

const { BILLING_MODULE } = SchemaModuleTypeEnums;
const { INVOICE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class InvoicesItemsService {
    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) private readonly dbRecordsAssociationsService: DbRecordsAssociationsService,
        private readonly schemasService: SchemasService,
        private readonly invoicesService: InvoicesService,
    ) {
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.invoicesService = invoicesService;
        this.schemasService = schemasService;
    }

    /**
     *
     * @param principal
     * @param dbRecordAssociationId
     * @param headers
     */
    public async removeInvoiceItemFromInvoice(
        principal: OrganizationUserEntity,
        invoiceItemId: string,
    ): Promise<{ affected: number }> {
        try {

            const invoiceSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${BILLING_MODULE}:${INVOICE}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: invoiceItemId,
                    parentSchemaId: invoiceSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            for(const parentId of parentRecordIds) {
                await this.invoicesService.computeInvoiceTotals(principal, parentId);
            }

            return;
        } catch (e) {
            console.log(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


}

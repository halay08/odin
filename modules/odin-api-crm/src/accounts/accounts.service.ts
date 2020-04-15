import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import { AccountType } from './types/AccountType';


@Injectable()
export class AccountsService {
    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;

    constructor(
        schemasService: SchemasService,
        dbService: DbService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
    }

    private dbService: DbService;

    /**
     *
     * @param principal
     * @param leadId
     */
    public async createAccountFromLeadByPrincipal(
        principal: OrganizationUserEntity,
        leadId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const { ORGANIZATION, ADDRESS, CONTACT, NOTE } = SchemaModuleEntityTypeEnums;

            const lead = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                leadId,
                [ ORGANIZATION, ADDRESS, CONTACT, NOTE ],
            );

            const leadOrganization = lead[ORGANIZATION];
            const leadAddress = lead[ADDRESS];
            const leadContact = lead[CONTACT];
            const leadNote = lead[NOTE];

            // Create account from lead
            if(!!lead.title) {
                // Create a new record
                const newAccount = new AccountType();
                newAccount.Status = 'INACTIVE';
                newAccount.Type = getProperty(lead, 'Type');
                newAccount.GroupBilling = 'YES';

                const body = [
                    {
                        entity: `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ACCOUNT}`,
                        title: lead.title,
                        properties: newAccount,
                    },
                ];
                const accounts = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                    principal,
                    body,
                    { upsert: true },
                );
                // Transfer lead associations
                const transfers = [];
                if(leadContact && leadContact.dbRecords) {
                    for(const contact of leadContact.dbRecords) {
                        const transferPayload: DbRecordAssociationCreateUpdateDto = {
                            recordId: contact.id,
                        };
                        transfers.push(transferPayload);
                    }
                }
                if(leadNote && leadNote.dbRecords) {
                    for(const note of leadNote.dbRecords) {
                        const transferPayload: DbRecordAssociationCreateUpdateDto = {
                            recordId: note.id,
                        };
                        transfers.push(transferPayload);
                    }
                }
                if(leadOrganization && leadOrganization.dbRecords) {
                    for(const org of leadOrganization.dbRecords) {
                        const transferPayload: DbRecordAssociationCreateUpdateDto = {
                            recordId: org.id,
                        };
                        transfers.push(transferPayload);
                    }
                }

                if(leadAddress && leadAddress.dbRecords) {
                    for(const address of leadAddress.dbRecords) {
                        const transferPayload: DbRecordAssociationCreateUpdateDto = {
                            recordId: address.id,
                        };
                        transfers.push(transferPayload);
                    }
                }
                // TODO: this should be queued
                this.dbRecordsAssociationsService.transferRelatedRecords(
                    principal,
                    lead.id,
                    accounts[0].id,
                    transfers,
                );


                return accounts[0];
            } else {
                throw new ExceptionType(400, 'lead is missing a Name property');
            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}

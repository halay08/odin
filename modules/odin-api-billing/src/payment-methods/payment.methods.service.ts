import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppTypes } from '@d19n/models/dist/identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import { GocardlessCustomersBankAccountsService } from '../gocardless/customers/bank/accounts/gocardless.customers.bank.accounts.service';
import { GocardlessCustomerBankAccountEntity } from '../gocardless/customers/bank/accounts/types/gocardless.customer.bank.account.entity';
import { GocardlessCustomersService } from '../gocardless/customers/gocardless.customers.service';
import { GocardlessCustomersMandatesService } from '../gocardless/customers/mandates/gocardless.customers.mandates.service';
import { GocardlessCustomerMandateEntity } from '../gocardless/customers/mandates/types/gocardless.customer.mandate.entity';
import { GocardlessCustomerEntity } from '../gocardless/customers/types/gocardless.customer.entity';
import { PaymentMethodMandateCreate } from './types/payment.method.mandate.create';

@Injectable()
export class PaymentMethodsService {

    private schemasService: SchemasService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private dbService: DbService;

    private readonly gocardlessCustomersService: GocardlessCustomersService;
    private readonly gocardlessCustomersBankAccountService: GocardlessCustomersBankAccountsService;
    private readonly gocardlessCustomersMandatesService: GocardlessCustomersMandatesService;

    constructor(
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        gocardlessCustomersService: GocardlessCustomersService,
        gocardlessCustomersBankAccountService: GocardlessCustomersBankAccountsService,
        gocardlessCustomersMandatesService: GocardlessCustomersMandatesService,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.gocardlessCustomersService = gocardlessCustomersService;
        this.gocardlessCustomersBankAccountService = gocardlessCustomersBankAccountService;
        this.gocardlessCustomersMandatesService = gocardlessCustomersMandatesService;
    }

    public async createCustomerMandatePaymentMethod(
        principal: OrganizationUserEntity,
        headers,
        contactId: string,
        body: PaymentMethodMandateCreate,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            let provider: OrganizationAppTypes;
            provider = OrganizationAppTypes.GOCARDLESS;

            const { CRM_MODULE, BILLING_MODULE } = SchemaModuleTypeEnums;
            const { ADDRESS, CONTACT_IDENTITY, PAYMENT_METHOD } = SchemaModuleEntityTypeEnums;

            // Get the contact
            const contact = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                contactId,
                [],
            );

            // Get the contact
            const paymentMethodRes = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
                principal.organization,
                {
                    recordId: contactId,
                    entities: [
                        PAYMENT_METHOD,
                    ],
                    filters: [ `Provider:${provider}` ],
                },
            );

            const contactPaymentMethod = paymentMethodRes[PAYMENT_METHOD].dbRecords;

            // if the customer already has an active payment method return it.
            if(contactPaymentMethod) {

                const activeStatues = [ 'active', 'submitted', 'reinstated', 'created', 'pending_submission' ];
                const newStatuses = [ 'ACTIVE', 'SUBMITTED', 'REINSTATED', 'CREATED', 'PENDING_SUBMISSION' ];

                const activePaymentMethod = contactPaymentMethod.find((elem) =>
                    [ ...activeStatues, ...newStatuses ].includes(getProperty(elem, 'Status')));

                if(activePaymentMethod) {
                    return {
                        id: activePaymentMethod.id,
                        entity: activePaymentMethod.entity,
                    };
                }
            }

            // Get the contact
            const billingAddressRes = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
                principal.organization,
                {
                    recordId: contactId,
                    entities: [
                        ADDRESS,
                    ],
                    filters: [ `Type:BILLING` ],
                },
            );
            const billingAddress = billingAddressRes[ADDRESS].dbRecords;

            if(!billingAddress) {
                throw new ExceptionType(400, 'contact does not have a billing addresses');
            }


            // Get the contact
            const contactIdentityRes = await this.dbRecordsAssociationsService.getRelatedRecordsByEntity(
                principal.organization,
                {
                    recordId: contactId,
                    entities: [
                        CONTACT_IDENTITY,
                    ],
                },
            );
            const contactIdentities = contactIdentityRes[CONTACT_IDENTITY].dbRecords;
            const contactIdentity: DbRecordEntityTransform = contactIdentities ? contactIdentities.find(elem => elem.title === body.identityName) : null;

            // Find or create a gocardless customer
            let gocardlessCustomer: GocardlessCustomerEntity;
            if(!!contactIdentity) {
                // the customer has a gocardless profile
                const ExternalId = getProperty(contactIdentity, 'ExternalId');
                gocardlessCustomer = await this.gocardlessCustomersService.getCustomerById(
                    principal,
                    ExternalId,
                );
            }

            if(!gocardlessCustomer) {
                // Create a new customer does not exist
                const newCustomer = new GocardlessCustomerEntity();
                // Address properties
                newCustomer.addressLine1 = getProperty(billingAddress[0], 'AddressLine1');
                newCustomer.addressLine2 = getProperty(billingAddress[0], 'AddressLine2');
                newCustomer.city = getProperty(billingAddress[0], 'City');
                newCustomer.countryCode = getProperty(billingAddress[0], 'CountryCode');
                newCustomer.postalCode = getProperty(billingAddress[0], 'PostalCode');
                // Contact properties
                newCustomer.email = getProperty(contact, 'EmailAddress');
                newCustomer.familyName = getProperty(contact, 'LastName');
                newCustomer.givenName = getProperty(contact, 'FirstName');

                gocardlessCustomer = await this.gocardlessCustomersService.createCustomer(
                    principal,
                    newCustomer,
                );

                // Create a new identity
                await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [
                    {
                        entity: `${CRM_MODULE}:${CONTACT_IDENTITY}`,
                        title: body.identityName,
                        properties: {
                            ExternalId: gocardlessCustomer.id,
                        },
                        associations: [
                            {
                                recordId: contact.id,
                            },
                        ],
                    },
                ], { upsert: true });
            }

            let bankAccount: GocardlessCustomerBankAccountEntity;
            if(contactPaymentMethod) {
                const bankAccountId = getProperty(contactPaymentMethod[0], 'BankAccountId');

                bankAccount = await this.gocardlessCustomersBankAccountService.getCustomerBankAccountById(
                    principal,
                    bankAccountId,
                );
            }

            if(!bankAccount) {
                // Create a new bank account
                const newBankAccount = new GocardlessCustomerBankAccountEntity();
                newBankAccount.accountHolderName = gocardlessCustomer.givenName + ' ' + gocardlessCustomer.familyName;
                newBankAccount.accountNumber = body.bankDetails.accountNumber;
                newBankAccount.branchCode = body.bankDetails.branchCode;
                newBankAccount.countryCode = gocardlessCustomer.countryCode;
                newBankAccount.currency = 'GBP'; // TODO: This should come from the Organization
                newBankAccount.links = {
                    customer: gocardlessCustomer.id,
                };

                try {
                    bankAccount = await this.gocardlessCustomersBankAccountService.createCustomerBankAccount(
                        principal,
                        newBankAccount,
                    );
                } catch (e) {
                    if(e.statusCode === 409) {
                        bankAccount = await this.gocardlessCustomersBankAccountService.getCustomerBankAccountById(
                            principal,
                            e.data['customer_bank_account'],
                        );
                    } else {
                        throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
                    }
                }
            }
            // Create a new mandate
            const newMandate = new GocardlessCustomerMandateEntity();
            newMandate.scheme = 'bacs';
            newMandate.links = {
                customer_bank_account: bankAccount.id,
                creditor: gocardlessCustomer.id,
            };
            const mandate: GocardlessCustomerMandateEntity = await this.gocardlessCustomersMandatesService.createCustomerMandate(
                principal,
                newMandate,
            );
            // Save payment method
            const newPaymentMethod = await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [
                {
                    entity: `${BILLING_MODULE}:${PAYMENT_METHOD}`,
                    title: provider,
                    properties: {
                        Provider: provider,
                        Type: 'MANDATE',
                        Status: mandate.status,
                        Default: 'YES',
                        BankAccountId: bankAccount.id,
                        ExternalRef: mandate.id,
                        AuthorizedDirectDebit: body.authorizedDirectDebit,
                    },
                    associations: [
                        {
                            recordId: contact.id,
                        },
                    ],
                },
            ], { upsert: true });
            if(!newPaymentMethod) {
                throw new ExceptionType(500, 'could not create payment method');
            }

            return newPaymentMethod[0];
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
        }
    }
}

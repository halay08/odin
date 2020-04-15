import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GocardlessBankLookupController } from './bank-lookup/gocardless.bank.lookup.controller';
import { GocardlessBankLookupService } from './bank-lookup/gocardless.bank.lookup.service';
import { GocardlessCustomersBankAccountsController } from './customers/bank/accounts/gocardless.customers.bank.accounts.controller';
import { GocardlessCustomersBankAccountsService } from './customers/bank/accounts/gocardless.customers.bank.accounts.service';
import { GocardlessCustomersController } from './customers/gocardless.customers.controller';
import { GocardlessCustomersService } from './customers/gocardless.customers.service';
import { GocardlessCustomersMandatesController } from './customers/mandates/gocardless.customers.mandates.controller';
import { GocardlessCustomersMandatesService } from './customers/mandates/gocardless.customers.mandates.service';
import { GocardlessEventsController } from './events/gocardless.events.controller';
import { EventsService } from './events/gocardless.events.service';
import { GocardlessPaymentsController } from './payments/gocardless.payments.controller';
import { GocardlessPaymentsService } from './payments/gocardless.payments.service';
import { GocardlessRefundsController } from './refunds/gocardless.refunds.controller';
import { GocardlessRefundsService } from './refunds/gocardless.refunds.service';
import { GocardlessWebhookController } from './webhook/gocardless.webhook.controller';
import { GocardlessWebhookRepository } from './webhook/gocardless.webhook.repository';
import { GocardlessWebhookService } from './webhook/gocardless.webhook.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ GocardlessWebhookRepository ]),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        GocardlessCustomersController,
        GocardlessCustomersBankAccountsController,
        GocardlessCustomersMandatesController,
        GocardlessBankLookupController,
        GocardlessPaymentsController,
        GocardlessRefundsController,
        GocardlessWebhookController,
        GocardlessEventsController,
    ],
    providers: [
        GocardlessCustomersService,
        GocardlessCustomersBankAccountsService,
        GocardlessCustomersMandatesService,
        GocardlessBankLookupService,
        GocardlessPaymentsService,
        GocardlessRefundsService,
        GocardlessWebhookService,
        EventsService,
    ],
    exports: [
        GocardlessCustomersService,
        GocardlessCustomersBankAccountsService,
        GocardlessCustomersMandatesService,
        GocardlessBankLookupService,
        GocardlessPaymentsService,
        GocardlessRefundsService,
        GocardlessWebhookService,
        EventsService,
    ],
})

export class GocardlessModule {
}

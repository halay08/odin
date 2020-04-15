import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GocardlessEventEntity } from './events/types/gocardless.event.entity';
import { GocardlessWebhookRepository } from './gocardless.webhook.repository';

@Injectable()
export class GocardlessWebhookService {

    private gocardlessWebhookRepository: GocardlessWebhookRepository;

    constructor(@InjectRepository(GocardlessWebhookRepository) gocardlessWebhookRepository: GocardlessWebhookRepository) {
        this.gocardlessWebhookRepository = gocardlessWebhookRepository;
    }

    /**
     *
     * @param headers
     * @param body
     */
    // @ts-ignore
    public async webhook(
        headers: object,
        body: any,
    ): Promise<any> {
        try {
            console.log('headers', headers, 'body', body);
            const creates = [];
            for(const event of body.events) {

                const eventCreate = new GocardlessEventEntity();
                eventCreate.id = event.id;
                eventCreate.resource_type = event.resource_type;
                eventCreate.action = event.action;
                eventCreate.details_bank_account_id = event.details.bank_account_id;
                eventCreate.details_cause = event.details.cause;
                eventCreate.details_currency = event.details.currency;
                eventCreate.details_description = event.details.description;
                eventCreate.details_not_retried_reason = event.details.not_retried_reason;
                eventCreate.details_origin = event.details.origin;
                eventCreate.details_property = event.details.property;
                eventCreate.reason_code = event.reason_code;
                eventCreate.details_will_attempt_retry = event.details.will_attempt_retry;
                eventCreate.metadata = event.metadata;
                eventCreate.links_creditor = event.links.creditor;
                eventCreate.links_instalment_schedule = event.links.instalment_schedule;
                eventCreate.links_mandate = event.links.mandate;
                eventCreate.links_new_customer_bank_account = event.links.new_customer_bank_account;
                eventCreate.links_previous_customer_bank_account = event.links.previous_customer_bank_account;
                eventCreate.links_new_mandate = event.links.new_mandate;
                eventCreate.links_organization = event.links.organization;
                eventCreate.links_parent_event = event.links.parent_event;
                eventCreate.links_payment = event.links.payment;
                eventCreate.links_payout = event.links.payout;
                eventCreate.links_refund = event.links.refund;
                eventCreate.links_subscription = event.links.subscription;
                eventCreate.createdAt = event.created_at;
                creates.push(eventCreate);

            }

            return await this.gocardlessWebhookRepository.save(creates);
        } catch (e) {
            console.error(e);
            // throw new ExceptionType(500, e.message);
        }
    }

}

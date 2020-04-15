/**
 * https://developer.gocardless.com/api-reference/#core-endpoints-events
 */
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'gocardless.events' })
export class GocardlessEventEntity {
    /**
     * Unique identifier, beginning with “EV”.
     * Example: "ev789"
     * id
     */
    @PrimaryColumn()
    public id: string;
    /**
     * The resource type for this event
     * payments | mandates | payouts | refunds | subscriptions | instalment_schedules | creditors
     */
    @Column({ type: 'varchar', nullable: true })
    public resource_type: string;
    /**
     * What has happened to the resource.
     * Example: "transferred"
     */
    @Column({ type: 'varchar', nullable: true })
    public action: string;
    /**
     * sent when a creditor new_payout_currency_added webhook
     */
    @Column({ type: 'varchar', nullable: true })
    public details_bank_account_id: string;
    /**
     * what triggered the event
     */
    @Column({ type: 'varchar', nullable: true })
    public details_cause: string;
    /**
     * what triggered the event
     * sent when a creditor new_payout_currency_added webhook
     */
    @Column({ type: 'varchar', nullable: true })
    public details_currency: string;
    /**
     * what triggered the event
     * human readable description of the cause
     */
    @Column({ type: 'varchar', nullable: true })
    public details_description: string;
    /**
     * what triggered the event
     * failure_filter_applied | other
     */
    @Column({ type: 'varchar', nullable: true })
    public details_not_retried_reason: string;
    /**
     * Who initiated the event
     * bank | gocardless | api | customer
     */
    @Column({ type: 'varchar', nullable: true })
    public details_origin: string;
    /**
     * sent when a creditor creditor_updated webhook
     */
    @Column({ type: 'varchar', nullable: true })
    public details_property: string;
    /**
     * Set when a bank is the origin of the event
     */
    @Column({ type: 'varchar', nullable: true })
    public reason_code: string;
    /**
     * whether the payment will be retried automatically
     */
    @Column({ type: 'varchar', nullable: true })
    public details_will_attempt_retry: string;
    /**
     * If the details[origin] is api, this will contain any metadata you specified when triggering this event
     */
    @Column({ type: 'jsonb', nullable: true })
    public metadata: any;
    /**
     * If resource_type is creditor, this is the ID of the creditor
     */
    @Column({ type: 'varchar', nullable: true })
    public links_creditor: string;
    /**
     * If resource_type is instalment_schedule, this is the ID of the instalment_schedule
     */
    @Column({ type: 'varchar', nullable: true })
    public links_instalment_schedule: string;
    /**
     * If resource_type is mandates, this is the ID of the mandate
     */
    @Column({ type: 'varchar', nullable: true })
    public links_mandate: string;
    /**
     * This is only included for mandate transfer events
     */
    @Column({ type: 'varchar', nullable: true })
    public links_new_customer_bank_account: string;
    /**
     * This is only included for mandate transfer events
     */
    @Column({ type: 'varchar', nullable: true })
    public links_previous_customer_bank_account: string;
    /**
     * This is only included for mandate replaced events
     */
    @Column({ type: 'varchar', nullable: true })
    public links_new_mandate: string;
    /**
     * for Oauth app  this is the ID of the account to which it belongs
     */
    @Column({ type: 'varchar', nullable: true })
    public links_organization: string;
    /**
     * If this event was caused by another, this is the ID of the cause
     */
    @Column({ type: 'varchar', nullable: true })
    public links_parent_event: string;
    /**
     * If resource_type is payments, this is the ID of the payment
     */
    @Column({ type: 'varchar', nullable: true })
    public links_payment: string;
    /**
     * If resource_type is payouts, this is the ID of the payout
     */
    @Column({ type: 'varchar', nullable: true })
    public links_payout: string;
    /**
     * If resource_type is refunds, this is the ID of the refund
     */
    @Column({ type: 'varchar', nullable: true })
    public links_refund: string;
    /**
     * If resource_type is subscriptions, this is the ID of the subscription
     */
    @Column({ type: 'varchar', nullable: true })
    public links_subscription: string;

    @CreateDateColumn()
    public createdAt?: Date;

    @UpdateDateColumn()
    public updatedAt?: Date;

}

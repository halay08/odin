import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import * as dayjs from "dayjs";
import { EmptyRequest } from './dashboards.dto';
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc)


@Injectable()
export class DashboardsService {
    private readonly odinConnection: Connection;

    constructor(
        @InjectConnection() odinConnection: Connection,
    ) {
        this.odinConnection = odinConnection;
    }


    /**
     * Count of invoices expected to be created in the last bill run
     */
    public async getInvoicesCreatedPlanLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            const union = await this.odinConnection.query(
                `select  c3.value as next_invoice_date, sum(c2.value::double precision), count(distinct(r1.id)), 1 as order
                    from db_records r
                    -- left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'BillingPeriodType')
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'TotalPrice')
                    left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'BillingStartDate')
                    left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                    left join db_records r1 on (r1.id = a.parent_record_id)
                    left join pipelines_stages s on (r1.stage_id = s.id)
                    where r.entity = 'OrderModule:OrderItem'
                    and s.key = 'OrderStageActive'
                    and r.deleted_at is null
                    and to_timestamp(c3.value, 'YYYY-MM-DD') < now() - interval '1 days'
                    and to_timestamp(c3.value, 'YYYY-MM-DD') >= now() - interval '2 days'
                    group by  c3.value
                    union all
                    select  c3.value as next_invoice_date, sum(c2.value::double precision), count(distinct(r1.id)), 2 as order
                    from db_records r
                    -- left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'BillingPeriodType')
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'TotalPrice')
                    left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'NextInvoiceDate')
                    left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                    left join db_records r1 on (r1.id = a.parent_record_id)
                    left join pipelines_stages s on (r1.stage_id = s.id)
                    where r.entity = 'OrderModule:OrderItem'
                    and s.key = 'OrderStageActive'
                    and r.deleted_at is null
                    and to_timestamp(c3.value, 'YYYY-MM-DD') < now() + interval '7 days'
                    and to_timestamp(c3.value, 'YYYY-MM-DD') >= now() + interval '6 days'
                    group by c3.value
                    order by 4
                `);
            const new_ordersArray = union.filter(item => item.order === 1)
            const recurring_ordersArray = union.filter(item => item.order === 2)
            const new_orders=+new_ordersArray?.[0]?.count||0
            const recurring_orders=+recurring_ordersArray?.[0]?.count || 0
            return { new_orders, recurring_orders, sum: new_orders + recurring_orders }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Breakdown of invoices expected to be created in the last bill run
     */
     public async getInvoicesBreakdownCreatedPlanLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select  r1.title, r1.id, 'new_orders' as description
                from db_records r
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'TotalPrice')
                left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'BillingStartDate')
                left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                left join db_records r1 on (r1.id = a.parent_record_id)
                left join pipelines_stages s on (r1.stage_id = s.id)
                where r.entity = 'OrderModule:OrderItem'
                and s.key = 'OrderStageActive'
                and r.deleted_at is null
                and to_timestamp(c3.value, 'YYYY-MM-DD') < now() - interval '1 days'
                and to_timestamp(c3.value, 'YYYY-MM-DD') >= now() - interval '2 days'
                group by r1.id, r1.title
                union all
                select  r1.title, r1.id, 'recurring_orders' as description
                from db_records r
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'TotalPrice')
                left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'NextInvoiceDate')
                left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                left join db_records r1 on (r1.id = a.parent_record_id)
                left join pipelines_stages s on (r1.stage_id = s.id)
                where r.entity = 'OrderModule:OrderItem'
                and s.key = 'OrderStageActive'
                and r.deleted_at is null
                and to_timestamp(c3.value, 'YYYY-MM-DD') < now() + interval '7 days'
                and to_timestamp(c3.value, 'YYYY-MM-DD') >= now() + interval '6 days'
                group by r1.id, r1.title
                `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * Count of invoices created in the last bill run
     */
    public async getInvoicesCreatedFactLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select count(*)
                from db_records r
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Balance')
                left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                left join db_records r1 on (r1.id = a.parent_record_id)
                where r.entity = 'BillingModule:Invoice'
                and r.deleted_at is null
                and r.created_at < now()
                and r.created_at > now() - interval '1 days'
                `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     * Breakdown of invoices created in the last bill run
     */
         public async getInvoicesBreakdownCreatedFactLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
            try {
                return await this.odinConnection.query(
                    `select r1.title, r1.id
                    from db_records r
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Balance')
                    left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
                    left join db_records r1 on (r1.id = a.parent_record_id)
                    where r.entity = 'BillingModule:Invoice'
                    and r.deleted_at is null
                    and r.created_at < now()
                    and r.created_at > now() - interval '1 days'
                    group by r1.id, r1.title
                    `);
            } catch (e) {
                console.error(e);
                throw new ExceptionType(e.statusCode, e.message);
            }
        }

    /**
     * Number of invoices where processed in the last bill run
     */
    public async getInvoicesProcessedLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select count(*)
                    from db_records r
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Status')
                    where r.entity = 'BillingModule:Invoice'
                    and r.deleted_at is null
                    and r.created_at < now()
                    and r.created_at > now() - interval '1 days'
                    and c2.value in ('PAID', 'PAYMENT_PENDING')
                    `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Number of transactions created during the last bill run
     */
    public async getTransactionsCreatedLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select count(*)
                from db_records r
                left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
                left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Amount')
                where entity = 'BillingModule:Transaction'
                and c.value = 'PAYMENT'
                and r.deleted_at is null
                and r.created_at < '${dayjs.utc().startOf('day').add(65, 'minute').toISOString()}'
                and r.created_at > '${dayjs.utc().startOf('day').add(59, 'minute').toISOString()}' 
                `);


        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Number of transactions updated since the last bill run
     */
    public async getTransactionsUpdatedSinceLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select count(*)
                    from db_records r
                    left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
                    left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Amount')
                    where entity = 'BillingModule:Transaction'
                    and c.value = 'PAYMENT'
                    and r.deleted_at is null
                    and r.created_at < now() - interval '1 days'
                    and r.updated_at > '${dayjs.utc().startOf('day').add(65, 'minute').toISOString()}'
                    `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     * Number of invoices are scheduled to be processed in the last bill run
     */
    public async getInvoicesScheduledLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select count(*)
                from db_records r
                left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                where r.entity = 'BillingModule:Invoice'
                and c1.value='SCHEDULED'
                and r.deleted_at is null
                and r.created_at < now()
                and r.created_at > now() - interval '1 days'
                `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * List breakdown of invoices where processed
     */
    public async getInvoicesBreakdownProcessedLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select r.title, r.id, c1.value status, r.created_at, r.updated_at
                    from db_records r
                    left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                    where r.entity = 'BillingModule:Invoice'
                    and r.deleted_at is null
                    and r.created_at < now()
                    and r.created_at > now() - interval '1 days'
                    and c1.value in ('PAID', 'PAYMENT_PENDING')
                    `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * List breakdown of transactions created during the bill run
     */
    public async getTransactionsBreakdownCreatedLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select r.title, r.id, c1.value status, r.created_at, r.updated_at
                from db_records r
                left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
                left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Amount')
            where entity = 'BillingModule:Transaction'
            and c.value = 'PAYMENT'
            and r.deleted_at is null
            and r.created_at < '${dayjs.utc().startOf('day').add(65, 'minute').toISOString()}'
            and r.created_at > '${dayjs.utc().startOf('day').add(59, 'minute').toISOString()}' 
            `);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * List breakdown of transactions updated since the last bill run
     */
    public async getTransactionsBreakdownUpdatedSinceLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select r.title, r.id, c1.value status, r.created_at, r.updated_at
                from db_records r
                left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
                left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Amount')
                where entity = 'BillingModule:Transaction'
                and c.value = 'PAYMENT'
                and r.deleted_at is null
                and r.created_at < now() - interval '1 days'
                and r.updated_at > '${dayjs.utc().startOf('day').add(65, 'minute').toISOString()}'
                `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * List breakdown of transactions created since the last bill run
     */
    public async getTransactionsBreakdownCreatedSinceLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
       try {
           return await this.odinConnection.query(
               `select r.title, r.id, c1.value status, r.created_at, r.updated_at
               from db_records r
               left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
               left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
               left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Amount')
               where entity = 'BillingModule:Transaction'
               and c.value = 'PAYMENT'
               and r.deleted_at is null
               and r.created_at > '${dayjs.utc().startOf('day').add(65, 'minute').toISOString()}'
               `);
       } catch (e) {
           console.error(e);
           throw new ExceptionType(e.statusCode, e.message);
       }
    
    }

    /**
     * List breakdown of invoices are scheduled to be processed
     */
    public async getInvoicesBreakdownScheduledLastBillRun(principal: OrganizationUserEntity, body: EmptyRequest): Promise<any> {
        try {
            return await this.odinConnection.query(
                `select r.title, r.id, c1.value status, r.created_at, r.updated_at
                from db_records r
                left join db_records_columns c1 on (r.id = c1.record_id and c1.column_name = 'Status')
                where r.entity = 'BillingModule:Invoice'
                and c1.value='SCHEDULED'
                and r.deleted_at is null
                and r.created_at < now()
                and r.created_at > now() - interval '1 days'
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }





}
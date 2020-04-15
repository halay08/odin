import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { FromToRequest } from './dashboards.dto';
import * as dayjs from "dayjs";


@Injectable()
export class DashboardsService {
    private readonly odinConnection: Connection;

    constructor(
        @InjectConnection() odinConnection: Connection,
    ) {
        this.odinConnection = odinConnection;
    }

    private convertAnyDateFormat(oldFrom, OldTo) {
        let from, to
        if (oldFrom) {
            //to convert any string date format to the needed
            from = dayjs(oldFrom).toISOString()

        }
        if (OldTo) {
            //to convert any string date format to the needed
            to = dayjs(OldTo).toISOString()

        }
        return { from, to }
    }



    /**
     * Total visits in the period selected
     */
    public async getTotalVisits(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                count(*)
                from db_records r
                where r.entity = 'CrmModule:Visit'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * Total visits % change compared to the previous period selected
     */
    public async getTotalVisitsChange(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const initialDateFrom = dayjs(body.from)
            const initialDateTo = dayjs(body.to)
            const diff = initialDateTo.diff(initialDateFrom)
            const previousPeriodDateFrom = initialDateFrom.subtract(diff, 'milliseconds').toISOString()

            const currentPeriodPromise = this.getTotalVisits(principal, body)
            const previousPeriodPromise = this.getTotalVisits(principal, {
                from: previousPeriodDateFrom,
                to: initialDateFrom.toISOString()
            })
            const promiseResult = await Promise.all([currentPeriodPromise, previousPeriodPromise])
            let change = Math.round((+promiseResult[0][0]?.count / +promiseResult[1][0]?.count - 1) * 100) || 0
            change = isFinite(change) ? change : 100;
            return [{ change }]

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * Total visits grouped by Outcome in the period selected
     */
    public async getVisitsByOutcome(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                c.value as outcome,
                count(*)
                from db_records r
                left join db_records_columns c on (c.record_id = r.id and c.column_name = 'Outcome')
                where r.entity = 'CrmModule:Visit'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by c.value
                order by 2 desc
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Total visits grouped by user who created the visits in the period selected
     */
    public async getVisitsByUsers(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                concat(c.lastname, ' ',c.firstname) as name,
                count(*)
                from db_records r
                left join organizations_users c on (r.created_by_id = c.id )
                where r.entity = 'CrmModule:Visit'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by concat(c.lastname, ' ',c.firstname)
                order by 2 desc
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     *  Total visits grouped by NotInterestedReason in the period selected
     */
    public async getVisitsByNotInterestedReason(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                c1.value as NotInterstedReason,
                count(*)
                from db_records r
                left join db_records_columns c on (c.record_id = r.id AND c.column_name = 'Outcome')
                left join db_records_columns c1 on (c1.record_id = r.id AND c1.column_name = 'NotInterestedReason')
                where r.entity = 'CrmModule:Visit'
                and r.deleted_at is null
                and c.value = 'NOT_INTERESTED'
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by c1.value
                order by 2 desc
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Total leads in the period selected
     */
    public async getLeads(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                count(*)
                from db_records r
                where r.entity = 'CrmModule:Lead'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * Total leads grouped by Source in the period selected
     */
    public async getLeadsBySource(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                c.value as source,
                count(*)
                from db_records r
                left join db_records_columns c on (c.record_id = r.id AND c.column_name = 'Source')
                where r.entity = 'CrmModule:Lead'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by c.value
                order by 2 desc
            `);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Total leads grouped by user who created the leads in the period selected
     */
    public async getLeadsByUser(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                concat(c.lastname, ' ',c.firstname) as name,
                count(*)
                from db_records r
                left join organizations_users c on (r.created_by_id = c.id )
                where r.entity = 'CrmModule:Lead'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by 1
                order by 2 desc
            `);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


    /**
     * Total leads grouped by Address SalesStatus in the period selected
     */
    public async getLeadsBySalesStatus(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                c.value,
                count(r.id)
                from db_records r
                left join db_records_associations a on (a.parent_record_id = r.id and a.child_entity = 'CrmModule:Address') --- join address
                left join db_records r1 on (a.child_record_id = r1.id)
                left join db_records_columns c on (c.record_id = r1.id and c.column_name = 'SalesStatus')
                where r.entity = 'CrmModule:Lead'
                and r.deleted_at is null
                and r.created_at >= '${(from)}'
                and r.created_at <= '${(to)}'
                group by c.value
                order by 2 desc
            `);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *  Leads that have an address sales status ORDER or PRE_ORDER and do not have an active order ie (not cancelled)
     */
    public async getLeadsBySalesStatusInOrderPreOrderNotCancelled(principal: OrganizationUserEntity, body: FromToRequest): Promise<any> {
        try {
            const { from, to } = this.convertAnyDateFormat(body.from, body.to)
            return await this.odinConnection.query(
                `select
                c.value salesstatus,
                sum(c1.value::double precision),
                count(r.id)
            from db_records r
            left join db_records_columns c1 on (c1.record_id = r.id and c1.column_name = 'TotalValue')
            left join db_records_associations a on (a.parent_record_id = r.id and a.child_entity = 'CrmModule:Address')
            left join db_records r1 on (a.child_record_id = r1.id)
            left join db_records_columns c on (c.record_id = r1.id and c.column_name = 'SalesStatus')
            where r.entity = 'CrmModule:Lead'
            and r.deleted_at is null
            and r.created_at >= '${(from)}'
            and r.created_at <= '${(to)}'
            and c.value in ('ORDER', 'PRE_ORDER')
            and not exists (
                select r2.id
                from db_records r2
                left join pipelines_stages s on (s.id = r2.stage_id)
                left join db_records_associations a on (a.child_record_id = r1.id and a.parent_entity = 'OrderModule:Order')
                where r2.entity = 'OrderModule:Order'
                and r2.id = a.parent_record_id
                and s.key not in ('OrderStageCancelled')
            )
            group by 1
            order by 2 desc nulls last
            `);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

}




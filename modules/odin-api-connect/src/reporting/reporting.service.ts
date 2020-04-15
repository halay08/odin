import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { chunkArray } from '../helpers/utilities';


@Injectable()
export class ReportingService {


    private readonly connection: Connection;
    private readonly myahConnection: Connection;
    private readonly cosmosConnection: Connection;

    constructor(
        @InjectConnection('odinDb') connection: Connection,
        @InjectConnection('myahDatabase') myahConnection: Connection,
        @InjectConnection('cosmosDatabase') cosmosConnection: Connection,
    ) {
        this.connection = connection;
        this.myahConnection = myahConnection;
        this.cosmosConnection = cosmosConnection;
    }

    /**
     * gets weekly sales, reps, order data
     */
    public async ordersOverview(principal: OrganizationUserEntity, query: { orderStageKey: string }) {
        try {

            const activeOrderValue = await this.connection.query(`SELECT
            to_char(float8 (SUM(Val_TotalPrice.value::double precision)), 'FM999999999.00') total_gross,
            to_char(float8 (SUM(Val_TotalPrice.value::double precision)) / 1.2, 'FM999999999.00') total_excluding_vat
            FROM db_records as Order__Records
            RIGHT JOIN pipelines_stages as pipe_stages ON (Order__Records.stage_id = pipe_stages.id)
            LEFT JOIN SCHEMAS AS Order__Schema ON (Order__Records.schema_id = Order__Schema.id)
            RIGHT JOIN schemas_columns AS Col__TotalPrice ON (Order__Schema.id = Col__TotalPrice.schema_id AND Col__TotalPrice.name = 'TotalPrice')
            RIGHT JOIN db_records_columns AS Val_TotalPrice ON (Val_TotalPrice.record_id = Order__Records.id AND Col__TotalPrice.id = Val_TotalPrice.column_id)
            WHERE Order__Schema.entity_name = 'Order'
            AND Order__Records.deleted_at IS NULL
            AND pipe_stages.key = '${query.orderStageKey}';`,
            );

            const activeAddresses = await this.connection.query(`SELECT count(*) as connected_addresses FROM db_records AS Addresses
            LEFT JOIN SCHEMAS AS Addr_schema ON (Addresses.schema_id = Addr_schema.id)
            WHERE Addr_schema.entity_name = 'Address'
            AND EXISTS (
                SELECT associations.id
                FROM db_records_associations AS associations
                RIGHT JOIN schemas AS order_schema ON (order_schema.id = associations.parent_schema_id)
                WHERE order_schema.entity_name = 'Order'
                AND addresses.deleted_at IS NULL
                AND EXISTS (
                    SELECT order_records.id
                    FROM db_records AS order_records
                    RIGHT JOIN pipelines_stages as pipe_stages ON (order_records.stage_id = pipe_stages.id)
                    WHERE pipe_stages.key = '${query.orderStageKey}'
                    AND order_records.id = associations.parent_record_id
                    AND order_records.deleted_at IS NULL
                )
                AND associations.deleted_at IS NULL
                AND associations.child_record_id = Addresses.id
                );`,
            );

            const grossOrderValue = activeOrderValue[0] ? activeOrderValue[0].total_gross : 0;
            const netOrderValue = activeOrderValue[0] ? activeOrderValue[0].total_excluding_vat : 0;
            const connectedAddresses = activeAddresses[0] ? activeAddresses[0].connected_addresses : 0;
            const arpu = Number(Number(netOrderValue) / Number(connectedAddresses)).toFixed(2);

            const busBaseBroadband = await this.getProductMix(
                'BASE_PRODUCT',
                'BROADBAND',
                'BUSINESS',
                query.orderStageKey,
                connectedAddresses,
            );
            const resBaseBroadband = await this.getProductMix(
                'BASE_PRODUCT',
                'BROADBAND',
                'RESIDENTIAL',
                query.orderStageKey,
                connectedAddresses,
            );
            const resAddOnBroadband = await this.getProductMix(
                'ADD_ON_PRODUCT',
                'BROADBAND',
                'RESIDENTIAL',
                query.orderStageKey,
                connectedAddresses,
            );
            const resBaseVoice = await this.getProductMix(
                'BASE_PRODUCT',
                'VOICE',
                'RESIDENTIAL',
                query.orderStageKey,
                connectedAddresses,
            );

            const resAddOnVoice = await this.getProductMix(
                'ADD_ON_PRODUCT',
                'VOICE',
                'RESIDENTIAL',
                query.orderStageKey,
                connectedAddresses,
            );

            console.log({
                grossOrderValue,
                netOrderValue,
                connectedAddresses,
                arpu,
                busBaseBroadband,
                resBaseBroadband,
                resAddOnBroadband,
                resBaseVoice,
                resAddOnVoice,
            });

            return {
                grossOrderValue,
                netOrderValue,
                connectedAddresses,
                arpu,
                busBaseBroadband,
                resBaseBroadband,
                resAddOnBroadband,
                resBaseVoice,
                resAddOnVoice,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param productType
     * @param productCategory
     * @param productCustomerType
     */
    public async getProductMix(
        productType: string,
        productCategory: string,
        productCustomerType: string,
        orderStageKey: string,
        cohortTotal?: string,
    ) {

        try {
            console.log('cohortTotal', cohortTotal);
            return await this.connection.query(`SELECT
        dbr.title as line_item_name,
        SUM(dbrc2.value::integer) as line_item_count,
        CAST(100 * SUM(dbrc2.value::integer) / ${cohortTotal ? cohortTotal : 'SUM(SUM(dbrc2.value::integer)) OVER ()'} AS numeric(10, 2)) percentage,
        Val__ProdCat.value as product_category,
        Val__ProdType.value as product_type,
        Val__ProdCustType.value as customer_type
        FROM db_records as dbr
        LEFT JOIN schemas s1 ON dbr.schema_id = s1.id
        RIGHT JOIN schemas_columns AS sc2 ON (dbr.schema_id = sc2.schema_id AND sc2.name = 'Quantity')
        RIGHT JOIN db_records_columns AS dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id)
        RIGHT JOIN schemas_columns AS Col__ProdType ON (dbr.schema_id = Col__ProdType.schema_id AND Col__ProdType.name = 'ProductType')
        RIGHT JOIN db_records_columns AS Val__ProdType ON (Val__ProdType.record_id = dbr.id AND Col__ProdType.id = Val__ProdType.column_id)
        RIGHT JOIN schemas_columns AS Col__ProdCat ON (dbr.schema_id = Col__ProdCat.schema_id  AND Col__ProdCat.name = 'ProductCategory')
        RIGHT JOIN db_records_columns AS Val__ProdCat ON (Val__ProdCat.record_id = dbr.id AND Col__ProdCat.id = Val__ProdCat.column_id)
        RIGHT JOIN schemas_columns AS Col__ProdCustType ON (dbr.schema_id = Col__ProdCustType.schema_id  AND Col__ProdCustType.name = 'ProductCustomerType')
        RIGHT JOIN db_records_columns AS Val__ProdCustType ON (Val__ProdCustType.record_id = dbr.id AND Col__ProdCustType.id = Val__ProdCustType.column_id)
        WHERE s1.entity_name = 'OrderItem'
        AND dbr.deleted_at IS NULL
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS order_schema ON (order_schema.id = associations.parent_schema_id)
            WHERE order_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
            AND EXISTS (
                SELECT order_records.id
                FROM db_records AS order_records
                RIGHT JOIN pipelines_stages as pipe_stages ON (order_records.stage_id = pipe_stages.id)
                WHERE pipe_stages.key = '${orderStageKey}'
                AND order_records.id = associations.parent_record_id
            )
            AND associations.child_record_id = dbr.id
            )
        AND dbr.deleted_at IS NULL
        AND Val__ProdCustType.value = '${productCustomerType}'
        AND Val__ProdType.value = '${productType}'
        AND Val__ProdCat.value = '${productCategory}'
        GROUP BY line_item_name, Val__ProdCat.value, Val__ProdType.value, Val__ProdCustType.value;`);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param query
     */
    public async pipelinesOverview(
        principal: OrganizationUserEntity,
        query: { moduleName?: string, entityName?: string },
    ) {
        let pgQuery = null;
        if(!!query.moduleName && !!query.entityName) {
            pgQuery = `WHERE pipe.module_name = ${query.moduleName} AND pip.entity_name = ${query.entityName} AND dbr.deleted_at IS NULL`;
        }
        if(!!query.entityName) {
            pgQuery = `WHERE pipe.entity_name = ${query.entityName} AND dbr.deleted_at IS NULL`;
        }

        if(!pgQuery) {
            return await this.connection.query(`SELECT \
            pipe.module_name as module_name, \
            pipe.entity_name as entity_name, \
            pipe.name as pipeline_name, \
            stg.name as stage_name, \
            stg.key as stage_key,
            stg.id as stage_id, \
            pipe.id as pipeline_id, \
            count(dbr.id) as records \
            FROM pipelines_stages as stg \
            LEFT JOIN db_records as dbr ON (dbr.stage_id = stg.id) \
            LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
            LEFT JOIN pipelines pipe ON pipe.id = stg.pipeline_id \
            WHERE dbr.deleted_at IS NULL \
            AND stg.is_fail = false \
            GROUP BY pipeline_name, stage_name, stg.position, pipe.module_name, pipe.entity_name, stg.key, stg.id, pipe.id \
            ORDER BY pipeline_name, stg.position, pipe.module_name, pipe.entity_name;`);

        } else {
            return await this.connection.query(`SELECT \
            pipe.module_name as module_name, \
            pipe.entity_name as entity_name, \
            pipe.name as pipeline_name, \
            stg.name as stage_name, \
            stg.key as stage_key,
            stg.id as stage_id, \
            pipe.id as pipeline_id, \
            count(dbr.id) as records \
            FROM pipelines_stages as stg \
            LEFT JOIN db_records as dbr ON (dbr.stage_id = stg.id) \
            LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
            LEFT JOIN pipelines pipe ON pipe.id = stg.pipeline_id \
            ${pgQuery}
            AND stg.is_fail = false \
            GROUP BY pipeline_name, stage_name, stg.position, pipe.module_name, pipe.entity_name, stg.key, stg.id, pipe.id \
            ORDER BY pipeline_name, stg.position, pipe.module_name, pipe.entity_name;`);
        }
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async billRunReports(principal: OrganizationUserEntity) {

        const activeOrders = await this.connection.query(`SELECT \
        to_char(float8 ((SUM(dbrc2.value::double precision))), 'FM999999999.00') as sum_total_price, \
        COUNT(dbr.id) as order_count, \
        to_char(dbrc1.value::date, 'DD-MM-YYYY') as billing_start_date, \
        pipe_stages.name \
        FROM db_records as dbr \
        RIGHT JOIN pipelines_stages as pipe_stages ON (dbr.stage_id = pipe_stages.id)\
        LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
        RIGHT JOIN schemas_columns sc1 ON dbr.schema_id = sc1.schema_id \
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = dbr.id AND sc1.id = dbrc1.column_id AND sc1.name = 'BillingStartDate') \
        RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id \
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice') \
        WHERE s1.entity_name = 'Order'
        AND pipe_stages.name = 'Active'
        AND dbr.deleted_at IS NULL
        GROUP BY dbrc1.value, pipe_stages.name;`,
        );

        const activeOrderItems = await this.connection.query(`SELECT \
        to_char(float8 ((SUM(dbrc2.value::double precision))), 'FM999999999.00') as sum_total_price, \
        COUNT(dbr.id) as order_item_count, \
        to_char(dbrc1.value::date, 'DD-MM-YYYY') as next_billing_date \
        FROM db_records as dbr \
        LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
        RIGHT JOIN schemas_columns sc1 ON dbr.schema_id = sc1.schema_id \
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = dbr.id AND sc1.id = dbrc1.column_id AND sc1.name = 'NextBillingDate') \
        RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id \
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice') \
        WHERE s1.entity_name = 'OrderItem'\
        AND dbr.deleted_at IS NULL
        GROUP BY dbrc1.value;`,
        );

        const invoices = await this.connection.query(`SELECT \
        to_char(float8 ((SUM(dbrc2.value::double precision))), 'FM999999999.00') as total_due, \
        to_char(float8 ((SUM(dbrc3.value::double precision))), 'FM999999999.00') as balance, \
        COUNT(dbr.id) as invoice_count, \
        to_char(dbrc1.value::date, 'DD-MM-YYYY') as due_date \
        FROM db_records as dbr \
        LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
        RIGHT JOIN schemas_columns sc1 ON dbr.schema_id = sc1.schema_id \
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = dbr.id AND sc1.id = dbrc1.column_id AND sc1.name = 'DueDate') \
        RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id \
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalDue') \
        RIGHT JOIN schemas_columns sc3 ON dbr.schema_id = sc3.schema_id \
        RIGHT JOIN db_records_columns dbrc3 ON (dbrc3.record_id = dbr.id AND sc3.id = dbrc3.column_id AND sc3.name = 'Balance') \
        WHERE s1.entity_name = 'Invoice'\
        AND dbr.deleted_at IS NULL
        GROUP BY dbrc1.value;`,
        );

        const transactions = await this.connection.query(`SELECT \
        to_char(float8 ((SUM(dbrc2.value::double precision))), 'FM999999999.00') as sum_amount,\
        COUNT(dbr.id) as trans_count,\
        dbrc1.value as trans_type,\
        to_char(dbr.created_at, 'DD-MM-YYYY')\
        FROM db_records as dbr\
        LEFT JOIN schemas s1 ON dbr.schema_id = s1.id\
        RIGHT JOIN schemas_columns sc1 ON dbr.schema_id = sc1.schema_id\
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = dbr.id AND sc1.id = dbrc1.column_id AND sc1.name = 'Type')\
        RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id\
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'Amount')\
        WHERE s1.entity_name = 'Transaction'\
        AND dbr.deleted_at IS NULL
        GROUP BY dbrc1.value, dbr.created_at;`,
        );

        return { activeOrders, activeOrderItems, invoices, transactions };
    }


    /**
     * Get an overview of pipelines with rag status
     */
    public async ordersNoPaymentMethods(principal: OrganizationUserEntity) {

        return await this.connection.query(`SELECT
        records.id AS contact_id,
        CONCAT(dbrc1.value, ' ', dbrc2.value) AS full_name,
        dbrc3.value AS email_address,
        dbrc4.value AS phone,
        orders.title as order_title,
        orders.record_number as record_number,
        pipelines_stages.name as stage_name,
        to_char(orders.created_at, 'DD/MM/YYYY') as order_created,
        'contact is missing payment method' as description
        FROM db_records AS records
        RIGHT JOIN schemas AS contact_schema ON (contact_schema.id = records.schema_id AND contact_schema.entity_name = 'Contact')
        RIGHT JOIN schemas_columns sc1 ON records.schema_id = sc1.schema_id
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = records.id AND sc1.id = dbrc1.column_id AND sc1.name = 'FirstName')
        RIGHT JOIN schemas_columns sc2 ON records.schema_id = sc2.schema_id
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = records.id AND sc2.id = dbrc2.column_id AND sc2.name = 'LastName')
        RIGHT JOIN schemas_columns sc3 ON records.schema_id = sc3.schema_id
        RIGHT JOIN db_records_columns dbrc3 ON (dbrc3.record_id = records.id AND sc3.id = dbrc3.column_id AND sc3.name = 'EmailAddress')
        RIGHT JOIN schemas_columns sc4 ON records.schema_id = sc4.schema_id
        RIGHT JOIN db_records_columns dbrc4 ON (dbrc4.record_id = records.id AND sc4.id = dbrc4.column_id AND sc4.name = 'Phone')
        RIGHT JOIN db_records_associations AS associations ON (associations.child_record_id = records.id)
        RIGHT JOIN schemas AS order_schema ON (order_schema.id = associations.parent_schema_id AND order_schema.entity_name = 'Order')
        RIGHT JOIN db_records as orders on (associations.parent_record_id = orders.id)
        RIGHT JOIN pipelines_stages on (pipelines_stages.id = orders.stage_id)
        WHERE pipelines_stages.key IN ('OrderStageSupply', 'OrderStageActive')
        AND associations.child_record_id = records.id
        AND records.deleted_at IS NULL
        AND orders.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS payment_methods_schema ON (payment_methods_schema.id = associations.child_schema_id AND payment_methods_schema.entity_name = 'PaymentMethod')
            AND associations.deleted_at IS NULL
            WHERE associations.parent_record_id = records.id);`,
        );
    }

    /**
     * Get an overview of pipelines with rag status
     */
    public async ordersInactivePaymentMethods(principal: OrganizationUserEntity) {

        return await this.connection.query(`SELECT
        records.id AS contact_id,
        CONCAT(dbrc1.value, ' ', dbrc2.value) AS full_name,
        dbrc3.value AS email_address,
        dbrc4.value AS phone,
        orders.title as order_title,
        orders.record_number as record_number,
        pipelines_stages.name as stage_name,
        to_char(orders.created_at, 'DD/MM/YYYY') as order_created,
        'contact has a cancelled or failed mandate' as description
        FROM db_records AS records
        RIGHT JOIN schemas AS contact_schema ON (contact_schema.id = records.schema_id AND contact_schema.entity_name = 'Contact')
        RIGHT JOIN schemas_columns sc1 ON records.schema_id = sc1.schema_id
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = records.id AND sc1.id = dbrc1.column_id AND sc1.name = 'FirstName')
        RIGHT JOIN schemas_columns sc2 ON records.schema_id = sc2.schema_id
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = records.id AND sc2.id = dbrc2.column_id AND sc2.name = 'LastName')
        RIGHT JOIN schemas_columns sc3 ON records.schema_id = sc3.schema_id
        RIGHT JOIN db_records_columns dbrc3 ON (dbrc3.record_id = records.id AND sc3.id = dbrc3.column_id AND sc3.name = 'EmailAddress')
        RIGHT JOIN schemas_columns sc4 ON records.schema_id = sc4.schema_id
        RIGHT JOIN db_records_columns dbrc4 ON (dbrc4.record_id = records.id AND sc4.id = dbrc4.column_id AND sc4.name = 'Phone')
        RIGHT JOIN db_records_associations AS associations ON (associations.child_record_id = records.id)
        RIGHT JOIN schemas AS order_schema ON (order_schema.id = associations.parent_schema_id AND order_schema.entity_name = 'Order')
        RIGHT JOIN db_records as orders on (associations.parent_record_id = orders.id)
        RIGHT JOIN pipelines_stages on (pipelines_stages.id = orders.stage_id)
        WHERE pipelines_stages.key IN ('OrderStageSupply', 'OrderStageActive')
        AND records.deleted_at IS NULL
        AND orders.deleted_at IS NULL
        AND associations.child_record_id = records.id
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS payment_methods_schema ON (payment_methods_schema.id = associations.child_schema_id AND payment_methods_schema.entity_name = 'PaymentMethod')
            WHERE EXISTS (
                SELECT records.id
                FROM db_records_columns AS records_columns
                RIGHT JOIN schemas_columns sc1 ON (records_columns.column_id = sc1.id AND sc1.name = 'Status')
                WHERE records_columns.record_id = associations.child_record_id
                AND records_columns.value IN ('CREATED', 'ACTIVE', 'SUBMITTED', 'PENDING_SUBMISSION', 'PENDING_CUSTOMER_APPROVAL')
            )
            AND associations.parent_record_id = records.id
            AND associations.deleted_at IS NULL
          );`,
        );
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async premisesPassed(principal: OrganizationUserEntity) {

        try {

            const buildDone = await this.cosmosConnection.query(
                `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('7-Build Done')
        `);

            const done = await this.cosmosConnection.query(
                `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('8-RFS')
        `);

            const buildDoneTotal = await this.getTotalPremisesByGeoms(buildDone);
            const doneTotal = await this.getTotalPremisesByGeoms(done);

            return {
                totalPremises: buildDoneTotal + doneTotal,
                buildDoneTotal,
                doneTotal,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     *
     * @param records
     * @private
     */
    private async getTotalPremisesByGeoms(records: any[]): Promise<number> {

        const chunkedArray = chunkArray(records, 100);

        let totalPremises = 0;

        for(let i = 0; i < chunkedArray.length; i++) {

            const elem = chunkedArray[i];

            const polygonGeoms = elem.map(poly => `${poly.geometry}`);

            let query = '';
            for(let i = 0; i < polygonGeoms.length; i++) {
                if(i === 0) {
                    query = `SELECT os.ab_plus.udprn FROM os.ab_plus WHERE class_1 IN ('R', 'C') AND St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`
                } else {
                    query = query.concat(` OR St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`);
                }
            }

            const premises = await this.myahConnection.query(query);
            totalPremises += premises.length;
        }

        return totalPremises;
    }


}

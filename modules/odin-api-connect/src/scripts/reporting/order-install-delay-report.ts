import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

class OrderReportRow {
    orderNumber: string;
    address: string;
    issuedDate: string;
    activeDate: string;
    totalPrice: string;
    adjustmentNote: string;
    adjustmentLength: string;
    nonVoidInvoices: number;
}

// Run this at 1:00am daily
async function sync() {

    function standardizeDate(property: any) {
        if(!!property) {
            return moment(property, 'YYYY-MM-DD').format('DD/MM/YYYY');
        }
        return undefined;
    }

    try {
        const httpClient = new BaseHttpClient();

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const allOrders = await pg.query(
            `SELECT db_records.id
            FROM db_records
            LEFT join pipelines_stages on (db_records.stage_id = pipelines_stages.id)
            WHERE entity = 'OrderModule:Order'
            AND pipelines_stages.key IN ('OrderStageActive')
            AND db_records.deleted_at IS NULL;`);

        const report = [];
        const missingAddress = [];
        const missingInvoiceItem = [];
        const missingOrder = [];

        for(const record of allOrders) {
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.id}?entities=["BillingAdjustment", "Invoice"]`,
                apiToken,
            );
            console.log('orderRes', orderRes);
            const order = orderRes['data'];
            const billingAdjustments = order['BillingAdjustment'].dbRecords;
            const invoices = order['Invoice'].dbRecords;


            if(billingAdjustments) {

                let totalNonVoicedInvoices = 0;
                if(invoices) {
                    const filtered = invoices.filter(elem => ![ 'VOID' ].includes(getProperty(
                        elem,
                        'Status',
                    )));
                    totalNonVoicedInvoices = filtered.length;
                }

                const orderReportRow = new OrderReportRow();
                orderReportRow.orderNumber = order.recordNumber;
                orderReportRow.address = order.title;
                orderReportRow.issuedDate = standardizeDate(getProperty(order, 'IssuedDate'));
                orderReportRow.activeDate = standardizeDate(getProperty(order, 'ActiveDate'));
                orderReportRow.totalPrice = getProperty(order, 'TotalPrice');
                orderReportRow.adjustmentNote = billingAdjustments ? billingAdjustments[0].title : undefined;
                orderReportRow.adjustmentLength = billingAdjustments ? getProperty(
                    billingAdjustments[0],
                    'FreePeriodLength',
                ) : undefined;
                orderReportRow.nonVoidInvoices = totalNonVoicedInvoices;
                console.log('orderReportRow', orderReportRow);

                report.push(orderReportRow);

            }
        }

        if(report[0]) {

            let csv = '';
            const fields = Object.keys(report[0]).map(elem => (elem));

            try {
                // csv = parse({ data: report, fields });
                const parser = new Parser({ fields });
                csv = parser.parse(report);
            } catch (err) {
                console.error(err);
            }

            fs.writeFileSync(`order-install-delay-report-${moment().format('DD-MM-YYYY')}.csv`, csv)
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();

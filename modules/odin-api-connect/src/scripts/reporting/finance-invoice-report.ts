import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { InvoiceItemCalculations } from '../../helpers/InvoiceItemCalculations';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

const { TRANSACTION } = SchemaModuleEntityTypeEnums;

class BillingReportRow {
    customerId: string;
    orderId: string;
    invoiceId: string;
    orderNumber: string;
    invoiceNumber: string;
    region: string;
    project: string;
    lineItem: string;
    billingPeriod: string;
    status: string;
    orderIssuedDate: string;
    orderStage: string;
    orderActiveDate: string;
    orderBillingStartDate: string;
    orderContractStartDate: string;
    issuedDate: string;
    dueDate: string;
    collectionDate: string;
    net: string;
    vat: string;
    gross: string;
}

// Run this at 1:00am daily
async function sync() {

    // Command line arguments
    let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
    let emails = argEmails ? argEmails.split('=')[1] : null;

    if(!emails) {
        throw Error('comma separated list of emails required or a single email address');
    }


    function calculateVat(item: any, invoice: DbRecordEntityTransform) {
        const taxIncluded = getProperty(item, 'TaxIncluded');

        const lineItemSummary = InvoiceItemCalculations.computeLineItemSummary(item, invoice);
        console.log('lineItemSummary', lineItemSummary);

        if(Number(lineItemSummary.lineItemTotalPrice) > 0) {

            if(taxIncluded === 'NO') {
                console.log('lineItemSummary', lineItemSummary);
                return lineItemSummary.lineItemTaxAmount;
            } else {

                const totalPrice = lineItemSummary.lineItemTotalPrice;
                console.log('totalPrice', totalPrice);
                let taxRate = getProperty(item, 'TaxRate');
                console.log('taxRate', taxRate);
                taxRate = taxRate ? taxRate : 20;
                const rate = Number(`1.${Number(taxRate)}`);

                return Number(Number(totalPrice) - (Number(totalPrice) / rate)).toFixed(2);
            }
        }

        return Number(0.00).toFixed(2);
    }

    function calculateNet(item: any, invoice: DbRecordEntityTransform) {

        const taxIncluded = getProperty(item, 'TaxIncluded');


        const lineItemSummary = InvoiceItemCalculations.computeLineItemSummary(item, invoice);
        console.log('lineItemSummary', lineItemSummary);

        if(Number(lineItemSummary.lineItemTotalPrice) > 0) {

            if(taxIncluded === 'NO') {
                console.log('lineItemSummary', lineItemSummary);
                return lineItemSummary.lineItemPreTaxTotal;
            } else {
                const vat = calculateVat(item, invoice);

                console.log('totalPrice', lineItemSummary.lineItemTotalPrice);
                console.log('vat', vat);

                return Number(lineItemSummary.lineItemTotalPrice - vat).toFixed(2);
            }
        }
        return Number(0.00).toFixed(2);
    }

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

        const allInvoices = await pg.query(
            `SELECT db_records.id
            FROM db_records
            RIGHT JOIN schemas as schema ON (db_records.schema_id = schema.id)
            WHERE schema.entity_name = 'Invoice' AND db_records.deleted_at IS NULL;`);

        const report = [];
        const missingAddress = [];
        const missingInvoiceItem = [];
        const missingOrder = [];

        for(const record of allInvoices) {

            const invoiceRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                `v1.0/db/Invoice/${record.id}?entities=["Contact", "Transaction", "Address", "Order", "InvoiceItem"]`,
                apiToken,
            );
            const invoice = invoiceRes['data'];
            const contact = invoice['Contact'].dbRecords;
            const transaction = invoice['Transaction'].dbRecords;
            const address = invoice['Address'].dbRecords;
            const order = invoice['Order'].dbRecords;
            const invoiceItem = invoice['InvoiceItem'].dbRecords;

            const paymentTransaction = transaction ? transaction.find(elem => getProperty(
                elem,
                'Status',
            ) === 'paid_out') : undefined;

            const refundTransaction = transaction ? transaction.find(elem => [
                'REFUND_APPLIED',
                'refund_settled',
            ].includes(getProperty(
                elem,
                'Status',
            ))) : undefined;

            if(!address) {
                missingAddress.push(`${invoice.recordNumber} ${invoice.title}`);
            }

            if(!invoiceItem) {
                // missing invoice items
                missingInvoiceItem.push(`${invoice.recordNumber} ${invoice.title}`);
            }

            if(!order) {
                // missing order
                missingOrder.push(`${invoice.recordNumber} ${invoice.title}`);
            }

            const invoiceStatus = getProperty(invoice, 'Status');
            const isDebited = [ 'REFUND_PENDING', 'REFUNDED' ].includes(invoiceStatus);

            if(invoiceItem && order) {

                console.log('contact', contact);
                console.log('invoice', invoice);

                for(const item of invoiceItem) {

                    const billingReportRow = new BillingReportRow();
                    billingReportRow.customerId = contact[0].id;
                    billingReportRow.orderId = order[0].id;
                    billingReportRow.invoiceId = invoice.id;
                    billingReportRow.orderNumber = order[0].recordNumber;
                    billingReportRow.invoiceNumber = invoice.recordNumber;
                    billingReportRow.project = '';
                    billingReportRow.region = address ? getProperty(address[0], 'City') : undefined;
                    billingReportRow.orderStage = order[0].stage.name;
                    billingReportRow.orderIssuedDate = standardizeDate(getProperty(order[0], 'IssuedDate'));
                    billingReportRow.orderContractStartDate = standardizeDate(getProperty(
                        order[0],
                        'ContractStartDate',
                    ));
                    billingReportRow.orderActiveDate = standardizeDate(getProperty(order[0], 'ActiveDate'));
                    billingReportRow.orderBillingStartDate = standardizeDate(getProperty(order[0], 'BillingStartDate'));
                    billingReportRow.issuedDate = standardizeDate(getProperty(invoice, 'IssuedDate'));
                    billingReportRow.dueDate = standardizeDate(getProperty(invoice, 'DueDate'));
                    billingReportRow.status = getProperty(invoice, 'Status');
                    billingReportRow.collectionDate = paymentTransaction ? standardizeDate(getProperty(
                        paymentTransaction,
                        'StatusUpdatedAt',
                    )) : undefined;
                    billingReportRow.lineItem = item.title;
                    billingReportRow.billingPeriod = getProperty(item, 'BillingPeriodType');
                    billingReportRow.net = isDebited ? `-${calculateNet(item, invoice)}` : `${calculateNet(
                        item,
                        invoice,
                    )}`;
                    billingReportRow.vat = isDebited ? `-${calculateVat(item, invoice)}` : `${calculateVat(
                        item,
                        invoice,
                    )}`;
                    billingReportRow.gross = isDebited ? `-${InvoiceItemCalculations.computeLineItemSummary(
                        item,
                        invoice,
                    ).lineItemTotalPrice}` : InvoiceItemCalculations.computeLineItemSummary(
                        item, invoice).lineItemTotalPrice;

                    console.log('billingReportRow', billingReportRow);

                    report.push(billingReportRow);

                }
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

            fs.writeFileSync(`invoice-report-${moment().format('DD-MM-YYYY')}.csv`, csv)
            // for email logic


            const buf = Buffer.from(csv, 'utf8');

            let parsedEmails = [];
            const split = emails.split(',');

            if(split && split.length > 0) {

                parsedEmails = split.map(elem => elem.trim());

            } else {

                parsedEmails = [ emails ]

            }

            const newEmail = new SendgridEmailEntity();
            newEmail.to = parsedEmails;
            newEmail.from = 'hello@youfibre.com';
            newEmail.templateId = 'd-11fb70c66a344dd881d9064f5e03aebf';
            newEmail.dynamicTemplateData = {
                subject: 'Invoice data export',
                body: `csv attached.`,
            };
            newEmail.attachments = [
                {
                    content: buf.toString('base64'),
                    filename: `billing-report-${moment().format('DD-MM-YYYY')}.csv`,
                    type: 'csv',
                    disposition: 'attachment',
                },
            ];

            await HelpersNotificationsApi.sendDynamicEmail(
                newEmail,
                { authorization: 'Bearer ' + apiToken },
            );

        }

        return;
    } catch (e) {
        console.error(e);
    }
}

sync();

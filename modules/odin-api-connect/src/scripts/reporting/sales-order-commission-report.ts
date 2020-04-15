import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { OrderItemCalculations } from '../../helpers/OrderItemCalculations';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

class OrderReportRow {
    orderNumber: string;
    stageName: string;
    discountCode: string;
    billingInterval: string;
    lineItem: string;
    lineItemQuantity: string;
    totalPrice: string;
    totalDiscounts: string;
    netPrice: string;
    orderName: string;
    createdBy: string;
    hearAboutUs: string;
    hearAboutUsOther: string;
    issuedDate: string;
}

async function sync() {

    // Command line arguments
    let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
    let emails = argEmails ? argEmails.split('=')[1] : null;

    if(!emails) {
        throw Error('comma separated list of emails required or a single email address');
    }

    let argStartDate = process.argv.find(arg => arg.indexOf('start') > -1);
    let start = argStartDate ? argStartDate.split('=')[1] : null;

    let argEndDate = process.argv.find(arg => arg.indexOf('end') > -1);
    let end = argEndDate ? argEndDate.split('=')[1] : null;

    let argSubDays = process.argv.find(arg => arg.indexOf('subdays') > -1);
    let subdays = argSubDays ? argSubDays.split('=')[1] : null;

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

        let startDate = moment().utc().subtract(7, 'days').startOf('day').format('l');
        let endDate = moment().utc().format('l');
        let queryStart = moment().utc().subtract(7, 'days').startOf('day').format('YYYY-MM-DD');

        // if the user specifies dates use the dates from the query
        if(subdays) {

            startDate = moment().utc().subtract(subdays, 'days').startOf('day').format('l');
            queryStart = moment().utc().subtract(subdays, 'days').startOf('day').format('YYYY-MM-DD');

        }

        if(start) {

            startDate = moment(start).utc().startOf('day').format('l');
            queryStart = moment(start).utc().startOf('day').format('YYYY-MM-DD');

        }

        if(end) {

            endDate = moment(end).utc().format('l');

        }

        console.log('startDate', startDate);
        console.log('endDate', endDate);
        console.log('queryStart', queryStart);

        const allOrders = await pg.query(
            `SELECT
            db_records.id
            FROM db_records
            LEFT JOIN pipelines_stages on (db_records.stage_id = pipelines_stages.id)
            WHERE entity = 'OrderModule:Order'
            AND db_records.deleted_at IS NULL
            AND db_records.created_at > '${queryStart}'`);

        const report = [];

        if(!allOrders[0]) {
            return;
        }

        for(const record of allOrders) {

            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.id}?entities=["Contact", "OrderItem", "Discount"]`,
                apiToken,
            );

            const order = orderRes['data'];
            const contact = order['Contact'].dbRecords;
            const orderItems = order['OrderItem'].dbRecords;
            const discount = order['Discount'].dbRecords;

            console.log('order', order);

            if(orderItems && order) {

                for(const item of orderItems) {

                    const orderItemRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/OrderItem/${item.id}?entities=["Product"]`,
                        apiToken,
                    );
                    const orderItem = orderItemRes['data'];
                    const products = orderItem['Product'].dbRecords;

                    const product = products[0];
                    const intervalLength = getProperty(product, 'IntervalLength');
                    const intervalUnit = getProperty(product, 'IntervalUnit');

                    const orderReportRow = new OrderReportRow();
                    orderReportRow.orderNumber = order.recordNumber;
                    orderReportRow.stageName = order.stage.name;
                    orderReportRow.billingInterval = `${intervalLength} ${intervalUnit}`;
                    orderReportRow.discountCode = discount ? getProperty(discount[0], 'Code') : undefined;
                    orderReportRow.lineItem = item.title;
                    orderReportRow.lineItemQuantity = getProperty(item, 'Quantity');
                    orderReportRow.totalPrice = Number(OrderItemCalculations.computeLineItemSummary(
                        item,
                        order,
                    ).lineItemSubtotal / intervalLength).toFixed(2);
                    orderReportRow.totalDiscounts = Number(OrderItemCalculations.computeLineItemSummary(
                        item,
                        order,
                    ).lineItemTotalDiscounts / intervalLength).toFixed(2);
                    orderReportRow.netPrice = Number(OrderItemCalculations.computeLineItemSummary(
                        item,
                        order,
                    ).lineItemTotalPrice / intervalLength).toFixed(2);
                    orderReportRow.orderName = order.title;
                    orderReportRow.hearAboutUs = contact ? getProperty(contact[0], 'HearAboutUs') : undefined;
                    orderReportRow.hearAboutUsOther = contact ? getProperty(contact[0], 'HearAboutUsOther') : undefined;
                    orderReportRow.createdBy = order.createdBy ? order.createdBy.fullName : undefined;
                    orderReportRow.issuedDate = standardizeDate(getProperty(order, 'IssuedDate'));


                    console.log(orderReportRow);
                    report.push(orderReportRow);

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
                subject: 'Weekly sales orders commission export',
                body: `date range: ${startDate} - ${endDate}`,
            };
            newEmail.attachments = [
                {
                    content: buf.toString('base64'),
                    filename: 'report.csv',
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
        process.exit(1);
    }
}

sync();

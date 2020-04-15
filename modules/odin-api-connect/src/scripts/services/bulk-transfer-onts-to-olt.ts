import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// this script can run every 10 minutes
async function sync() {

    const noOrderItemOnOnt = [];
    const moreThanOneOrderItem = [];
    const devicesNotInOdin = [];
    const failedStatusCheck = [];
    const completedTransfers = [];
    const deactivated = [];
    const activated = [];
    const checked = [];

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

        const oltIps = [
            '172.17.0.196',
            // '172.17.0.194',
            // '172.17.0.197',
            // '172.17.0.198',
            // '172.17.0.199',
            // '172.17.0.200',
            // '172.17.0.201',
            // '172.17.0.202',
            // '172.17.0.203',
            // '172.17.0.204',
            // '172.17.0.205',
        ];


        const transferToOlt = '172.17.0.199';
        // const portNumbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];

        for(const ip of oltIps) {

            const devicesRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                `v1.0/network/adtranolt/${ip}/configJson`,
                apiToken,
            );

            console.log('ip', ip);

            console.log('devicesRes', devicesRes);

            const devices = devicesRes['data']['interfaces']['activatedOnus'];

            console.log('devices', devices);

            // To fan out activations across ports
            // for(const port of portNumbers) {

            for(const device of devices) {

                if(device.serialNumber !== 'ADTN12345678') {

                    // Get work orders that are in Supply and have a Work order in Done
                    const ontDeviceOdin = await pg.query(`SELECT db_records_columns.record_id, db_records_columns.value FROM db_records_columns LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id) WHERE schemas_columns.name = 'SerialNumber' AND db_records_columns.deleted_at IS NULL AND db_records_columns.value = '${device.serialNumber.toUpperCase()}'`);
                    console.log('ontDeviceOdin', ontDeviceOdin);

                    // If there is no device matching the serialNumber, try to match the description to the title
                    // of an Order
                    if(!ontDeviceOdin[0]) {

                        devicesNotInOdin.push(device);

                    } else if(ontDeviceOdin.length === 1) {

                        // loop over all devices
                        for(const odnDevice of ontDeviceOdin) {

                            if(getProperty(odnDevice, 'OltIpAddress') !== transferToOlt) {


                                // get the ont device and order item
                                const ontDeviceRes = await httpClient.getRequest(
                                    Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                    `v1.0/db/CustomerDeviceOnt/${odnDevice.record_id}?entities=["OrderItem"]`,
                                    apiToken,
                                );

                                console.log('ontDeviceRes', ontDeviceRes);
                                const ontDevice = ontDeviceRes['data'];

                                console.log('ontDevice', ontDevice);

                                const ontDeviceOrderItem = ontDevice['OrderItem'].dbRecords;

                                if(!ontDeviceOrderItem) {

                                    console.log('device has no order item', device.serialNumber);
                                    noOrderItemOnOnt.push(device);

                                } else {

                                    const baseItem = ontDeviceOrderItem.find(elem => {
                                        return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                                            getProperty(elem, 'ProductType') === 'BASE_PRODUCT'
                                    });
                                    console.log('baseItem', baseItem ? baseItem.title : undefined);

                                    // get the order item and address
                                    const orderItemRes = await httpClient.getRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                        `v1.0/db/OrderItem/${baseItem.id}?entities=["Order"]`,
                                        apiToken,
                                    );
                                    const orderItem = orderItemRes['data'];
                                    const orderItemOrder = orderItem['Order'].dbRecords;

                                    // deactivate the devices
                                    const deactivate = await httpClient.postRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/network/adtranont/data/${orderItem.id}/deactivate`,
                                        apiToken,
                                        {},
                                    );

                                    console.log('deactivate', deactivate);
                                    deactivated.push(deactivate);

                                    // Clear the device details
                                    const updateDto = new DbRecordCreateUpdateDto();
                                    updateDto.entity = 'ServiceModule:CustomerDeviceOnt';
                                    updateDto.properties = {
                                        OnuInterfaceName: null,
                                        OltIpAddress: transferToOlt,
                                        PONPort: getProperty(ontDevice, 'PONPort'),
                                        RxPower: null,
                                        FibreLength: null,
                                    };
                                    console.log('update', updateDto);
                                    const updateRes = await httpClient.putRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/db/CustomerDeviceOnt/${ontDevice.id}`,
                                        apiToken,
                                        updateDto,
                                    );
                                    console.log('updateRes', updateRes);

                                    // Activate the devices
                                    const activate = await httpClient.postRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/network/adtranont/data/${orderItem.id}/activate`,
                                        apiToken,
                                        {},
                                    );
                                    console.log('activate', activate);
                                    activated.push(activate);

                                    // Run a status check for each of the devices
                                    // Get the order item order
                                    const orderRes = await httpClient.getRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                        `v1.0/db/OrderItem/${orderItemOrder[0].id}?entities=["Address"]`,
                                        apiToken,
                                    );
                                    const order = orderRes['data'];
                                    const address = order['Address'].dbRecords;

                                    // Check the devices
                                    const ontStatusCheckRes = await httpClient.postRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/network/adtranont/data/${orderItem.id}/check`,
                                        apiToken,
                                        {},
                                    );
                                    const statusCheck = ontStatusCheckRes['data'];
                                    console.log('orderTitle', order.title);
                                    console.log('statusCheck', statusCheck);

                                    checked.push(statusCheck);

                                }
                            }
                        }
                    } else if(ontDeviceOdin.length > 1) {
                        // loop over both devices
                        console.log('more than one ontDeviceFound', device.serialNumber);
                        moreThanOneOrderItem.push(device);
                    }
                    // }
                }
            }
        }

        console.log({
            noOrderItemOnOnt,
            moreThanOneOrderItem,
            devicesNotInOdin,
            failedStatusCheck,
            completedTransfers,
            deactivated,
            activated,
            checked,
        });
        return;
    } catch (e) {

        console.log({
            noOrderItemOnOnt,
            moreThanOneOrderItem,
            devicesNotInOdin,
            failedStatusCheck,
            completedTransfers,
            deactivated,
            activated,
            checked,
        });

        console.error(e);
        process.exit(1);
    }
}

sync();

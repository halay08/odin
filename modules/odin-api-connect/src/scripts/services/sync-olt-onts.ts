import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
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

// this script can run every 10 minutes
async function sync() {
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
            '172.17.0.194',
            '172.17.0.197',
            '172.17.0.198',
            '172.17.0.199',
            '172.17.0.200',
            '172.17.0.201',
            '172.17.0.202',
            '172.17.0.203',
            '172.17.0.204',
            '172.17.0.205',
            '172.17.0.206',
            '172.17.0.207',
            '172.17.0.208',
            '172.17.1.2',
            '172.17.1.3',
            '172.17.1.4',
            '172.17.1.5',
            '172.17.1.6',
            '172.17.1.7',
            '172.17.1.8',
            '172.17.1.9',
            '172.17.1.10',
            '172.17.1.11',
            '172.17.1.12',
            '172.17.1.13',
            '172.17.1.14',
            '172.17.1.15',
            '172.17.1.16',
            '172.17.1.17',
            '172.17.1.18',
            '172.17.1.19',
            '172.17.1.20',
            '172.17.1.21',
            '172.17.1.22',
            '172.17.1.23',
            '172.17.1.24',
            '172.17.1.25',
            '172.17.1.26',
            '172.17.1.27',

        ]

        const noOrderItemOnOnt = [];
        const moreThanOneOrderItem = [];
        const devicesNotInOdin = [];
        const failedStatusCheck = [];
        const devicesToDelete = [];
        const ordersNotActiveWithDevices = [];
        const orderItemMissingRouter = [];


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

            for(const device of devices) {

                if(device.serialNumber === 'ADTN12345678') {

                    const merged = Object.assign({}, { oltIp: ip }, device);
                    devicesNotInOdin.push(merged);

                } else if(device.serialNumber !== 'ADTN12345678') {

                    // Get work orders that are in Supply and have a Work order in Done
                    const ontDeviceOdin = await pg.query(`SELECT db_records_columns.record_id, db_records_columns.value FROM db_records_columns LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id) WHERE schemas_columns.name = 'SerialNumber' AND db_records_columns.deleted_at IS NULL AND db_records_columns.value = '${device.serialNumber.toUpperCase()}'`);
                    console.log('ontDeviceOdin', ontDeviceOdin);

                    // If there is no device matching the serialNumber, try to match the description to the title of an
                    // Order
                    if(!ontDeviceOdin[0]) {

                        const split = device.description.split('-');
                        const description = split[3];
                        const trimmed = description.trim();
                        console.log('description_trimmed', trimmed);

                        // Check for orders that are not in the active stage but have an ONT activated on the OLT
                        const orderNotActive = await pg.query(`SELECT db_records.id, db_records.title from db_records left join schemas on (db_records.schema_id = schemas.id) left join pipelines_stages ON (pipelines_stages.id = db_records.stage_id) where db_records.title = '${trimmed}' AND db_records.deleted_at IS NULL AND schemas.entity_name = 'Order' AND pipelines_stages.key != 'OrderStageActive'`);

                        if(orderNotActive[0]) {

                            ordersNotActiveWithDevices.push(orderNotActive[0].title);

                        }

                        const order = await pg.query(`SELECT db_records.id, db_records.title from db_records left join schemas on (db_records.schema_id = schemas.id) left join pipelines_stages ON (pipelines_stages.id = db_records.stage_id) where db_records.title = '${trimmed}' AND db_records.deleted_at IS NULL AND schemas.entity_name = 'Order' AND pipelines_stages.key = 'OrderStageActive'`);

                        if(order && order.length === 1) {
                            // exactly one order matches
                            console.log('ONE_ORDER', order);
                            const orderRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                `v1.0/db/Order/${order[0].id}?entities=["OrderItem"]`,
                                apiToken,
                            );

                            console.log('orderRes', orderRes);

                            const orderRecord = orderRes['data'];
                            const orderItem = orderRecord['OrderItem'].dbRecords;

                            const baseItem = orderItem.find(elem => {
                                return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                                    getProperty(elem, 'ProductType') === 'BASE_PRODUCT'
                            });
                            const addOnItem = orderItem.find(elem => {
                                return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                                    getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT'
                            });
                            console.log('baseItem', baseItem ? baseItem.title : undefined);
                            console.log('addOnItem', addOnItem ? addOnItem.title : undefined);

                            if(baseItem) {

                                // get the ont device and order item
                                const ontDeviceRes = await httpClient.getRequest(
                                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                    `v1.0/db/OrderItem/${baseItem.id}?entities=["CustomerDeviceOnt", "CustomerDeviceRouter"]`,
                                    apiToken,
                                );
                                const orderItem = ontDeviceRes['data'];
                                const orderItemOntDevice = orderItem['CustomerDeviceOnt'].dbRecords;
                                const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;

                                if(!orderItemRouter) {
                                    orderItemMissingRouter.push(`${orderRecord.title}: ${orderItem.title}`);
                                }

                                if(!orderItemOntDevice) {
                                    // we need to create a new Customer Device ONT for the BASE BROAD BAND PRODUCT
                                    // update the ontDevice
                                    const createDto = new DbRecordCreateUpdateDto();
                                    createDto.entity = 'ServiceModule:CustomerDeviceOnt';
                                    createDto.properties = {
                                        Model: '621_X',
                                        SerialNumber: device.serialNumber,
                                    };
                                    createDto.associations = [
                                        {
                                            recordId: baseItem.id,
                                        },
                                    ];

                                    console.log('createDto', createDto);
                                    const createRes = await httpClient.postRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/db/batch?upsert=true`,
                                        apiToken,
                                        [ createDto ],
                                    );
                                    console.log('createRes', createRes);
                                }
                            }
                        } else {
                            // we do not have a matching order for this device matching on description
                            console.log('device does not exist in odin', device.serialNumber);
                            // Run a health check
                            const ontStatusCheckRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                `v1.0/network/adtranolt/${ip}/devices/${device.port}/${device.onuId}`,
                                apiToken,
                            );
                            const statusCheck = ontStatusCheckRes['data'];

                            const merged = Object.assign({}, { oltIp: ip }, device, { ...statusCheck });

                            devicesNotInOdin.push(merged);
                        }

                    } else if(ontDeviceOdin.length === 1) {

                        for(const odnDevice of ontDeviceOdin) {
                            // get the ont device and order item
                            const ontDeviceRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                `v1.0/db/CustomerDeviceOnt/${odnDevice.record_id}?entities=["OrderItem"]`,
                                apiToken,
                            );
                            const ontDevice = ontDeviceRes['data'];

                            console.log('ontDevice', ontDevice);

                            const ontDeviceOrderItem = ontDevice['OrderItem'].dbRecords;


                            if(ontDeviceOrderItem && ontDeviceOrderItem[0] && getProperty(
                                ontDevice,
                                'OnuInterfaceName',
                            )) {
                                console.log('device has an OnuInterfaceName', device.serialNumber);

                            } else if(ontDeviceOrderItem && ontDeviceOrderItem[0] && !getProperty(
                                ontDevice,
                                'OnuInterfaceName',
                            )) {

                                console.log('INTERFACE_NAME_MISSING', getProperty(ontDevice, 'OnuInterfaceName'));
                                const baseItem = ontDeviceOrderItem.find(elem => {
                                    return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                                        getProperty(elem, 'ProductType') === 'BASE_PRODUCT'
                                });
                                const addOnItem = ontDeviceOrderItem.find(elem => {
                                    return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                                        getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT'
                                });
                                console.log('baseItem', baseItem ? baseItem.title : undefined);
                                console.log('addOnItem', addOnItem ? addOnItem.title : undefined);

                                if(baseItem) {
                                    // get the order item and address
                                    const orderItemRes = await httpClient.getRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                        `v1.0/db/OrderItem/${ontDeviceOrderItem[0].id}?entities=["Order", "CustomerDeviceRouter"]`,
                                        apiToken,
                                    );
                                    const orderItem = orderItemRes['data'];
                                    const orderItemOrder = orderItem['Order'].dbRecords;
                                    const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;

                                    if(!orderItemRouter) {
                                        orderItemMissingRouter.push(`${orderItemOrder[0].title}: ${orderItem.title}`);
                                    }

                                    console.log('orderItem', orderItem);

                                    // Get the order item order
                                    const orderRes = await httpClient.getRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                        `v1.0/db/OrderItem/${orderItemOrder[0].id}?entities=["Address"]`,
                                        apiToken,
                                    );
                                    const order = orderRes['data'];
                                    const address = order['Address'].dbRecords;

                                    // do a check status of the olt on port and onuId
                                    const ontStatusCheckRes = await httpClient.getRequest(
                                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                        `v1.0/network/adtranolt/${ip}/devices/${device.port}/${device.onuId}`,
                                        apiToken,
                                    );
                                    const statusCheck = ontStatusCheckRes['data'];
                                    console.log('orderTitle', order.title);
                                    console.log('statusCheck', statusCheck);
                                    if(statusCheck) {

                                        // update the ontDevice
                                        const updateDto = new DbRecordCreateUpdateDto();
                                        updateDto.entity = 'ServiceModule:CustomerDeviceOnt';
                                        updateDto.title = address[0].title;
                                        updateDto.properties = {
                                            OnuInterfaceName:
                                            device.interfaceName, OltIpAddress: ip, PONPort: device.port, RxPower:
                                            statusCheck.rxPower, FibreLength: statusCheck.fibreLength,
                                        };
                                        updateDto.associations = [ { recordId: address[0].id } ];
                                        console.log('update', updateDto);
                                        const updateRes = await
                                            httpClient.putRequest(
                                                Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                                `v1.0/db/CustomerDeviceOnt/${ontDevice.id}`,
                                                apiToken,
                                                updateDto,
                                            );
                                        console.log('updateRes', updateRes);
                                        const update = updateRes['data'];
                                        console.log('update', update);


                                    } else {
                                        console.log('failed status check');
                                        failedStatusCheck.push({
                                            device,
                                            title: order.title,
                                            orderItem: orderItem.title,
                                        });
                                    }
                                } else if(addOnItem) {
                                    // delete the ONT device
                                    // devicesToDelete.push(addOnItem.title);
                                    // const deleteRes = await httpClient.deleteRequest(
                                    //    Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                    //     `v1.0/db/CustomerDeviceOnt/${device.record_id}`,
                                    //     apiToken,
                                    // );
                                    // console.log('deleteRes', deleteRes);

                                }
                            } else {
                                console.log('device has no order item', device.serialNumber);
                                noOrderItemOnOnt.push(device);
                            }
                        }
                    } else if(ontDeviceOdin.length > 1) {
                        // loop over both devices
                        console.log('more than one ontDeviceFound', device.serialNumber);
                        moreThanOneOrderItem.push(device);
                    }
                }
            }
        }


        let csv1 = '';
        const fields1 = Object.keys(devicesNotInOdin[0]).map(elem => (elem));

        try {
            const parser = new Parser({ fields: fields1 });
            csv1 = parser.parse(devicesNotInOdin);
        } catch (err) {
            console.error(err);
        }

        fs.writeFileSync(`devices-not-in-odin-${moment().format('DD-MM-YYYY')}.csv`, csv1);

        console.log({
            noOrderItemOnOnt,
            moreThanOneOrderItem,
            devicesNotInOdin,
            failedStatusCheck,
            devicesToDelete,
            ordersNotActiveWithDevices,
            orderItemMissingRouter,
        })
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();

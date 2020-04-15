import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;
const apiBaseUrl = process.env.K8_BASE_URL;


/**
 * Use this script to link ONT and Routers for a single Order
 */
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

        const orderItems = await pg.query(
            `select db_records_associations.parent_record_id as order_item_id,
                    db_records_associations.child_record_id as router_id
                    from db_records_associations
                    left join schemas as child_schema on (db_records_associations.child_schema_id = child_schema.id)
                    left join schemas as parent_schema on (db_records_associations.parent_schema_id = parent_schema.id)
                    where child_schema.entity_name = 'CustomerDeviceRouter'
                    and deleted_at IS NULL
                    and parent_schema.entity_name = 'OrderItem'
                    and not exists (
                        select db_records_associations.id from db_records_associations as dbr2
                        left join schemas as child_schema on (dbr2.child_schema_id = child_schema.id)
                        left join schemas as parent_schema on (dbr2.parent_schema_id = parent_schema.id)
                        where child_schema.entity_name = 'CustomerDeviceRouter'
                        and parent_schema.entity_name = 'CustomerDeviceOnt'
                        and dbr2.child_record_id = db_records_associations.child_record_id
                    );`);

        const notOntDevice = [];

        console.log('orderItems', orderItems.length);

        for(const relation of orderItems) {

            const ontDevice = await getOntFromOrderByOrderItemId(relation.order_item_id);

            if(ontDevice) {
                // create an association between the ont device and the address
                if(!ontDevice.title) {

                    const orderAddress = await getOrderItemAddress(relation.order_item_id);

                    // Add the address to the ONT
                    const updateDto = new DbRecordCreateUpdateDto();
                    let SERVICE_MODULE = 'ServiceModule';
                    let CUSTOMER_DEVICE_ONT = 'CustomerDeviceOnt';

                    updateDto.entity = `${SERVICE_MODULE}:${CUSTOMER_DEVICE_ONT}`;
                    updateDto.title = orderAddress ? orderAddress.title : undefined;
                    updateDto.associations = [
                        {
                            recordId: orderAddress ? orderAddress.id : undefined,
                        },
                    ];

                    ontDevice.title = updateDto.title;

                    console.log('updateOnt', updateDto);

                    const updateRes = await
                        httpClient.putRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                            `v1.0/db/CustomerDeviceOnt/${ontDevice.id}`,
                            apiToken,
                            updateDto,
                        );
                    console.log('updateRes', updateRes['data']);

                }

                const updateDto = new DbRecordCreateUpdateDto();
                let SERVICE_MODULE = 'ServiceModule';
                let CUSTOMER_DEVICE_ROUTER = 'CustomerDeviceRouter';

                updateDto.entity = `${SERVICE_MODULE}:${CUSTOMER_DEVICE_ROUTER}`;
                updateDto.title = ontDevice ? ontDevice.title : undefined;
                updateDto.associations = [
                    {
                        recordId: ontDevice ? ontDevice.id : undefined,
                    },
                ];

                console.log('updateRouter', updateDto);

                const updateRes = await
                    httpClient.putRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                        `v1.0/db/CustomerDeviceRouter/${relation.router_id}`,
                        apiToken,
                        updateDto,
                    );
                console.log('updateRes', updateRes['data']);

            } else {
                notOntDevice.push(`${relation.order_item_id} ${relation.router_id}`);
            }
        }

        console.log({
            notOntDevice,
        });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}


/**
 *
 * @param principal
 * @param orderItemId
 * @private
 */
const getOntFromOrderByOrderItemId = async (orderItemId: string) => {
    try {

        const httpClient = new BaseHttpClient();

        const ORDER = 'Order';
        const SPLIT_ORDER = 'SplitOrder';

        // Get the order item w/ product
        const orderItemRes = await httpClient.getRequest(
            Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
            `v1.0/db/OrderItem/${orderItemId}?entities=["${ORDER}", "${SPLIT_ORDER}"]`,
            apiToken,
        );

        const orderItem = orderItemRes['data'];
        const order = orderItem[ORDER].dbRecords;
        const orderItemSplitOrder = orderItem[SPLIT_ORDER].dbRecords;

        if(!order) {
            console.error('order item does not have an order', orderItem);
            throw new ExceptionType(422, 'order item does not have an order');
        }

        // Check if the item has a split order
        // If it does > get the split order > get the order item with the base broadband from the order
        // provision the service

        // if there is no split order
        // then we should use the order that the voice item is being activated from
        let orderId;

        if(orderItemSplitOrder) {

            // Get the order item w/ product
            const splitOrderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/SplitOrder/${orderItemSplitOrder[0].id}?entities=["${ORDER}"]`,
                apiToken,
            );

            // A split order will always have 2 orders
            // the originating order
            // and the new order after the split
            const splitOrder = splitOrderRes['data'];
            const splitOrderOrders = splitOrder[ORDER].dbRecords;

            if(splitOrderOrders && splitOrderOrders.length < 2) {
                orderId = splitOrderOrders[0].id;
            } else {
                const originatingOrder = splitOrderOrders.filter(elem => elem.id !== order[0].id);
                orderId = originatingOrder[0].id;
            }
        } else {
            orderId = order[0].id;
        }

        // get the ont device from the base broadband order item
        return await getOrderCustomerDeviceOnt(orderId);

    } catch (e) {
        console.error(e);
        throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
}


/**
 *
 * @param principal
 * @param orderOrderItem
 * @private
 */
const getOrderCustomerDeviceOnt = async (odnOrderId: string): Promise<DbRecordEntityTransform> => {

    const httpClient = new BaseHttpClient();
    const ORDER_ITEM = 'OrderItem';

    // Get the order item w/ product
    const orderRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
        `v1.0/db/Order/${odnOrderId}?entities=["${ORDER_ITEM}"]`,
        apiToken,
    );

    const order = orderRes['data'];
    if(order.stage.key === 'OrderStageActive') {

        const orderOrderItem = order['OrderItem'].dbRecords;

        const baseBroadbandProduct = orderOrderItem.filter(elem => getProperty(
            elem,
            'ProductCategory',
        ) === 'BROADBAND' && getProperty(elem, 'ProductType') === 'BASE_PRODUCT');

        if(baseBroadbandProduct[0]) {


            const orderItemRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/OrderItem/${baseBroadbandProduct[0].id}?entities=["CustomerDeviceOnt"]`,
                apiToken,
            );

            const orderItem = orderItemRes['data'];
            const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;

            if(!orderItemOnt) {
                throw new ExceptionType(
                    422,
                    `This order item is missing an ONT ${order.recordNumber} ${orderItem.title}`,
                );
            } else {

                return orderItemOnt[0];
            }
        }
    }
}

/**
 *
 * @param principal
 * @param orderOrderItem
 * @private
 */
const getOrderItemAddress = async (orderItemId: string): Promise<DbRecordEntityTransform> => {

    const httpClient = new BaseHttpClient();

    const ORDER = 'Order';

    // Get the order item w/ product
    const orderItemRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
        `v1.0/db/OrderItem/${orderItemId}?entities=["${ORDER}"]`,
        apiToken,
    );

    const orderItem = orderItemRes['data'];
    const orderItemOrder = orderItem[ORDER].dbRecords;

    // Get the order item w/ product
    const orderRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
        `v1.0/db/Order/${orderItemOrder[0].id}?entities=["Address"]`,
        apiToken,
    );

    const order = orderRes['data'];

    const orderAddress = order['Address'].dbRecords;

    return orderAddress[0];
}


sync();

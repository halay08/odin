import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

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

        // Get work orders that are in Supply and have a Work order in Done
        const records = await pg.query(
            `select orders.id as order_id from db_records as orders \
                    left join pipelines_stages on (orders.stage_id = pipelines_stages.id)\
                    where exists ( \
                            select * \
                            from db_records_associations as WorkOrder_Association \
                            left join db_records as WorkOrder on (WorkOrder.id = WorkOrder_Association.child_record_id) \
                            left join pipelines_stages on (WorkOrder.stage_id = pipelines_stages.id) \
                            where pipelines_stages.key = 'WorkOrderStageDone' \
                            and WorkOrder_Association.parent_record_id = orders.id \
                            and WorkOrder.deleted_at IS NULL \
                    ) \
                    and pipelines_stages.key = 'OrderStageSupply';`);

        const ordersMoved = [];
        for(const record of records) {
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.order_id}`,
                apiToken,
            );
            const order = orderRes['data'];

            if(order && order.stage.key === 'OrderStageSupply') {

                const stageRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/stages/byKey/OrderStageActive`,
                    apiToken,
                );
                const stage = stageRes['data'];

                // Update the order
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `OrderModule:Order`;
                updateDto.stageId = stage.id;

                const updateRes = await httpClient.putRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/OrderModule/${order.id}`,
                    apiToken,
                    updateDto,
                );
                const update = updateRes['data'];
                ordersMoved.push(order.title);
                console.log('BillingStartDate', update.title, getProperty(update, 'BillingStartDate'));
            }
        }

        console.log('ordersMoved', ordersMoved);
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();

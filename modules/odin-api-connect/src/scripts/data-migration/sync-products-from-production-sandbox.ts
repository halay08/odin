import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const odinBaseUrl = process.env.K8_BASE_URL;
const odinapitoken = process.env.ODIN_API_TOKEN;

const odinSandboxBaseUrl = process.env.K8_SANDBOX_BASE_URL;
const odinSandboxApitoken = process.env.ODIN_SANDBOX_API_TOKEN;

async function sync() {

    const httpClient = new BaseHttpClient();

    const pg = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOSTNAME,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const products = await pg.query(`SELECT t1.id \
            FROM db_records as t1 \
            LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
            WHERE t2.entity_name = 'Product'\
            ORDER BY t1.created_at ASC`);


    for(const product of products) {

        const targetProductRes = await httpClient.getRequest(
            odinSandboxBaseUrl,
            `ProductModule/v1.0/db/Product/${product.id}?entities=['ProductComponent', 'Discount']`,
            odinSandboxApitoken,
        );

        const sandboxProduct = targetProductRes['data'];

        console.log('sandboxProduct', sandboxProduct);

        // update product
        const updateProduct = new DbRecordCreateUpdateDto();
        updateProduct.entity = 'ProductModule:Product';
        updateProduct.title = sandboxProduct.title;
        updateProduct.properties = sandboxProduct.properties;

        console.log('newProduct', updateProduct);

        const productionProductRes = await httpClient.putRequest(
            odinBaseUrl,
            `ProductModule/v1.0/db/Product/${product.id}`,
            odinapitoken,
            updateProduct,
        );
    }


}

sync();

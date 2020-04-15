import { APIClient } from '@d19n/client/dist/common/APIClient';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { INDEX_DB_RECORDS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Connection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import * as dayjs from "dayjs";
import * as utc from 'dayjs/plugin/utc';
dayjs.extend(utc)

dotenv.config();

const apiToken = process.env.ODIN_API_TOKEN;

@Injectable()
export class IndexDbService {

    private readonly amqpConnection: AmqpConnection;
    private readonly connection: Connection;

    constructor(
        @InjectConnection('odinDb') connection: Connection,
        amqpConnection: AmqpConnection,
    ) {
        this.amqpConnection = amqpConnection;
        this.connection = connection;
    }

    /**
     *
     */
    public async indexSingleEntity(entityName: string, dateInterval?: string, from?:string, to?:string) {

        try {
            if(!entityName) {
                throw Error('i.e EntityName required');
            }

            let totalProcessed = 0;

            let hasMore = true;
            let offset = 0;
            let limit = 25;

            while (hasMore) {

                let records = [];

                if(dateInterval) {
                    records = await this.connection.manager.query(`SELECT t1.id as record_id, t1.record_number, t1.schema_id \
            FROM db_records as t1 \
            LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
            WHERE t2.entity_name = '${entityName}'\
            AND t1.deleted_at IS NULL \
            AND t1.updated_at > now() - '${dateInterval}'::interval \
            ORDER BY t1.created_at ASC \
            LIMIT ${limit} OFFSET ${offset}`);

                    console.log(`SELECT t1.id as record_id, t1.record_number, t1.schema_id \
            FROM db_records as t1 \
            LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
            WHERE t2.entity_name = '${entityName}'\
            AND t1.deleted_at IS NULL \
            AND t1.updated_at > now() - '${dateInterval}'::interval \
            ORDER BY t1.created_at ASC \
            LIMIT ${limit} OFFSET ${offset}`);

                } else if(from||to){
                    from=dayjs.utc(from).startOf('day').toISOString()
                    to=dayjs.utc(to).endOf('day').toISOString()
                    records = await this.connection.manager.query(`SELECT t1.id as record_id, t1.record_number, t1.schema_id \
            FROM db_records as t1 \
            LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
            WHERE t2.entity_name = '${entityName}'\
            AND t1.deleted_at IS NULL \
            AND t1.created_at > '${from}' \
            AND t1.created_at < '${to}' \
            ORDER BY t1.created_at ASC \
            LIMIT ${limit} OFFSET ${offset}`);
                }else {
                    records = await this.connection.manager.query(`SELECT t1.id as record_id, t1.record_number, t1.schema_id \
            FROM db_records as t1 \
            LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
            WHERE t2.entity_name = '${entityName}'\
            AND t1.deleted_at IS NULL \
            ORDER BY t1.created_at ASC \
            LIMIT ${limit} OFFSET ${offset}`);
                }

                const recordsToIndex = [];

                const principal = await APIClient.call<OrganizationUserEntity>({
                    facility: 'http',
                    baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                    service: 'v1.0/users/my',
                    method: 'get',
                    headers: { Authorization: `Bearer ${apiToken}` },
                    debug: false,
                });

                for(const record of records) {
                    console.log('indexing', record.record_id);
                    recordsToIndex.push({
                        id: record.record_id,
                        schemaId: record.schema_id,
                    });
                }

                totalProcessed += recordsToIndex.length;

                await this.amqpConnection.publish(
                    'SearchModule',
                    `SearchModule.${INDEX_DB_RECORDS}`,
                    {
                        principal: principal,
                        body: recordsToIndex,
                    },
                );
                console.log('recordsToIndex', recordsToIndex.length);
                // bulk insert into elastic search
                if(records.length < 1) {
                    hasMore = false;
                    break;
                }
                // set next batch params
                offset = offset + limit;
                console.log('offset', offset);
            }

            return {
                totalProcessed,
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param dateInterval
     */
    async indexAllEntities() {

        try {
            const httpClient = new BaseHttpClient();

            const principal = await APIClient.call<OrganizationUserEntity>({
                facility: 'http',
                baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
                service: 'v1.0/users/my',
                method: 'get',
                headers: { Authorization: `Bearer ${apiToken}` },
                debug: false,
            });

            const data = await this.connection.manager.query('SELECT id, module_name, entity_name FROM schemas');

            for(const elem of data) {

                const schemaRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                    `v1.0/schemas/bymodule?moduleName=${elem.module_name}&entityName=${elem.entity_name}&withAssociations=true`,
                    apiToken,
                );
                console.log('schemaRes', schemaRes);
                const schema = schemaRes['data'];

                let totalProcessed = 0;

                let hasMore = true;
                let offset = 0;
                let limit = 25;
                if(schema) {
                    while (hasMore) {

                        console.log('schema.entityName', schema.entityName);

                        const records = await this.connection.manager.query(`
                    SELECT t1.id as record_id, t1.record_number, t1.schema_id \
                    FROM db_records as t1 \
                    LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
                    WHERE t2.entity_name = '${schema.entityName}'\
                    AND t1.deleted_at IS NULL \
                    ORDER BY t1.created_at ASC \
                    LIMIT ${limit} OFFSET ${offset}`);

                        const recordsToIndex = [];

                        console.log('records', records.length);
                        console.log('records[0]', records[0]);

                        for(const record of records) {
                            recordsToIndex.push({
                                id: record.record_id,
                                schemaId: record.schema_id,
                            });
                        }

                        totalProcessed += recordsToIndex.length;
                        console.log('recordsToIndex', recordsToIndex);

                        await this.amqpConnection.publish(
                            'SearchModule',
                            `SearchModule.${INDEX_DB_RECORDS}`,
                            {
                                principal: principal,
                                body: recordsToIndex,
                            },
                        );

                        if(records.length < 1) {
                            hasMore = false;
                            break;
                        }

                        // bulk insert into elastic search
                        // set next batch params
                        offset = offset + limit;
                    }
                }
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}


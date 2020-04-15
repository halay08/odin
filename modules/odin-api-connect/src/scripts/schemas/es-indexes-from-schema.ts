import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

interface ElasticSearchFieldType {
    type?: string;
    format?: string;
    fields?: {
        'keyword': {
            type: string,
            'ignore_above': number
        }
    },
    analyzer?: string[],
    search_analyzer?: string[],
    tokenizer?: string[],
    filter?: string[],
    index_prefixes?: {
        min_chars: 1,
        max_chars: 10
    },
    index_phrases?: boolean
}

interface ColumnMapping {
    properties: {
        [key: string]: ElasticSearchFieldType | string
    },
}

interface DbRecordProperties {
    properties?: {
        [key: string]: ElasticSearchFieldType | ColumnMapping | string,
    },
    id?: ElasticSearchFieldType | string,
    title?: ElasticSearchFieldType | string,
    entity?: ElasticSearchFieldType | string,
    recordNumber?: ElasticSearchFieldType | string,
    schemaId?: ElasticSearchFieldType | string,
    externalId?: ElasticSearchFieldType | string,
    externalApp?: ElasticSearchFieldType | string,
    stage?: {
        properties: {
            [key: string]: ElasticSearchFieldType | string,
        }
    },
    createdBy?: {
        properties: {
            id: ElasticSearchFieldType | string,
            fullName: ElasticSearchFieldType | string,
        }
    },
    ownedBy?: {
        properties: {
            id: ElasticSearchFieldType | string,
            fullName: ElasticSearchFieldType | string,
        }
    },
    lastModifiedBy?: {
        properties: {
            id: ElasticSearchFieldType | string,
            fullName: ElasticSearchFieldType | string,
        }
    },
    dbRecordAssociation?: {
        properties: {
            id: ElasticSearchFieldType | string,
        }
    },
    relationType: {},
    schemaAssociationId?: {},
    schemaPosition?: ElasticSearchFieldType | string,
    createdAt?: ElasticSearchFieldType | string,
    updatedAt?: ElasticSearchFieldType | string,
    deletedAt?: ElasticSearchFieldType | string,
    stageUpdatedAt?: ElasticSearchFieldType | string,
}

interface DbRecordAssociationMapping {
    [key: string]: {
        properties: {
            dbRecords: {
                properties: DbRecordProperties,
            },
        },
    },
}

class ElasticSearchMapping {
    public properties: DbRecordProperties | ElasticSearchFieldType | ColumnMapping | DbRecordAssociationMapping
}

async function sync() {

    try {

        const odinapitoken = process.env.ODIN_API_TOKEN;

        const httpClient = new BaseHttpClient();

        const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
        const es = new ElasticSearchClient(client);

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });
        //
        const data = await pg.query(
            'SELECT id, module_name, entity_name FROM schemas WHERE entity_name NOT IN(\'Premise\', \'Premise2\')');

        // const data = await pg.query(
        //     'SELECT id, module_name, entity_name FROM schemas WHERE entity_name IN (\'Feature\')');

        for(const elem of data) {

            console.log('HERE', Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE));
            const schemaRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                `v1.0/schemas/bymodule?moduleName=${elem.module_name}&entityName=${elem.entity_name}&withAssociations=true`,
                odinapitoken,
            );
            console.log('schemaRes', schemaRes);

            const schema = schemaRes['data'];

            const schemaColumnMappings = parseSchemaColumnsToElasticMapping(schema.columns);
            const mapping = new ElasticSearchMapping();
            mapping.properties = addDbRecordMappings(schemaColumnMappings);

            // add all of the child schema record mappings
            if(schema.associations && schema.associations.length > 0) {
                for(const association of schema.associations) {
                    if(association.childSchema) {
                        console.log(association.childSchema);
                        const colMappings = parseSchemaColumnsToElasticMapping(association.childSchema.columns);
                        console.log('colMappings', colMappings);
                        const associationMapping = addDbRecordAssociationMappings(
                            association.childSchema.entityName,
                            colMappings,
                        );

                        mapping.properties = Object.assign({}, mapping.properties, associationMapping);
                    }
                }
            }

            console.log('mapping', mapping);

            fs.writeFileSync(`${schema.entityName}-elasticSchema.json`, JSON.stringify({ mappings: mapping }));

            // process.exit(1);

            await es.deleteIndices(schema.id).then(res => console.log(res)).catch(e => {
                console.error(e);
                if(e && e.meta) {
                    console.error(e.meta.body);
                    console.error(e.meta.body.error.root_cause);
                }
            });

            await es.createIndices(schema.id).then(res => console.log(res)).catch(e => {
                console.error(e);
                if(e && e.meta) {
                    console.error(e.meta.body);
                    console.error(e.meta.body.error.root_cause);
                }
            });

            await es.closeIndices(schema.id);
            await es.updateSettings<any>(
                schema.id,
                {
                    index: {
                        mapping: {
                            total_fields: {
                                limit: 10000,
                            },
                        },
                        max_ngram_diff: 9,
                        'analysis': {
                            'char_filter': {
                                'digits_only': {
                                    type: 'pattern_replace',
                                    'pattern': '[^\\d]',
                                },
                            },
                            filter: {
                                email: {
                                    type: 'pattern_capture',
                                    'preserve_original': true,
                                    'patterns': [
                                        '([^@]+)',
                                        '(\\p{L}+)',
                                        '(\\d+)',
                                        '@(.+)',
                                    ],
                                },
                                uk_phone_number_filter: {
                                    type: 'pattern_capture',
                                    'preserve_original': true,
                                    'patterns': [
                                        '^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))(\\s?\\#(\\d{4}|\\d{3}))?$',
                                    ],
                                },
                                not_empty: {
                                    type: 'length',
                                    min: 1,
                                },
                            },
                            tokenizer: {
                                whitespace: {
                                    type: 'whitespace',
                                },
                                ngram_tokenizer: {
                                    type: 'ngram',
                                    min_gram: '3',
                                    max_gram: '12',
                                },
                            },
                            analyzer: {
                                email: {
                                    tokenizer: 'keyword',
                                    max_token_length: 5,
                                    filter: [ 'lowercase' ],
                                },
                                address: {
                                    type: 'custom',
                                    tokenizer: 'keyword',
                                    filter: [ 'trim', 'lowercase' ],
                                },
                                uk_phone_number: {
                                    char_filter: 'digits_only',
                                    tokenizer: 'ngram_tokenizer',
                                    filter: [
                                        'uk_phone_number_filter',
                                    ],
                                },
                                phone_number_search: {
                                    char_filter: 'digits_only',
                                    tokenizer: 'ngram_tokenizer',
                                    filter: [
                                        'not_empty',
                                        'trim',
                                    ],
                                },
                                text_search: {
                                    tokenizer: 'keyword',
                                    filter: [
                                        'not_empty',
                                        'trim',
                                        'lowercase',
                                    ],
                                },
                            },
                        },
                    },
                },
            ).then(res => console.log(
                res)).catch(e => {
                console.error(e);
                if(e && e.meta) {
                    console.error(e.meta.body);
                    console.error(e.meta.body.error.root_cause);
                }
            });

            await es.openIndices(schema.id);

            await es.updateIndices<any>(
                schema.id,
                mapping,
            ).then(res => console.log(
                res)).catch(e => {
                console.error(e);
                if(e && e.meta) {
                    console.error(e.meta.body);
                    console.error(e.meta.body.error.root_cause);
                }
            });

        }
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

}

/**
 * Define default dbRecordMappings for standared database column fields
 */
const addDbRecordMappings = (properties: ColumnMapping): DbRecordProperties => {

    const obj = {
        id: {
            type: 'text',
        },
        title: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        recordNumber: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        entity: {
            type: 'text',
            fields: {
                keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                },
            },
        },
        createdAt: {
            type: 'date',
        },
        updatedAt: {
            type: 'date',
        },
        deletedAt: {
            type: 'date',
        },
        stageUpdatedAt: {
            type: 'date',
        },
        stage: {
            properties: {
                createdAt: {
                    type: 'date',
                },
                description: {
                    type: 'text',
                },
                id: {
                    type: 'text',
                },
                isDefault: {
                    type: 'boolean',
                },
                isFail: {
                    type: 'boolean',
                },
                isSuccess: {
                    type: 'boolean',
                },
                key: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
                name: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
                position: {
                    type: 'long',
                },
                updatedAt: {
                    type: 'date',
                },
            },
        },
        createdBy: {
            properties: {
                fullName: {
                    type: 'text',
                    fields: {
                        'keyword': {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
                id: {
                    type: 'text',

                },
            },
        },
        lastModifiedBy: {
            properties: {
                fullName: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
                id: {
                    type: 'text',

                },
            },
        },
        ownedBy: {
            properties: {
                fullName: {
                    type: 'text',
                    fields: {
                        keyword: {
                            type: 'keyword',
                            ignore_above: 256,
                        },
                    },
                },
                id: {
                    type: 'text',

                },
            },
        },
        dbRecordAssociation: {
            properties: {
                id: {
                    type: 'text',
                },
            },
        },
        relationType: {
            type: 'text',
        },
        schemaAssociationId: {
            type: 'text',
        },
        schemaId: {
            type: 'text',
        },
        externalId: {
            type: 'text',
        },
        externalApp: {
            type: 'text',
        },
        schemaPosition: {
            type: 'long',
        },
    };

    if(properties) {

        // @ts-ignore
        return Object.assign({}, obj, { properties });

    }

    return obj;

}

/**
 * Add mappings for dbRecordAssociations
 * @param entityName
 * @param properties
 */
const addDbRecordAssociationMappings = (entityName: string, properties: ColumnMapping) => {
    return {
        [entityName]: {
            properties: {
                dbRecords: {
                    properties: addDbRecordMappings(properties),
                },
            },
        },
    }
}

/**
 * generate mappings form schema columns
 * @param schemaColumns
 */
const parseSchemaColumnsToElasticMapping = (schemaColumns: SchemaColumnEntity[]): ColumnMapping => {

    let mapping: ColumnMapping = {
        properties: {},
    };

    if(schemaColumns) {
        for(const col of schemaColumns) {

            mapping.properties = Object.assign({}, mapping.properties, { [col.name]: mappings(col.type) });

        }

        return mapping;
    }
}

/**
 * Elastic search field type column mappings
 *
 * @param columnType
 */
const mappings = (columnType: string) => {

    switch (columnType) {
        case 'DATE_TIME':
        case 'DATE':
            return {
                type: 'date',
                ignore_malformed: true,
                format: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ||yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis',
            }
        case 'ENUM':
            return {
                type: 'text',
                index_phrases: true,
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            }
        case 'TEXT_LONG':
        case 'TEXT':
            return {
                type: 'text',
                analyzer: 'standard',
                search_analyzer: 'text_search',
                index_prefixes: {
                    min_chars: 1,
                    max_chars: 10,
                },
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            }
        case 'NUMBER':
        case 'CURRENCY':
        case 'PERCENT':
        case 'NUMERIC':
            return {
                type: 'long',
                ignore_malformed: true,
            };
        case 'BOOLEAN':
            return {
                type: 'text',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            };
        case 'EMAIL':
            return {
                type: 'text',
                analyzer: 'email',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            }
        case 'PHONE_NUMBER_E164_GB':
        case 'PHONE_NUMBER':
            return {
                type: 'text',
                analyzer: 'uk_phone_number',
                search_analyzer: 'phone_number_search',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            };
        case 'ADDRESS':
            return {
                type: 'text',
                analyzer: 'address',
                search_analyzer: 'text_search',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            };
        default:
            return {
                type: 'text',
                analyzer: 'standard',
                search_analyzer: 'text_search',
                fields: {
                    keyword: {
                        type: 'keyword',
                        ignore_above: 256,
                    },
                },
            };

    }
}

// Elastic search types

// date
// integer
// long
// keyword
// text
// boolean

sync();

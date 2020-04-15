import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import * as request from 'request';
import { BaseHttpClient } from '../../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const { PRODUCT_MODULE, SUPPORT_MODULE } = SchemaModuleTypeEnums;
const { PRODUCT, NOTE } = SchemaModuleEntityTypeEnums;

async function sync() {

    // const path =
    //     'https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Material+-+Products.csv';
    const path =
        'https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Map+-+Products.csv';
    // const path =
    // 'https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Dessin+-+Products.csv';

    try {

        const httpClient = new BaseHttpClient();

        const vendorsCreated = [];
        const priceBooksCreated = [];

        csv()
            // @ts-ignore
            .fromStream(request.get(path))
            .subscribe((json) => {
                return new Promise(async (resolve, reject) => {
                    console.log('json', json);
                    // long operation for each json e.g. transform / write into database.
                    if(json.action === 'delete') {
                        const processRes = await httpClient.deleteRequest(
                            baseUrl,
                            `${PRODUCT_MODULE}/v1.0/db/${PRODUCT}/${json.id}`,
                            apiToken,
                        );
                        console.log('processRes', processRes);
                    } else {

                        let vendorId;
                        let priceBookId;

                        // Upsert a vendor
                        if(json['VendorName']) {

                            // Only create a new vendor if the existing one was not created already
                            const vendorCreated = vendorsCreated.find(elem => elem && elem.title === json['VendorName']);
                            if(!vendorCreated) {
                                const newVendorRecord = new DbRecordCreateUpdateDto();
                                newVendorRecord.entity = `${PRODUCT_MODULE}:Vendor`;
                                newVendorRecord.title = json['VendorName'];
                                newVendorRecord.properties = {
                                    Type: json['VendorType'] && json['VendorType'] !== '' ? json['VendorType'] : 'CONTRACTOR',
                                };
                                const newVendorRes = await httpClient.postRequest(
                                    baseUrl,
                                    `${PRODUCT_MODULE}/v1.0/db/batch?upsert=true`,
                                    apiToken,
                                    [ newVendorRecord ],
                                );

                                console.log('newVendorRes', newVendorRes);
                                const vendor = newVendorRes['data'][0];
                                vendorId = vendor.id;
                                vendorsCreated.push({ id: vendor.id, title: vendor.title });

                            } else {
                                vendorId = vendorCreated.id;
                            }
                        }

                        // Upsert a PriceBook for the vendor

                        if(json['PriceBookName']) {
                            // Only create a new vendor if the existing one was not created already
                            const priceBookCreated = priceBooksCreated.find(elem => elem && elem.title === json['PriceBookName']);
                            if(!priceBookCreated) {
                                const newRecord = new DbRecordCreateUpdateDto();
                                newRecord.entity = `${PRODUCT_MODULE}:PriceBook`;
                                newRecord.title = json['PriceBookName'];
                                newRecord.properties = {
                                    IsActive: json['PriceBookIsActive'],
                                    IsStandard: json['PriceBookIsStandard'],
                                };
                                newRecord.associations = [
                                    {
                                        recordId: vendorId,
                                    },
                                ];

                                const newRecordRes = await httpClient.postRequest(
                                    baseUrl,
                                    `${PRODUCT_MODULE}/v1.0/db/batch?upsert=true`,
                                    apiToken,
                                    [ newRecord ],
                                );

                                console.log('newPriceBook', newRecordRes);

                                const priceBook = newRecordRes['data'][0];
                                priceBookId = priceBook.id;
                                priceBooksCreated.push({ id: priceBook.id, title: priceBook.title });

                            } else {
                                priceBookId = priceBookCreated.id;
                            }
                        }

                        // Upsert a Product and associate to the PriceBook
                        if(json['ProductName']) {

                            const newProductRecord = new DbRecordCreateUpdateDto();
                            newProductRecord.entity = `${PRODUCT_MODULE}:${PRODUCT}`;
                            newProductRecord.title = json['ProductName'];
                            newProductRecord.properties = {
                                // Fields from csv
                                Type: json['ProductType'] && json['ProductType'] !== '' ? json['ProductType'] : 'BASE_PRODUCT',
                                ChargeType: 'ONE_TIME',
                                Category: json['ProductCategory'] && json['ProductCategory'] !== '' ? json['ProductCategory'] : 'DEFAULT',
                                Description: json['ProductDescription'],
                                UnitType: json['ProductUnitType'] !== '' ? json['ProductUnitType'] : 'UNIT',
                                UnitPrice: Number(json['ProductPrice']).toFixed(2),
                                UnitCost: Number(json['ProductCost']).toFixed(2),
                                MinimumSalePrice: Number(json['ProductCost']).toFixed(2),
                                InStockQuantity: json['ProductInStockQuantity'],
                                // Static fields
                                CustomerType: 'ALL',
                                ContractType: 'NONE',
                                AvailableFrom: '10-08-2020',
                                Taxable: 'YES',
                                TaxIncluded: 'NO',
                                RequiresProvisioning: 'NO',
                                RequiresOnSiteSetup: 'YES',
                                Shippable: 'NO',
                                Retrievable: 'NO',
                                TaxRate: '20.00',
                            };
                            newProductRecord.associations = [
                                {
                                    recordId: vendorId,
                                },
                                {
                                    recordId: priceBookId,
                                },
                            ];
                            console.log('newProductRecord', newProductRecord);

                            const res = await httpClient.postRequest(
                                baseUrl,
                                `${PRODUCT_MODULE}/v1.0/db/batch?upsert=true&queueAndRelate=true`,
                                apiToken,
                                [ newProductRecord ],
                            );

                            console.log('res', res);
                        }
                    }
                    return resolve();
                });
            });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();



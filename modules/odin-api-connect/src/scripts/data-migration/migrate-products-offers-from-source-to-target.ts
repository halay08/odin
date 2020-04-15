import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const odinSourceUrl = process.env.K8_BASE_URL_OVERIDE_SOURCE;
const odinSourceToken = process.env.ODIN_API_TOKEN_SOURCE;

const odinTargetUrl = process.env.K8_BASE_URL_OVERIDE;
const odinTarketToken = process.env.ODIN_API_TOKEN;

console.log('odinTargetUrl', odinTargetUrl);

const sourceOfferId = 'a4a81cb9-f993-467d-aab3-bff65ca3898c';

async function sync() {

    const httpClient = new BaseHttpClient();

    const sourceOfferRes = await httpClient.getRequest(
        odinSourceUrl,
        `ProductModule/v1.0/db/Offer/${sourceOfferId}?entities=['Product']`,
        odinSourceToken,
    );

    console.log('sourceOffer', sourceOfferRes);

    const sourceOffer = sourceOfferRes['data'];

    const newOffer = new DbRecordCreateUpdateDto();
    newOffer.entity = 'ProductModule:Offer';
    newOffer.title = sourceOffer.title;
    newOffer.properties = sourceOffer.properties;

    console.log('newOffer', newOffer);

    const targetOfferCreateRes = await httpClient.postRequest(
        odinTargetUrl,
        `ProductModule/v1.0/db/batch?upsert=true`,
        odinTarketToken,
        [ newOffer ],
    );

    console.log('targetOfferCreateRes', targetOfferCreateRes);
    const targetOffer = targetOfferCreateRes['data'][0];

    const sourceProducts = sourceOffer['Product']['dbRecords'];

    for(const product of sourceProducts) {

        const targetProductGetRes = await httpClient.getRequest(
            odinSourceUrl,
            `ProductModule/v1.0/db/Product/${product.id}?entities=['ProductComponent']`,
            odinSourceToken,
        );

        const sourceProduct = targetProductGetRes['data'];

        // parse related records
        const sourceProductComponent = sourceProduct['ProductComponent']['dbRecords'];

        console.log('targetOffer', targetOffer);
        // Add associations
        const associations = [
            {
                recordId: targetOffer.id,
            },
        ];

        const recordsToCreate = [];

        if(sourceProductComponent) {
            // Create component
            const newComponent = new DbRecordCreateUpdateDto();
            newComponent.entity = 'ProductModule:ProductComponent';
            newComponent.title = sourceProductComponent[0].title;
            newComponent.properties = sourceProductComponent[0].properties;

            recordsToCreate.push(newComponent);
        }

        // Create product
        const newProduct = new DbRecordCreateUpdateDto();
        newProduct.entity = 'ProductModule:Product';
        newProduct.title = sourceProduct.title;
        newProduct.properties = sourceProduct.properties;
        newProduct.properties['LegalTerms'] = 'temp description';

        newProduct.associations = associations;

        const targetRecordCreateRes = await httpClient.postRequest(
            odinTargetUrl,
            `ProductModule/v1.0/db/batch?upsert=true`,
            odinTarketToken,
            [ newProduct, ...recordsToCreate ],
        );
        console.log('targetRecordCreateRes', targetRecordCreateRes);

    }


}

sync();

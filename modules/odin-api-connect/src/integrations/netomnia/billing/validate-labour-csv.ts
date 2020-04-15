import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import * as request from 'request';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;


async function sync() {


  const csvFilePath = `https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/map-labour-full.csv`;

  const cosmosProdDb = await createConnection({
    type: 'postgres',
    name: 'netomniaConnection',
    host: process.env.DB_GIS_HOSTNAME,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_GIS_USERNAME,
    password: process.env.DB_GIS_PASSWORD,
    database: process.env.DB_GIS_NAME,
    synchronize: false,
    entities: [],
  });

  try {

    const totalRows = 3301;
    const batchProcess = 500;
    let totalProcessed = 0;

    let dataSet = [];

    csv()
      // @ts-ignore
      .fromStream(request.get(csvFilePath))
      .subscribe((json) => {
        return new Promise(async (resolve, reject) => {
          console.log('json', json);
          const feature = json['Feature'];
          let jobId = json['job_id'];
          let price = json['price'];
          let total = json['total'];
          let quantity = json['qty'];

          if(!!jobId) {
            if(isNaN(jobId)) {
              jobId = undefined;
            }
          }

          if(!!price) {
            price = price.replace('£', '');
            price = price.replace(',', '');
            price = price.trim();
            price = Number(price);
          }
          if(!!total) {
            total = total.replace('£', '');
            total = total.replace(',', '');
            total = total.trim();
            total = Number(total);
          }
          if(!!quantity) {
            quantity = quantity.trim();
            quantity = Number(quantity);
          }

          console.log('price', price);
          console.log('total', total);
          console.log('quantity', quantity);


          if(feature === 'chamber') {
            // if feature type chamber
            let chamber;
            if(jobId) {
              chamber = await cosmosProdDb.query(`select *, ftth.chamber.id as chamber_id from ftth.chamber left join ftth.build_status on ftth.chamber.build_status_id = ftth.build_status.id where ${jobId} = any (jobs_ids);`);
              console.log('chamber', chamber);
            }

            const exists = chamber && chamber[0] ? true : false;
            const feature_id = chamber && chamber[0] ? chamber[0].chamber_id : null;
            const status = chamber && chamber[0] ? chamber[0].name : null;
            const unit = 'UNIT';

            const variance = (1 - quantity) / 2;
            const verifiedPrice = Number(price * 1).toFixed(2);

            console.log('verifiedPrice', verifiedPrice);

            dataSet.push({
              location: json['location'],
              date: json['date'],
              job_id: json['job_id'],
              feature: json['Feature'],
              task: json['task'],
              unit: json['unit'],
              price: json['price'],
              quantity: json['qty'],
              total: json['total'],
              cosmos_exists: exists,
              cosmos_feature_id: feature_id,
              cosmos_status: status,
              cosmos_unit: unit,
              cosmos_quantity_raw: 1,
              cosmos_quantity_rounded: 1,
              cosmos_variance: variance,
              cosmos_price: verifiedPrice,
              value_a: verifiedPrice,
              value_b: total,
              value_a_minus_b: Number(verifiedPrice) - Number(total),
              is_matching: Number(verifiedPrice) === Number(total),
            });

          } else if(feature === '/cableduct') {

            let element;
            if(jobId) {
              element = await cosmosProdDb.query(`select *, ftth.cable.id as element_id from ftth.cable left join ftth.build_status on ftth.cable.build_status_id = ftth.build_status.id where ${jobId} = any (jobs_ids);`);
              console.log('cable_e', element);
              if(!element[0]) {
                element = await cosmosProdDb.query(`select *, ftth.duct.id as element_id from ftth.duct left join ftth.build_status on ftth.duct.build_status_id = ftth.build_status.id where ${jobId} = any (jobs_ids);`);
                console.log('duct_e', element);
              }
            }

            const cableLength = element && element[0] ? Number(element[0].length) : 0;
            const exists = element && element[0] ? true : false;
            const feature_id = element && element[0] ? element[0].element_id : null;
            const status = element && element[0] ? element[0].name : null;
            const unit = '100_METER';

            const roundedCableLength = 100 * Math.ceil(cableLength / 100);

            console.log('roundedCableLength', roundedCableLength);

            const variance = ((roundedCableLength / 100) - quantity) / quantity;
            console.log('variance', variance);

            const verifiedPrice = Number(price * (roundedCableLength / 100)).toFixed(2);

            console.log('verifiedPrice', verifiedPrice);

            dataSet.push({
              location: json['location'],
              date: json['date'],
              job_id: json['job_id'],
              feature: json['Feature'],
              task: json['task'],
              unit: json['unit'],
              price: json['price'],
              quantity: json['qty'],
              total: json['total'],
              cosmos_exists: exists,
              cosmos_feature_id: feature_id,
              cosmos_status: status,
              cosmos_unit: unit,
              cosmos_quantity_raw: cableLength,
              cosmos_quantity_rounded: roundedCableLength,
              cosmos_variance: variance,
              cosmos_price: verifiedPrice,
              value_a: verifiedPrice,
              value_b: total,
              value_a_minus_b: Number(verifiedPrice) - Number(total),
              is_matching: Number(verifiedPrice) === Number(total),
            });

          } else if(feature === 'closure') {

            let closure;
            if(jobId) {
              closure = await cosmosProdDb.query(`select *, ftth.closure.id as closure_id from ftth.closure left join ftth.build_status on ftth.closure.build_status_id = ftth.build_status.id where ${jobId} = any (jobs_ids);`);
              console.log('closure', closure);
            }

            const exists = closure && closure[0] ? true : false;
            const feature_id = closure && closure[0] ? closure[0].closure_id : null;
            const status = closure && closure[0] ? closure[0].name : null;
            const unit = 'UNIT';

            const variance = (1 - quantity) / 2;
            const verifiedPrice = Number(price * 1).toFixed(2);

            console.log('verifiedPrice', verifiedPrice);

            dataSet.push({
              location: json['location'],
              date: json['date'],
              job_id: json['job_id'],
              feature: json['Feature'],
              task: json['task'],
              unit: json['unit'],
              price: json['price'],
              quantity: json['qty'],
              total: json['total'],
              cosmos_exists: exists,
              cosmos_feature_id: feature_id,
              cosmos_status: status,
              cosmos_unit: unit,
              cosmos_quantity_raw: 1,
              cosmos_quantity_rounded: 1,
              cosmos_variance: variance,
              cosmos_price: verifiedPrice,
              value_a: verifiedPrice,
              value_b: total,
              value_a_minus_b: Number(verifiedPrice) - Number(total),
              is_matching: Number(verifiedPrice) === Number(total),
            });

          } else if(feature === 'blockage') {

            let blockage;
            if(jobId) {
              blockage = await cosmosProdDb.query(`select *, ftth.blockage.id as blockage_id from ftth.blockage left join ftth.build_status on ftth.blockage.build_status_id = ftth.build_status.id where ${json.job_id} = any (jobs_ids);`);
              console.log('blockage', blockage);
            }

            const exists = blockage && blockage[0] ? true : false;
            const feature_id = blockage && blockage[0] ? blockage[0].blockage_id : null;
            const status = blockage && blockage[0] ? blockage[0].name : null;
            const unit = 'UNIT';

            const variance = (1 - quantity) / 2;
            const verifiedPrice = Number(price * 1).toFixed(2);

            console.log('verifiedPrice', verifiedPrice);

            dataSet.push({
              location: json['location'],
              date: json['date'],
              job_id: json['job_id'],
              feature: json['Feature'],
              task: json['task'],
              unit: json['unit'],
              price: json['price'],
              quantity: json['qty'],
              total: json['total'],
              cosmos_exists: exists,
              cosmos_feature_id: feature_id,
              cosmos_status: status,
              cosmos_unit: unit,
              cosmos_quantity_raw: 1,
              cosmos_quantity_rounded: 1,
              cosmos_variance: variance,
              cosmos_price: verifiedPrice,
              value_a: verifiedPrice,
              value_b: total,
              value_a_minus_b: Number(verifiedPrice) - Number(total),
              is_matching: Number(verifiedPrice) === Number(total),
            });
          } else {
            // push raw row without a feature
            dataSet.push({
              location: json['location'],
              date: json['date'],
              job_id: json['job_id'],
              feature: json['Feature'],
              task: json['task'],
              unit: json['unit'],
              price: json['price'],
              quantity: json['qty'],
              total: json['total'],
              cosmos_exists: false,
              cosmos_feature_id: null,
              cosmos_status: null,
              cosmos_unit: null,
              cosmos_quantity_raw: null,
              cosmos_quantity_rounded: null,
              cosmos_variance: null,
              cosmos_price: null,
              value_a: null,
              value_b: null,
              value_a_minus_b: null,
              is_matching: false,
            });
          }

          console.log('dataSet.length', dataSet.length);
          console.log('Object.keys(dataSet[0])', Object.keys(dataSet[0]));

          const difference = totalRows - totalProcessed;

          console.log('difference', difference);
          console.log('totalProcessed', totalProcessed);
          console.log('dataSet.length === batchProcess', dataSet.length === batchProcess);
          console.log('difference < batchProcess', difference < batchProcess);


          if(dataSet.length === batchProcess || difference < batchProcess && dataSet.length === difference) {

            try {
              const insertRes = await cosmosProdDb.manager.createQueryBuilder()
                .insert()
                .into('ftth.labour_csv_audit', Object.keys(dataSet[0]))
                .values(dataSet)
                .execute();

              totalProcessed = totalProcessed + dataSet.length;

              dataSet = [];
              console.log('dataSet.length', dataSet.length);
              console.log('insertRes', insertRes);
            } catch (e) {
              console.error(e);
            }
          }

          return resolve();
        });
      }, (e) => console.error(e), async () => {
        console.log('processed', totalRows, totalProcessed);
      });


    return;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

sync();

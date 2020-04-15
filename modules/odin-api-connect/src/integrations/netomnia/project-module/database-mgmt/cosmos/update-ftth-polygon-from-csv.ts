import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../../../common/Http/BaseHttpClient';
import moment = require('moment');

const path = require('path')


dotenv.config({ path: '../../../../../../.env' });

async function sync() {

    const filePath = path.resolve('./files', 'polygon-dates.csv');
    console.log('filePath', filePath);

    const csvFilePath = filePath;

    try {
        const httpClient = new BaseHttpClient();

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
        })

        csv()
            // @ts-ignore
            .fromFile(csvFilePath)
            .subscribe((json) => {
                return new Promise(async (resolve, reject) => {
                    console.log('json', json);
                    const polygonId = json['POLYGONE BY ORDER OF PRIORITY'];
                    const releaseDate = json['TARGET POLYGON RELEASE DATE(ALL WORKS COMPLETED)'];
                    const fmtDate = moment(releaseDate, 'DD/MM/YYYY').format('YYYY-MM-DD');

                    const update = await cosmosProdDb.query(`UPDATE ftth.polygon SET target_release_date =
                    '${fmtDate}' WHERE ftth.polygon.id = ${polygonId}`);

                    console.log('update', update, polygonId, releaseDate, fmtDate);

                    return (resolve());
                });
            });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();

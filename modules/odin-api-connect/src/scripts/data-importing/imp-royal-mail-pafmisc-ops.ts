import * as dotenv from 'dotenv';
import "reflect-metadata";
import { createConnection } from "typeorm";

dotenv.config({ path: '../../../.env' });

async function sync() {
    try {

        const youfibreDb = await createConnection({
            type: 'postgres',
            name: 'yofibreConnection',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });

        let hasMore = true;
        let offset = 0;
        let limit = 1000;
        while (hasMore) {
            // added on 15-06-2020
            // SR8 5 R,S,T,U,Q
            // SR8 1 Q,P,N,L,E
            // SR8 4 A,B,P, Q
            // SR8 3 H
            // fetch results
            const results = await youfibreDb.query(`SELECT * FROM royal_mail.pafmisc LIMIT ${limit} OFFSET ${offset}`);

            const opsDataSet = [];
            console.log('dataSet top', opsDataSet.length);
            console.log('results', results.length);

            for(let i = 0; i < results.length; i++) {
                const data = results[i];
                // console.log('data', data);
                const opsPremise = {
                    uprn: !!data.uprn ? Number(data.uprn) : null,
                    umprn: 0,
                    udprn: !!data.udprn ? Number(data.udprn) : null,
                    build_status_id: null,
                    sales_status_id: 1,
                    season_id: null,
                    year: 2020,
                    latitude: null,
                    longitude: null,
                    x_coordinate: null,
                    y_coordinate: null,
                    geom: data.geom,
                };
                opsDataSet.push(opsPremise);
            }

            if(opsDataSet.length > 0) {
                const res = await youfibreDb.manager.createQueryBuilder()
                    .insert()
                    .into("ops.premises", [
                        "uprn",
                        "umprn",
                        "udprn",
                        "build_status_id",
                        "sales_status_id",
                        "season_id",
                        "year",
                        "latitude",
                        "longitude",
                        "x_coordinate",
                        "y_coordinate",
                        "geom",
                    ])
                    .values(opsDataSet)
                    .onConflict(`("udprn", "umprn") DO NOTHING`)
                    .execute();
                console.log('res', res);
            } else {
                hasMore = false;
                break;
            }

            console.log('opsDataSet before', opsDataSet.length);
            // bulk insert into elastic search
            // clear data set
            console.log('offset', offset);
            console.log('limit', limit);
            // set next batch params
            offset = offset + limit;
        }
    } catch (e) {
        console.error(e);

    }

}

sync();

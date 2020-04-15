import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

async function execute() {

    let myahDb;
    let cosmosDb;

    try {
        myahDb = await createConnection({
            type: 'postgres',
            name: 'myahDb',
            host: process.env.DB_MYAH_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_MYAH_USERNAME,
            password: process.env.DB_MYAH_PASSWORD,
            database: process.env.DB_MYAH_NAME,
            entities: [],
        });
    } catch (e) {
        console.error(e);
        myahDb = await getConnection('myahDb');
    }

    try {

        cosmosDb = await createConnection({
            type: 'postgres',
            name: 'cosmosDb',
            host: process.env.DB_GIS_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_GIS_USERNAME,
            password: process.env.DB_GIS_PASSWORD,
            database: process.env.DB_GIS_NAME,
            entities: [],
        });
    } catch (e) {

        console.error(e);
        cosmosDb = await getConnection('cosmosDb');
    }

    const errors = [];
    const modified = [];

    // Intersect L2 polygons and populate a csv with the following columns:
    // l2 polygon id,
    // premises (ab_plus) count,
    // length of duct (table ftth.duct),
    // number of poles (from openreach.structure with plant_item = pole),
    // meter of openreach.duct with object_class = ND,
    // meter of openreach.duct with object_class != ND)

    const l2Polygon = await cosmosDb.query(
        `SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'EX'
        `);

    const report = await mergeFtthDataWithOrdinanceSurvey(l2Polygon, myahDb, cosmosDb);

    console.log({
        report: report.length,
    });

    let csv = '';
    const fields = Object.keys(report[0]).map(elem => (elem));

    try {
        // csv = parse({ data: report, fields });
        const parser = new Parser({ fields });
        csv = parser.parse(report);
    } catch (err) {
        console.error(err);
    }

    fs.writeFileSync(`export-ex-polygon-duct-poles-${moment().format('DD-MM-YYYY')}.csv`, csv)

    cosmosDb.close();
    myahDb.close();
    return { modified, errors };
}


/**
 *
 * @param records
 * @private
 */
const mergeFtthDataWithOrdinanceSurvey = async (polygons: any[], db: any, db2: any): Promise<any[]> => {

    const data = [];

    try {
        for(const polygon of polygons) {

            const premises = await db.query(`
        SELECT os.ab_plus.udprn, os.ab_plus.post_town
        FROM os.ab_plus
        WHERE St_Intersects(os.ab_plus.geom, '${polygon.geometry}')
        `);

            const obj = {
                polygonId: polygon.id,
                postTown: premises.find(elem => ![ '', null, undefined ].includes(elem.post_town)),
                premiseCount: premises.length,
            }

            data.push(obj);
        }

        return data;
    } catch (e) {
        console.error(e);
    }
}

execute();


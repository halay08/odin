import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { Address } from 'uk-clear-addressing';

const fs = require('fs');

const apiToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

dotenv.config({ path: '../../../.env' });

/**
 * This report exports all the premises inside of polygons
 */
async function execute() {

    // Command line arguments
    let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
    let emails = argEmails ? argEmails.split('=')[1] : null;

    let argPolygonId = process.argv.find(arg => arg.indexOf('polyid') > -1);
    let polygonId = argPolygonId ? argPolygonId.split('=')[1] : null;

    let argPolygonName = process.argv.find(arg => arg.indexOf('polyname') > -1);
    let polygonName = argPolygonName ? argPolygonName.split('=')[1] : null;

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

    let polygons = [];


    // get a specific set of polygons by name intersecting with an EX polygon
    if(polygonId && polygonName) {

        polygons = await cosmosDb.query(
            `SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry,
            ftth.polygon.target_release_date
        FROM ftth.polygon
        WHERE EXISTS (
            SELECT id FROM ftth.polygon as ex
            WHERE ST_Intersects(ftth.polygon.geometry, ex.geometry)
            AND ex.id = ${polygonId}
        )
        AND ftth.polygon.name = '${polygonName}'
        `);

    } else if(polygonId) {
        polygons = await cosmosDb.query(
            `SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry,
            ftth.polygon.target_release_date
        FROM ftth.polygon
        WHERE ftth.polygon.id = ${polygonId}
        `);
    }

    console.log(`SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry,
            ftth.polygon.target_release_date
        FROM ftth.polygon
        WHERE EXISTS (
            SELECT id FROM ftth.polygon as ex
            WHERE ST_Intersects(ftth.polygon.geometry, ex.geometry)
            AND ex.id = ${polygonId}
        )
        AND ftth.polygon.name = '${polygonName}'
        `);

    console.log('polygons', polygons.length);
    console.log('polygonId', polygonId);


    const report = await mergeFtthDataWithOrdinanceSurvey(polygonId, polygons, myahDb, cosmosDb);

    console.log({
        report: report.length,
    });

    if(report[0]) {

        let csv = '';
        const fields = Object.keys(report[0]).map(elem => (elem));

        try {
            // csv = parse({ data: report, fields });
            const parser = new Parser({ fields });
            csv = parser.parse(report);
        } catch (err) {
            console.error(err);
        }

        fs.writeFileSync(`premises-export-poly-${polygonId}-${moment().format('DD-MM-YYYY')}.csv`, csv);

        if(emails) {
            const buf = Buffer.from(csv, 'utf8');

            let parsedEmails = [];
            const split = emails.split(',');

            if(split && split.length > 0) {

                parsedEmails = split.map(elem => elem.trim());

            } else {

                parsedEmails = [ emails ]

            }

            const newEmail = new SendgridEmailEntity();
            newEmail.to = parsedEmails;
            newEmail.from = 'hello@youfibre.com';
            newEmail.templateId = 'd-11fb70c66a344dd881d9064f5e03aebf';
            newEmail.dynamicTemplateData = {
                subject: 'Premises export for polygon 40652',
                body: 'csv attached',
            };
            newEmail.attachments = [
                {
                    content: buf.toString('base64'),
                    filename: 'report.csv',
                    type: 'csv',
                    disposition: 'attachment',
                },
            ];
        }
    }


    cosmosDb.close();
    myahDb.close();
    return { modified, errors };
}


/**
 *
 * @param records
 * @private
 */
const mergeFtthDataWithOrdinanceSurvey = async (
    exPolygonId: string,
    polygons: any[],
    db: any,
    db2: any,
): Promise<any[]> => {

    const data = [];

    try {
        for(const parentPolygon of polygons) {

            const l2Polygon = await db2.query(
                `SELECT
        ftth.polygon.geometry,
        ftth.build_status.name build_status_name
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.id = ${parentPolygon.id}
        `);

            const l4Polygons = await db2.query(
                `SELECT
                ftth.polygon.l4_closure_id,
                ftth.polygon.id,
        ftth.polygon.geometry,
        ftth.build_status.name build_status_name
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE St_Intersects(ftth.polygon.geometry, '${parentPolygon.geometry}')
        AND ftth.polygon.name = 'L4'
        `);

            for(const polygon of l4Polygons) {

                // Get the premises
                const premises = await db.query(`
                SELECT *
                FROM os.ab_plus
                WHERE St_Intersects(os.ab_plus.geom, '${polygon.geometry}')
                `);

                for(const premise of premises) {

                    // console.log('data', data);
                    let {
                        line_1,
                        line_2,
                        line_3,
                        post_town,
                        postcode,
                    } = new Address(premise);

                    let fullAddress = '';

                    if(!!line_1) {
                        fullAddress = fullAddress.concat(line_1 + ', ');
                    }
                    if(!!line_2) {
                        fullAddress = fullAddress.concat(line_2 + ', ');
                    }

                    if(!!line_3) {
                        fullAddress = fullAddress.concat(line_3 + ', ');
                    }
                    if(!!post_town) {
                        fullAddress = fullAddress.concat(post_town + ', ');
                    }
                    if(!!post_town) {
                        fullAddress = fullAddress.concat(postcode);
                    }

                    const targetReleaseDate = moment(parentPolygon.target_release_date).format('DD/MM/YYYY');

                    const obj = {
                        exPolygonId: exPolygonId,
                        targetReleaseDate,
                        l2PolygonId: parentPolygon.id,
                        l2BuildStatus: l2Polygon[0].build_status_name,
                        l4PolygonId: polygon.id,
                        l4ClosureId: polygon.l4_closure_id,
                        l4BuildStatus: polygon.build_status_name,
                        premise: fullAddress,
                    }

                    data.push(obj);
                }
            }
        }
        return data;
    } catch (e) {
        console.error(e);
    }
}

execute();


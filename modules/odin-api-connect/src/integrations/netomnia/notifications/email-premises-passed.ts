import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { chunkArray } from '../../../helpers/utilities';


dotenv.config({ path: '../../../../.env' });

export async function execute() {

    const httpClient = new BaseHttpClient();

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

    const buildDone = await cosmosDb.query(
        `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('7-Build Done')
        `);

    const done = await cosmosDb.query(
        `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('8-Done')
        `);

    const buildDoneTotal = await getTotalPremisesByGeoms(buildDone, myahDb);
    const doneTotal = await getTotalPremisesByGeoms(done, myahDb);

    console.log({
        totalPremises: buildDoneTotal + doneTotal,
        buildDoneTotal,
        doneTotal,
    });


    // const premisesPassedRes = await httpClient.getRequest(
    //     baseUrl,
    //     `connect/reporting/premises-passed`,
    //     apiToken,
    // );

    // const premisesPassed = premisesPassedRes['data'];
    // const { totalPremises } = premisesPassed;
    //
    // const orderOverviewRes = await httpClient.getRequest(
    //     baseUrl,
    //     `connect/reporting/orders-overview?orderStageKey=OrderStageActive`,
    //     apiToken,
    // );
    // const metrics = orderOverviewRes['data'];
    //
    // const newEmail = new SendgridEmailEntity();
    // newEmail.to = [
    //     { email: 'frank@youfibre.com' },
    //     { email: 'jeremy@youfibre.com' },
    //     { email: 'zoltan@netomnia.com' },
    // ];
    // newEmail.subject = `Premises Passed ${moment().utc().format('DD-MM-YYYY')}`;
    // newEmail.from = 'hello@youfibre.com';
    // newEmail.templateId = 'd-0a532a2dfbf1496d94a5dd1d072dfa12';
    // newEmail.dynamicTemplateData = {
    //     subject: `Premises Passed ${moment().utc().format('DD-MM-YYYY')}`,
    //     body: `
    // Premises Passed: ${totalPremises}
    // <br />
    // Active Customers: ${metrics.connectedAddresses}
    // <br />
    // ARPU: ${metrics.arpu}
    // `,
    // };
    //
    // console.log('newEmail', newEmail);
    //
    // const res = await HelpersNotificationsApi.sendDynamicEmail(
    //     newEmail,
    //     { authorization: 'Bearer ' + apiToken },
    //     true,
    // )
    // console.log('errors', errors);
    // console.log('modified', modified);

    cosmosDb.close();
    myahDb.close();
    return { modified, errors };
}


/**
 *
 * @param records
 * @private
 */
const getTotalPremisesByGeoms = async (records: any[], db: any): Promise<number> => {

    const chunkedArray = chunkArray(records, 100);

    let totalPremises = 0;

    for(let i = 0; i < chunkedArray.length; i++) {

        const elem = chunkedArray[i];

        const polygonGeoms = elem.map(poly => `${poly.geometry}`);

        let query = '';
        for(let i = 0; i < polygonGeoms.length; i++) {
            if(i === 0) {
                query = `SELECT os.ab_plus.udprn FROM os.ab_plus WHERE class_1 IN ('R', 'C') AND St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`
            } else {
                query = query.concat(` OR St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`);
            }
        }

        const premises = await db.query(query);
        totalPremises += premises.length;
    }

    return totalPremises;
}

execute();


import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import {
    getCableCountByPolygon,
    getCableLengthByPolygon,
} from '../../integrations/netomnia/project-module/helpers/CableQueries';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

/**
 * Report requested on 22 January 2021
 * By Jeremy C
 * EX Polygon
 * Within an EX Polygon
 * Count = Cables with Type Spine
 * Count = Cables with Type Distribution
 * Count = Duct with Type SDuct
 * (For the items above, repeat but measure the total length of each)
 * Count total premises with class_1 = R
 * Count total premises with class_1 = C
 * Count = L1 closures
 * Count L2 closures
 * Count = Chambers Type FW6 that intersect with L1 or L2 (edited)
 * Count = Chambers Type FW10
 */
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

    fs.writeFileSync(`export-polygon-ex-feature-summary-${moment().format('DD-MM-YYYY')}.csv`, csv)

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

            const spineCableLength = await getCableLengthByPolygon(polygon.geometry, 'Spine', db2);
            const distCableLength = await getCableLengthByPolygon(polygon.geometry, 'Distribution', db2);

            const spineCableCount = await getCableCountByPolygon(polygon.geometry, 'Spine', db2);
            const distCableCount = await getCableCountByPolygon(polygon.geometry, 'Distribution', db2);

            const sDuctsCount = await db2.query(`
                SELECT count(*)
                FROM ftth.duct
                LEFT JOIN ftth.duct_type on (ftth.duct_type.id = ftth.duct.type_id)
                WHERE St_Intersects(ftth.duct.geometry, '${polygon.geometry}')
                AND duct_type.name = '2-Sduct'
                `);

            const sDucts = await db2.query(`
                SELECT ST_Length(
                        CASE
                        WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
                            THEN ftth.duct.geometry
                        WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
                            THEN ST_CurveToLine(ftth.duct.geometry)
                        END
                    ) as length
                FROM ftth.duct
                LEFT JOIN ftth.duct_type on (ftth.duct_type.id = ftth.duct.type_id)
                WHERE St_Intersects(ftth.duct.geometry, '${polygon.geometry}')
                AND duct_type.name = '2-Sduct'
                `);

            let sDuctsLength = 0;
            if(sDucts[0]) {
                for(const duct of sDucts) {
                    sDuctsLength += duct.length
                }
            }


            const premisesR = await db.query(`
            SELECT count(*)
            FROM os.ab_plus
            WHERE St_Intersects(os.ab_plus.geom, '${polygon.geometry}')
            AND os.ab_plus.class_1 = 'R'
            `);

            const premisesC = await db.query(`
            SELECT count(*)
            FROM os.ab_plus
            WHERE St_Intersects(os.ab_plus.geom, '${polygon.geometry}')
            AND os.ab_plus.class_1 = 'C'
            `);


            const l1Closures = await db2.query(
                `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${polygon.geometry}')
                    AND ftth.closure_type.name = 'L1'
                    `);

            const l2Closures = await db2.query(
                `SELECT ftth.closure.id, ftth.closure.geometry
                    FROM ftth.closure
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = ftth.closure.type_id)
                    WHERE St_Intersects(ftth.closure.geometry, '${polygon.geometry}')
                    AND ftth.closure_type.name = 'L2'
                    `);

            // count all FW6 chambers that intersect with an L1 or L2 closure
            let chamberFw6 = 0;
            for(const closureId of [ ...l1Closures.map(elem => elem.id), ...l2Closures.map(elem => elem.id) ]) {

                const chamber = await db2.query(`
                SELECT count(*)
                FROM ftth.chamber, ftth.closure
                WHERE ST_Intersects(ftth.chamber.geometry, ftth.closure.geometry)
                AND ftth.closure.id = ${closureId}
                AND ftth.chamber.model_id = 2;
                `);

                if(chamber[0]) {
                    chamberFw6 += Number(chamber[0].count);
                }
            }

            const chamber = await db2.query(`
                SELECT count(*)
                FROM ftth.chamber
                WHERE ST_Intersects(ftth.chamber.geometry, '${polygon.geometry}')
                AND ftth.chamber.model_id = 10;
                `);

            let chamberFw10 = 0;
            if(chamber[0]) {
                chamberFw10 += Number(chamber[0].count);
            }

            const obj = {
                polygonId: polygon.id,
                premises_r_ct: Number(premisesR[0].count),
                premises_c_ct: Number(premisesC[0].count),
                closures_l1_ct: l1Closures.length,
                closures_l2_ct: l2Closures.length,
                cables_spine_ct: spineCableCount,
                cables_spine_len: spineCableLength,
                cables_dist_ct: distCableCount,
                cables_dist_len: distCableLength,
                ducts_sduct_ct: sDuctsCount[0] ? Number(sDuctsCount[0].count) : 0,
                ducts_sduct_len: sDuctsLength,
                chambers_fw6_ct: chamberFw6,
                chambers_fw10_ct: chamberFw10,

            }

            console.log('objec', obj);

            const update = await db2.query(`
                UPDATE ftth.polygon
                SET
                    premises_r_ct = ${obj.premises_r_ct},
                    premises_c_ct = ${obj.premises_c_ct},
                    closures_l1_ct = ${obj.closures_l1_ct},
                    closures_l2_ct = ${obj.closures_l2_ct},
                    cables_spine_ct = ${obj.cables_spine_ct},
                    cables_spine_len = ${obj.cables_spine_len},
                    cables_dist_ct = ${obj.cables_dist_ct},
                    cables_dist_len = ${obj.cables_dist_len},
                    ducts_sduct_ct = ${obj.ducts_sduct_ct},
                    ducts_sduct_len = ${obj.ducts_sduct_len},
                    chambers_fw6_ct = ${obj.chambers_fw6_ct},
                    chambers_fw10_ct = ${obj.chambers_fw10_ct}
                WHERE ftth.polygon.id = ${polygon.id};
                `);

            console.log('update', update);

            data.push(obj);
        }

        return data;
    } catch (e) {
        console.error(e);
    }
}

execute();


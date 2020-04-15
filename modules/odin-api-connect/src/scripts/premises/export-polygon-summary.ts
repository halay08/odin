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

            let totalPremisesBuildDone = 0;
            let totalPremisesDone = 0;

            //     const l4PolyBuildDone = await db2.query(
            //         `SELECT
            //    ftth.polygon.geometry
            // FROM ftth.polygon
            // LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
            // WHERE St_Intersects(ftth.polygon.geometry, '${polygon.geometry}')
            // AND ftth.polygon.name = 'L4'
            // AND ftth.build_status.name = '7-Build Done'
            // `);
            //
            //     const l4PolyDone = await db2.query(
            //         `SELECT
            //     ftth.polygon.name,
            //     ftth.polygon.id,
            //     ftth.polygon.geometry
            // FROM ftth.polygon
            // LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
            // WHERE St_Intersects(ftth.polygon.geometry, '${polygon.geometry}')
            // AND ftth.polygon.name = 'L4'
            // AND ftth.build_status.name = '8-Done'
            // `);
            //
            //     if(l4PolyBuildDone[0]) {
            //         for(const l4poly of l4PolyBuildDone) {
            //             const premisesBuildDone = await db.query(`
            //         SELECT os.ab_plus.udprn
            //         FROM os.ab_plus
            //         WHERE St_Intersects(os.ab_plus.geom, '${l4poly.geometry}')
            //         GROUP BY os.ab_plus.udprn`);
            //             console.log('premisesBuildDone.length', premisesBuildDone.length);
            //
            //             totalPremisesBuildDone += premisesBuildDone.length;
            //         }
            //     }
            //
            //     if(l4PolyDone[0]) {
            //         for(const l4poly of l4PolyDone) {
            //             const premisesDone = await db.query(`
            //         SELECT os.ab_plus.udprn
            //         FROM os.ab_plus
            //         WHERE St_Intersects(os.ab_plus.geom, '${l4poly.geometry}')
            //         GROUP BY os.ab_plus.udprn`);
            //             console.log('premisesDone.length', premisesDone.length);
            //             totalPremisesDone += premisesDone.length;
            //         }
            //     }

            const premises = await db.query(`
        SELECT os.ab_plus.udprn, os.ab_plus.post_town
        FROM os.ab_plus
        WHERE St_Intersects(os.ab_plus.geom, '${polygon.geometry}')
        `);

            //     const openReachPoles = await db.query(`
            // SELECT openreach.structure.objectid
            // FROM openreach.structure
            // WHERE St_Intersects(openreach.structure.geom, '${polygon.geometry}')
            // AND category_name = 'POLE'`);
            //
            //     const openReachDuctsND = await db.query(`
            // SELECT ST_Length(
            //         CASE
            //         WHEN ST_GeometryType(openreach.duct.geom) <> 'ST_MultiCurve'
            //             THEN openreach.duct.geom
            //         WHEN ST_GeometryType(openreach.duct.geom) = 'ST_MultiCurve'
            //             THEN ST_CurveToLine(openreach.duct.geom)
            //         END
            //     ) as duct_length
            // FROM openreach.duct
            // WHERE St_Intersects(openreach.duct.geom, '${polygon.geometry}')
            // AND object_class = 'ND'`);
            //
            //     const openReachDucts = await db.query(`
            // SELECT ST_Length(
            //         CASE
            //         WHEN ST_GeometryType(openreach.duct.geom) <> 'ST_MultiCurve'
            //             THEN openreach.duct.geom
            //         WHEN ST_GeometryType(openreach.duct.geom) = 'ST_MultiCurve'
            //             THEN ST_CurveToLine(openreach.duct.geom)
            //         END
            //     ) as duct_length
            // FROM openreach.duct
            // WHERE St_Intersects(openreach.duct.geom, '${polygon.geometry}')
            // AND object_class != 'ND'`);
            //
            //     const ducts = await db2.query(`
            // SELECT ST_Length(
            // CASE
            // WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
            //     THEN ftth.duct.geometry
            // WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
            //     THEN ST_CurveToLine(ftth.duct.geometry)
            //     END
            // ) as duct_length
            // FROM ftth.polygon, ftth.duct
            // LEFT JOIN ftth.duct_type ON (ftth.duct_type.id = ftth.duct.type_id)
            // LEFT JOIN ftth.surface_type ON (ftth.surface_type.id = ftth.duct.surface_type_id)
            // LEFT JOIN ftth.duct_model ON (ftth.duct_model.id = ftth.duct.model_id)
            // WHERE ST_Intersects(ftth.duct.geometry, ftth.polygon.geometry)
            // AND ftth.duct_type.name = '1-Duct'
            // AND ftth.polygon.id = ${polygon.id};
            // `);
            //
            //     let totalORNdDuctLength = 0;
            //     if(openReachDuctsND[0]) {
            //         for(const elem of openReachDuctsND) {
            //             totalORNdDuctLength += elem.duct_length
            //         }
            //     }
            //
            //     let totalORDuctLength = 0;
            //     if(openReachDucts[0]) {
            //         for(const elem of openReachDucts) {
            //             totalORDuctLength += elem.duct_length
            //         }
            //     }
            //
            //     let totalDuctLength = 0;
            //     if(ducts[0]) {
            //         for(const elem of ducts) {
            //             totalDuctLength += elem.duct_length
            //         }
            //     }

            const obj = {
                polygonId: polygon.id,
                postTown: premises[0].post_town,
                premiseCount: premises.length,
                // ductLength: totalDuctLength,
                // openReachDuctND: totalORNdDuctLength,
                // openReachDuct: totalORDuctLength,
                // poleCount: openReachPoles.length,
                // premisesDone: totalPremisesDone,
                // premisesBuildDone: totalPremisesBuildDone,

            }

            console.log('objec', obj);

            data.push(obj);
        }

        return data;
    } catch (e) {
        console.error(e);
    }
}

execute();


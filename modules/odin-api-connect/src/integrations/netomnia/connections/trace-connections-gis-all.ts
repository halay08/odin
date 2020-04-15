import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });


const traces = [];
const searched = [];

// Use this script to get all the intersecting cables, closures
async function execute() {


    let cosmosDb;

    let argPolygonId = process.argv.find(arg => arg.indexOf('polyid') > -1);
    let polygonId = argPolygonId ? argPolygonId.split('=')[1] : null;

    let argCableType = process.argv.find(arg => arg.indexOf('cabtype') > -1);
    let cableType = argCableType ? argCableType.split('=')[1] : null;

    let argStartClosureType = process.argv.find(arg => arg.indexOf('startclosure') > -1);
    let startClosureType = argStartClosureType ? argStartClosureType.split('=')[1] : null;

    let argEndClosureType = process.argv.find(arg => arg.indexOf('endclosure') > -1);
    let endClosureType = argEndClosureType ? argEndClosureType.split('=')[1] : null;

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

    try {

        const closuresByPolygon = await getCablesAndClosuresByPolygonId(
            cosmosDb,
            polygonId,
            endClosureType,
            cableType,
            startClosureType,
        );

        for(let startClosure of closuresByPolygon) {

            const res = await recursivelyTraceCablesToClosures(startClosure, cosmosDb)
            console.log('res', res)

            const closure = {
                'id': startClosure.id,
                'type': startClosureType,
                'cables': res,
            }

            traces.push(closure)

        }

        console.log('traces', traces)
        fs.writeFileSync('./closure-cable-traces-all-gis.json', JSON.stringify(traces))

        cosmosDb.close();

        return { traces };

    } catch (e) {
        console.error(e);
    }
}


/**
 *
 * @param startClosure
 * @param cosmosDb
 */
async function recursivelyTraceCablesToClosures(startClosure: any, cosmosDb: any) {

    if(startClosure.cables) {
        // Map over all the cables
        const cableTraces = startClosure.cables;

        for(const cable of startClosure.cables) {
            console.log('cable', cable);
            if(cable.closures) {

                const filtered = cable.closures.filter(elem => ![
                    startClosure.id,
                    ...searched,
                ].includes(elem.id));

                console.log('filtered', filtered);

                for(const targetClosure of filtered) {
                    console.log('targetClosure', targetClosure);
                    if(!targetClosure['cables']) {
                        targetClosure['cables'] = []
                    }
                    const combos = getClosureCableCombinations(targetClosure.type);
                    if(combos) {
                        for(const combo of combos) {
                            console.log('combo', combo)

                            const closure = await getIntersectingCablesAndClosuresByClosureId(
                                cosmosDb,
                                combo.endClosureType,
                                combo.cableType,
                                combo.startClosureType,
                                targetClosure.id,
                            );
                            // add the nested closures
                            if(closure) {
                                targetClosure['cables'].push(...closure.cables)
                                console.log('closure', closure)
                            }
                            searched.push(targetClosure.id);
                            await recursivelyTraceCablesToClosures(targetClosure, cosmosDb)
                        }
                    }
                }
            }
        }

        console.log('cableTraces', cableTraces);
        return cableTraces;
    }

}

function getClosureCableCombinations(startType: string) {

    if(startType === 'L1') {
        return [
            {
                cableType: 'Spine',
                startClosureType: startType,
                endClosureType: 'L1',
            },
            {
                cableType: 'Distribution',
                startClosureType: startType,
                endClosureType: 'L2',
            },
        ]
    }

    if(startType === 'L2') {
        return [
            {
                cableType: 'Distribution',
                startClosureType: startType,
                endClosureType: 'L2',
            },
            {
                cableType: 'Access',
                startClosureType: startType,
                endClosureType: 'L3',
            },
        ]
    }

    if(startType === 'L3') {
        return [
            {
                cableType: 'Access',
                startClosureType: startType,
                endClosureType: 'L3',
            },
            {
                cableType: 'Feed',
                startClosureType: startType,
                endClosureType: 'L4',
            },
        ]
    }
}

/**
 * This returns closures by polygon
 *
 * @param cosmosDb
 * @param polygonId
 * @param endClosureType
 * @param cableType
 * @param startClosureType
 */
async function getCablesAndClosuresByPolygonId(
    cosmosDb,
    polygonId: string,
    endClosureType: string,
    cableType: string,
    startClosureType: string,
) {
    const polygon = await cosmosDb.query(`
        SELECT
            ftth.polygon.name,
            ftth.polygon.id,
            ftth.polygon.geometry
        FROM ftth.polygon
            LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.id = ${polygonId}
        `);


    const closuresByPolygon = await cosmosDb.query(`
             SELECT
                c.id,
                ct.name as type,
                d.cables
            FROM ftth.closure c
            LEFT JOIN ftth.closure_type as ct ON (ct.id = c.type_id)
            LEFT JOIN LATERAL (
                SELECT json_agg(
                json_build_object(
                    'id', cb.id,
                    'type', cbt.name,
                    'closures', e.closures,
                    'length', cb.length
                )
            ) AS cables
            FROM ftth.cable as cb
            LEFT JOIN ftth.cable_type as cbt ON (cb.type_id = cbt.id)
            LEFT JOIN LATERAL (
                SELECT json_agg(
                        json_build_object(
                            'id', clo.id,
                            'type', ftth.closure_type.name,
                            'distFromStart', ST_Distance(c.geometry, clo.geometry)
                        )
                    ) AS closures
                    FROM ftth.closure as clo
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = clo.type_id)
                    WHERE ST_Intersects(cb.geometry, clo.geometry)
                    AND ftth.closure_type.name IN ('${endClosureType}')
                    AND clo.id != c.id
                ) AS e on true
                WHERE ST_Intersects(cb.geometry, c.geometry)
             AND cbt.name = '${cableType}'
            ) AS d on true
            WHERE ct.name = '${startClosureType}'
            AND d.cables IS NOT NULL
            AND c.id = 224;
        `);

    return closuresByPolygon;
}


/**
 *
 * This returns a 1 level nested closure -> cables -> closures
 *
 * @param cosmosDb
 * @param endClosureType
 * @param cableType
 * @param startClosureType
 * @param startClosureId
 */
async function getIntersectingCablesAndClosuresByClosureId(
    cosmosDb,
    endClosureType: string,
    cableType: string,
    startClosureType: string,
    startClosureId: any,
) {

    console.log({
        endClosureType,
        cableType,
        startClosureType,
        startClosureId,
    })

    const nestedIntersects = await cosmosDb.query(`
             SELECT
                c.id,
                ct.name as type,
                d.cables
            FROM ftth.closure c
            LEFT JOIN ftth.closure_type as ct ON (ct.id = c.type_id)
            LEFT JOIN LATERAL (
                SELECT json_agg(
                json_build_object(
                    'id', cb.id,
                    'type', cbt.name,
                    'closures', e.closures,
                    'length', cb.length
                )
            ) AS cables
            FROM ftth.cable as cb
            LEFT JOIN ftth.cable_type as cbt ON (cb.type_id = cbt.id)
            LEFT JOIN LATERAL (
                SELECT json_agg(
                        json_build_object(
                            'id', clo.id,
                            'type', ftth.closure_type.name,
                            'distFromStart', ST_Distance(c.geometry, clo.geometry)
                        )
                    ) AS closures
                    FROM ftth.closure as clo
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = clo.type_id)
                    WHERE ST_Intersects(cb.geometry, clo.geometry)
                    AND ftth.closure_type.name IN ('${endClosureType}')
                    AND clo.id != c.id
                ) AS e on true
                WHERE ST_Intersects(cb.geometry, c.geometry)
             AND cbt.name = '${cableType}'
            ) AS d on true
            WHERE ct.name = '${startClosureType}'
            AND d.cables IS NOT NULL
            AND c.id = ${startClosureId};
        `);

    return nestedIntersects[0]

}

execute();


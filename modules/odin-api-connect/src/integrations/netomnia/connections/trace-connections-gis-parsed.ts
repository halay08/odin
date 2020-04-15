import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });


const traces = []
let searched = []

let connectionMappings = []

let argClosureId = process.argv.find(arg => arg.indexOf('closureid') > -1);
let closureId = argClosureId ? argClosureId.split('=')[1] : null;

let argCableType = process.argv.find(arg => arg.indexOf('cabtype') > -1);
let cableType = argCableType ? argCableType.split('=')[1] : null;

async function execute() {

    let cosmosDb;


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

        const startClosure = await getIntersectingCablesByClosureId(
            cosmosDb,
            closureId,
            cableType,
        );

        // Create an object tree that finds all closure and cable intersects
        const closure = await recursivelyTraceCablesToClosures(startClosure, cosmosDb)

        console.log('closure', closure)

        traces.push(closure)

        fs.writeFileSync('./closure-cable-traces-gis.json', JSON.stringify(traces))
        // fs.writeFileSync('./orphan-cables-gis.json', JSON.stringify(orphanCablesUnique))

        cosmosDb.close();

        return;

    } catch (e) {
        console.error(e);
    }
}


/**
 * When there are multiple closures intersecting cables
 * we want to get the farthest closure
 *
 * You should only send in closures with the same Type i.e
 * only an array of L2s or only an array of L3s etc..
 *
 * @param closures
 */
function findFarthestClosure(closures: any) {

    let closure = closures[0];

    if(closures.length > 1) {

        // sorts closures farthest to nearest
        // first item in the array is the farthest
        const sorted = closures.sort((a, b) => b.distFromStart - a.distFromStart);


        // Check for closures that have the same length
        const multipleMatches = findMatchingLengths(closures, sorted[0])

        console.log('multipleMatches', multipleMatches);

        if(multipleMatches) {
            console.log('CLOSURE_SAME_DISTANCE', multipleMatches)

            const inClosureIds = connectionMappings.map(elem => elem.inClosure);
            console.log('inClosureIds', inClosureIds);

            const availableClosure = multipleMatches.find(elem => !inClosureIds.includes(elem.id))

            console.log('availableClosure', availableClosure)
            return availableClosure;
            // find the next available closure
        } else {

            // return the closure farthest away
            closure = sorted[0]

        }

    }

    return closure

}

function findMatchingLengths(closures: any, nearest: any) {

    const matched = closures.filter(elem => elem.distFromStart === nearest.distFromStart)

    console.log('matched', matched)

    if(matched.length > 1) {
        return matched;
        // we have two closures the same distance
    }

}


/**
 * This functoin will take the raw traces and filter using the connection mappings
 * it removes any double intersecting closures
 *
 * @param closure
 */
function parseTracesWithNetworkMap(closure: any) {
    console.log('parseTracesWithNetworkMap')

    if(closure.cables) {

        const cableIds = closure.cables.map(elem => elem.id);
        // is this the out closure for the cable
        const connections = connectionMappings.filter(elem => elem.outClosure === closure.id && cableIds.includes(elem.outCable));
        const outConnectionCableIds = connections.map(elem => elem.outCable);

        const filteredCables = closure.cables.filter(elem => outConnectionCableIds.includes(elem.id))

        console.log('filteredCables', filteredCables)

        closure.cables = filteredCables


        for(const cable of closure.cables) {

            console.log('cable', cable)
            if(cable.closures) {

                for(const closure of cable.closures) {

                    const connection = connectionMappings.find(elem => elem.inCable === cable.id && elem.inClosure === closure.id);
                    console.log('connection', connection)
                    if(connection) {
                        cable['closures'] = [ closure ]
                        console.log('inCableClosure', closure)
                    } else if(!connectionMappings.find(elem => elem.inCable === cable.id)) {
                        // and if this cable is not used
                        cable['closures'] = []
                    }

                    parseTracesWithNetworkMap(closure)
                }
            }
        }

        return closure.cables
    }
}

const searchedCables = [];
let searchedCablesObj = {}
let searchingCable;
let searchingClosure;

/**
 *
 * @param startClosure
 * @param cosmosDb
 */
async function recursivelyTraceCablesToClosures(
    closure: any,
    cosmosDb: any,
) {

    console.log('---------------------------------------------')
    console.log(`RECURSIVE_LOOP_${closure.id}`)
    console.log('---------------------------------------------')

    console.log('searched', JSON.stringify(searched))
    console.log('---------------------------------------------')
    console.log('searchedCables', JSON.stringify(searchedCables))

    console.log('CONNECTION_MAPPINGS', connectionMappings)
    console.log(`SEARCHING_CABLE_${searchingCable}_`)
    console.log(`SEARCHING_CLOSURE_${searchingClosure}_`)


    let shouldTrace = true
    if(searchingCable && searchingClosure) {
        const connection = connectionMappings.find(elem => elem.inClosure === searchingClosure)
        if(connection) {
            console.log('SEARCH', searchingClosure, connection.inClosure)
            shouldTrace = searchingCable === connection.inCable;
        }
    }

    console.log('SHOULD_TRACE', shouldTrace)

    if(shouldTrace && closure) {
        const cableTypes = getClosureCableCombinations(closure.type)

        if(cableTypes) {

            let cables = []
            for(const cableType of cableTypes) {

                console.log('cableTye', cableType)
                const nextClosureAndCables = await getIntersectingCablesByClosureId(
                    cosmosDb,
                    closure.id,
                    cableType,
                );

                if(nextClosureAndCables && nextClosureAndCables.cables) {

                    console.log(`${closure.id}_CLOSURE_CABLES_BEFORE`, nextClosureAndCables.cables)

                    for(const cable of nextClosureAndCables.cables) {

                        if(!searchedCablesObj[cable.type]) {
                            searchedCablesObj[cable.type] = [ cable.id ]
                        } else {
                            searchedCablesObj[cable.type].push(cable.id)
                        }

                        searchedCables.push(cable.id)

                        const closureTypes = getCableClosureCombinations(cable.type)

                        for(const closureType of closureTypes) {

                            const cableClosures = await getIntersectingClosuresByCableId(
                                cosmosDb,
                                cable.id,
                                closure.id,
                                closureType,
                            )

                            console.log(`${cable.id}_CABLE_CLOSURES`, cableClosures)

                            if(cableClosures) {
                                let nextClosure = cableClosures[0];
                                // get the farthest closure
                                if(cableClosures.length > 0) {

                                    nextClosure = findFarthestClosure(cableClosures)
                                    if(nextClosure) {
                                        console.log(`${nextClosure.id}_NEXT_CLOSURE`, nextClosure)
                                        if(!cable['closures']) {
                                            cable['closures'] = []
                                        }
                                        connectionMappings.push({
                                            inCable: cable.id,
                                            inClosure: nextClosure.id,
                                        })

                                        cable['closures'] = [ nextClosure ]
                                        cables.push(cable)
                                    } else {
                                        cable['closures'] = []
                                    }

                                }
                            }
                        }

                        if(cables) {
                            console.log(`${closure.id}_CABLES_LN490`, closure['cables'])
                            console.log(`${closure.id}_CABLES_LN491`, cables)
                            closure['cables'] = cables
                        }

                        console.log(`${closure.id}_SET_CLOSURE`, closure)
                    }
                }
            }

            if(closure.cables) {
                for(const cable of closure.cables) {

                    if(!searchedCablesObj[cable.type]) {
                        searchedCablesObj[cable.type] = [ cable.id ]
                    } else {
                        searchedCablesObj[cable.type].push(cable.id)
                    }
                    searchedCables.push(cable.id)

                    console.log(`${cable.id}_CABLE_CLOSURES`, cable.closures)
                    if(cable && cable.closures) {
                        for(const closure of cable.closures) {
                            console.log(`${cable.id}_SET_NESTED_CLOSURES`, closure)
                            searchingCable = cable.id;
                            searchingClosure = closure.id
                            cable['closures'] = [ await recursivelyTraceCablesToClosures(closure, cosmosDb) ]
                        }
                    }
                }
            }
        }
    }
    searched.push(closure.id)
    return closure
}


/**
 * Get the possible closures that would intersect a cable
 *
 * @param cableType
 */
function getCableClosureCombinations(cableType: string) {

    if(cableType === 'Spine') {
        return [ 'L1' ]
    }
    if(cableType === 'Distribution') {
        return [ 'L2' ]
    }
    if(cableType === 'Access') {
        return [ 'L3' ]
    }
    if(cableType === 'Feed') {
        return [ 'L4' ]
    }
}

/**
 * Get the possible closures that would intersect a cable
 *
 * @param cableType
 */
function getClosureCableCombinations(closureType: string) {

    if(closureType === 'L0') {
        return [ 'Spine' ]
    }
    if([ 'L1' ].includes(closureType)) {
        return [ 'Spine', 'Distribution' ]
    }
    if([ 'L2' ].includes(closureType)) {
        return [ 'Distribution', 'Access' ]
    }
    if([ 'L3' ].includes(closureType)) {
        return [ 'Access', 'Feed' ]
    }
}


/**
 *
 * This returns a 1 level nested closure -> cables -> closures
 *
 * @param cosmosDb
 * @param startClosureType
 * @param startClosureId
 * @param cableType
 */
async function getIntersectingCablesByClosureId(
    cosmosDb,
    startClosureId: any,
    cableType: string,
) {

    console.log(searchedCablesObj[cableType])

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
                        'length', cb.length
                    )
                ) AS cables
                FROM ftth.cable as cb
                LEFT JOIN ftth.cable_type as cbt ON (cb.type_id = cbt.id)
                WHERE cbt.name = '${cableType}'
                AND cb.id NOT IN (${searchedCables && searchedCables.length < 1 ? '0' : searchedCables.map(elem => `'${elem}'`)})
                AND CASE
                    WHEN ST_GeometryType(cb.geometry) <> 'ST_MultiCurve'
                        THEN ST_Intersects(cb.geometry, c.geometry)
                    WHEN ST_GeometryType(cb.geometry) = 'ST_MultiCurve'
                        THEN ST_Intersects(ST_CurveToLine(cb.geometry), c.geometry)
                END
                 ) AS d on true
            WHERE d.cables IS NOT NULL
            AND c.id = ${startClosureId};
        `);

    // we want to sort the cables ascending by length
    if(nestedIntersects[0] && nestedIntersects[0].cables) {
        nestedIntersects[0].cables.sort((a, b) => a.length - b.length);
    }

    return nestedIntersects[0]

}

/**
 *
 * This returns a 1 level nested closure -> cables -> closures
 *
 * @param cosmosDb
 * @param closureType
 * @param cableId
 * @param startClosureId
 */
async function getIntersectingClosuresByCableId(
    cosmosDb,
    cableId: string,
    startClosureId: string,
    closureType: string,
) {

    const nestedIntersects = await cosmosDb.query(`
              SELECT
                cb.id,
                cbt.name as type,
                e.closures
            FROM ftth.cable as cb
            LEFT JOIN ftth.cable_type as cbt ON (cb.type_id = cbt.id)
            LEFT JOIN LATERAL (
                SELECT json_agg(
                        json_build_object(
                            'id', clo.id,
                            'type', ftth.closure_type.name
                        )
                    ) AS closures
                    FROM ftth.closure as clo
                    LEFT JOIN ftth.closure_type ON (ftth.closure_type.id = clo.type_id)
                    WHERE ftth.closure_type.name = '${closureType}'
                    AND clo.id != ${startClosureId}
                    AND CASE
                        WHEN ST_GeometryType(cb.geometry) <> 'ST_MultiCurve'
                            THEN ST_Intersects(cb.geometry, clo.geometry)
                        WHEN ST_GeometryType(cb.geometry) = 'ST_MultiCurve'
                            THEN ST_Intersects(ST_CurveToLine(cb.geometry), clo.geometry)
                    END
                ) AS e on true
            WHERE cb.id = ${cableId};
        `);

    console.log(nestedIntersects[0])

    let closureWithDistances = []

    console.log(`${startClosureId}_START_CLOSURE_FOR_DISTANCE`)
    if(nestedIntersects[0]['closures']) {
        for(const closure of nestedIntersects[0]['closures']) {

            const distFromStartClosure = await cosmosDb.query(`
             SELECT
                a.id,
                ST_Distance(a.geometry, b.geometry)
            FROM ftth.closure a, ftth.closure b
            WHERE a.id = ${startClosureId}
            AND b.id = ${closure.id};
        `);

            closure['distFromStart'] = distFromStartClosure[0]['st_distance']
            closureWithDistances.push(closure)

        }
    }

    return closureWithDistances

}

execute();


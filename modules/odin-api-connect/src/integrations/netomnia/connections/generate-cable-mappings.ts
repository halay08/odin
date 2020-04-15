import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

const closures = require('./closure-cable-traces-gis.json');

let loopCables = []
let cableL4Count = {}
let connectionMappings = []


async function execute() {

    let odinDb;

    try {

        odinDb = await createConnection({
            type: 'postgres',
            name: 'odinDb',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [],
        });
    } catch (e) {

        console.error(e);
        odinDb = await getConnection('cosmosDb');
    }

    const errors = [];
    const modified = [];

    try {

        console.log('closures', closures)
        // Clone the object, parse the tree to identify the loop cable
        // this uses the algorithm to find the path with the least number
        // of splices to be done using the # of L4s in the path from L2 -> L4
        console.log('closures', closures)
        for(const closure of closures) {

            const clone = JSON.parse(JSON.stringify(closure));
            console.log(clone);
            setParents(clone);
            setCountAndScore(clone, 'L4');
            getCables(clone).forEach(function (accessCable) {
                recursivelySetLoopCable(accessCable, 'Access', 'L4');
                recursivelySetLoopCable(accessCable, 'Distribution', 'L4');
                recursivelySetLoopCable(accessCable, 'Spine', 'L4');
            });
            //console.log(getCables(root)[0]["loopCable"]);
            printLevels(clone);

            // Flattens the nested tree into (In / Out) connection mappings
            await createConnectionMapFromTraces([ closure ])

        }

        fs.writeFileSync('./closure-cable-mappings-gis.json', JSON.stringify(connectionMappings))

        odinDb.close();

        return { modified, errors };

    } catch (e) {
        console.error(e);
    }
}


/**
 * New way of mapping cables we do not recursively go down each branch and sub branches
 * we do all the branches for the current node before going down each of the child branches
 *
 * @param startClosuresToMap
 */
async function createConnectionMapFromTraces(startClosuresToMap: any) {

    console.log('STARTING_createConnectionMapFromTraces')
    let closuresToMap = startClosuresToMap;

    console.log('closuresToMap.length', closuresToMap.length)

    console.log('closuresToMap', closuresToMap)

    for(const outClosure of closuresToMap) {
        console.log(`${outClosure.id}_MAPPING_CLOSURE`, outClosure)
        if(outClosure.cables) {

            for(const cable of outClosure.cables) {

                console.log(`${cable.id}_MAPPING_CABLE`, cable)

                if(cable.closures) {
                    for(const closure of cable.closures) {

                        // only if the closure is not an in closure elsewhere
                        // only if the cable is not an in cable elsewhere
                        if(closure) {
                            // // check that the cable is not
                            // console.log('IN_CABLE_CONNECTIONS', connectionMappings.map(elem => elem.inCable))
                            //
                            const cableIsAvailable = !connectionMappings.find(elem => elem.inCable === cable.id)
                            const closureIsAvailable = !connectionMappings.find(elem => elem.inClosure === closure.id)
                            if(cableIsAvailable && closureIsAvailable) {

                                connectionMappings.push({
                                    outClosure: outClosure.id,
                                    outClosureType: outClosure.type,
                                    outCable: cable.id,
                                    outCableType: cable.type,
                                    inClosure: closure.id,
                                    inClosureType: closure.type,
                                    inCable: cable.id,
                                    inCableType: cable.type,
                                    isLoopCable: loopCables.includes(cable.id),
                                    l4ClosureCount: cableL4Count[cable.id],
                                })

                            }
                            // next closures to map
                            await createConnectionMapFromTraces([ closure ])
                        }
                    }
                }
            }
        }
    }
}

/**
 * Find out whether the provided level is a closure or not.
 * @param {object} level The level you wish to know whether it is a closure or not.
 * @returns Whether or not the level provided is a closure.
 */
function isClosure(level) {
    if(!level) return false;
    var closureTypes = [ 'L0', 'L1', 'L2', 'L3', 'L4' ];
    return closureTypes.indexOf(level['type']) >= 0;
}

/**
 * Gathers and returns all cables found within the provided Closure.
 * @param {object} level The closure.
 * @returns A list of Cables.
 */
function getCables(level) {
    if(!isClosure(level)) return null;
    return level['cables'] || [];
}

/**
 * Gathers and returns all closures found within the provided Cable.
 * @param {object} level The cable.
 * @returns A list of Closures.
 */
function getClosures(level) {
    if(isClosure(level)) return null;
    return level['closures'] || [];
}

/**
 * Using a top-down approach, set the parent of the level to the level above it.
 * @param {object} level The level at which to begin setting the parent node.
 * @param {object} parent The parent as dictated through recursion. This is not present on the initial/root level.
 */
function setParents(level, parent = null) {
    level['parent'] = parent;

    if(isClosure(level)) {
        getCables(level).forEach(function (cable) {
            setParents(cable, level);
        });
        return;
    }

    getClosures(level).forEach(function (closure) {
        setParents(closure, level);
    });
}

/**
 * Counts the number of closures of the specified type below the level requested.
 * @param {object} level The level at which to begin counting below.
 * @param {string} type The type of level to count (e.g. L1/1/2/3/4).
 * @returns The total number of closures of the requested type found below the requested level.
 */
function countNumClosuresOfTypeBelow(level, type) {
    type = type.toLowerCase();

    var children = (isClosure(level) ? getCables(level) : getClosures(level));
    var deepCount = children.reduce(function (total, child) {
        return total + countNumClosuresOfTypeBelow(child, type);
    }, 0);

    return children.reduce(function (total, closure) {
        if(closure['type'].toLowerCase() !== type) return total;
        return total + 1;
    }, deepCount);
}

/**
 * Assumes parents have already been assigned.
 * Calculates the score for the specified level based on its parent score plus the count property.
 * @param {object} level The level for which to calculate the score.
 * @param {string} type The type of score to use (e.g. L1/2/3/4).
 * @returns The calculated score for the specified level.
 */
function calculateScore(level, type) {
    type = type.toLowerCase();
    if(!level['parent']) {
        return level[type + 'Count'];
    }
    return level[type + 'Count'] + level['parent'][type + 'Score'];
}

/**
 * Using a top-down approach, calculate the number of closures below the initial level,
 * until every level has a <type>Count and <type>Score property attached.
 * @param {object} level The level at which to begin setting the counts and scores.
 * @param {string} type The type of score to use (e.g. L1/2/3/4).
 */
function setCountAndScore(level, type) {
    type = type.toLowerCase();
    level[type + 'Count'] = countNumClosuresOfTypeBelow(level, type);
    level[type + 'Score'] = calculateScore(level, type);

    var children = (isClosure(level) ? getCables(level) : getClosures(level));
    children.forEach(function (child) {
        setCountAndScore(child, type);
    });
}

/**
 * Locates the best cable of the specified type, based on the scores for
 * the specified scoreType.
 * @param {object} level The level at which to begin searching.
 * @param {string} type The type of level to find and return (e.g. L1/2/3/4).
 * @param {string} scoreType The type of score to use for judging (e.g. L1/2/3/4).
 * @returns The best cable as dictated by the scoreType.
 */
function findBestCableOfType(level, type, scoreType) {
    type = type.toLowerCase();
    scoreType = scoreType.toLowerCase();

    var children = (isClosure(level) ? getCables(level) : getClosures(level));
    return children.reduce(function (best, current) {
        var newBest = best;

        // If we have a cable then we evaluate whether it is better than newBest.
        if(!isClosure(current)) {
            if(current['type'].toLowerCase() === type
                && (newBest === null || current[scoreType + 'Score'] > newBest[scoreType + 'Score'])) {
                newBest = current;
            }
        }

        // We search deeper (top-down recursion) to see if there is something better, then compare again.
        var deeperBest = findBestCableOfType(current, type, scoreType);
        if(deeperBest && (newBest === null || deeperBest[scoreType + 'Score'] > newBest[scoreType + 'Score'])) {
            newBest = deeperBest;
        }

        // At the end, we return the best, if there is one.
        return newBest;
    }, null);
}

/**
 * Using a bottom-up approach, compile a list of cables to form a "loop cable".
 * @param {object} level The level at which to begin setting the loop cable.
 * @param {string} closureType The type of closure to work within (e.g. L1/2/3/4).
 * @param {string} cableType The type of cable to work include in the loop cable (e.g. Spine/Access/Feed).
 * @param {object} current The current loop cable as a list of cable IDs.
 */
function setLoopCable(level, closureType = null, cableType = null, current = []) {
    if(!level) throw new Error('Tried calling setLoopCable with null level.');

    if(isClosure(level)) {
        setLoopCable(level['parent'], closureType, cableType, current);
        return;
    }

    if(closureType === null) closureType = level['parent']['type'];
    if(cableType === null) cableType = level['type'];

    if(level['loopCable'] && level['loopCable'].length > 0) return;

    current.push(level);

    var currentIds = [];
    current.forEach(function (cur) {
        currentIds.push(cur['id']);
    });

    current.forEach(function (cur) {
        if(currentIds.length > 1) cur['loopCable'] = currentIds;
    });

    // Only continue climbing until we reach a different type of level.
    if(level['parent'] && level['parent']['type'].toLowerCase() === closureType.toLowerCase()) {
        setLoopCable(level['parent'], closureType, cableType, current);
    }
}

/**
 * Recursively, using a bottom-down approach, find the best cables and then use
 * setLoopCable's bottom-up approach to determine and set the loop cable.
 * @param {object} level The level to begin from.
 * @param {string} type The type of cable to find (e.g. Spine, Access, Feed)
 * @param {string} scoreType The type of score to use (e.g. L1/2/3/4).
 */
function recursivelySetLoopCable(level, type, scoreType) {

    if(isClosure(level)) {
        var bestCable = findBestCableOfType(level, type, scoreType);
        if(bestCable) setLoopCable(bestCable);
        getCables(level).forEach(function (cable) {
            recursivelySetLoopCable(cable, type, scoreType);
        });
        return;
    }
    getClosures(level).forEach(function (closure) {
        recursivelySetLoopCable(closure, type, scoreType);
    });
}


function printLevels(level, index = 0) {
    if(isClosure(level)) {

        if(level['loopCable']) {
            loopCables.push(...level['loopCable'])
            console.log('LOOP_CABLES', level['loopCable'])
        }

        // console.log(
        //     '    '.repeat(index),
        //     level['type'],
        //     'CLOSURE',
        //     level['id'],
        // );
        getCables(level).forEach(function (cable) {
            printLevels(cable, index + 1);
        });
        return;
    }


    if(level['loopCable']) {
        loopCables.push(...level['loopCable'])

        console.log(`${index}_LEVEL_INDEX`, level)
        console.log(`${level['id']}_LEVEL_ID`, level)

        cableL4Count[level['id']] = level['l4Count']

    }
    // console.log(
    //     '    '.repeat(index),
    //     level['type'],
    //     'CABLE',
    //     level['id'],
    //     '    loopCable:' + (level['loopCable'] || false),
    //     (!!level['loopCable'] ? '          [[ * ]]' : ''),
    //     '    L4 Count: ' + level['l4Count'],
    //     '    L4 Score: ' + level['l4Score'],
    // );
    getClosures(level).forEach(function (closure) {
        printLevels(closure, index + 1);
    });
}


execute();


import { getOutClosureByCableId } from './CableQueries';


/**
 *
 * @param closureId
 * @param connection
 */
export const getInAndOutConnectionsByClosureId = async (closureId, connection) => {

    // first get the in closure splices
    let inClosureSplices = await connection.query(`
        SELECT DISTINCT(conn.a_fibre_id), seal_int.cable_id, seal_int.direction, port.closure_id, port.seal_model_id, seal_model.odin_product_id
        FROM ftth.port as port
        LEFT JOIN ftth.seal_interface as seal_int on (seal_int.port_id = port.id)
        LEFT JOIN ftth.seal_model as seal_model on (port.seal_model_id = seal_model.id)
        LEFT JOIN ftth.non_geom_connection as conn on (conn.closure_id = port.closure_id)
        LEFT JOIN ftth.fibre as fibre on (fibre.cable_id = seal_int.cable_id)
        WHERE port.closure_id = ${closureId}
        AND conn.a_fibre_id = fibre.id
        AND seal_int.cable_id IS NOT NULL
        AND seal_int.direction = 'In';`,
    );

    if(!inClosureSplices[0]) {
        console.log('NO IN SPLICES FOR ID ', closureId);
        return {
            inClosureSplices: 0,
            outClosureSplices: 0,
            totalSplices: 0,
            totalInClosureSeals: 0,
            sealProducts: [],
        }
    }

    const inCableId = inClosureSplices[0].cable_id;

    // get the out closure id from the in cable
    const res = await getOutClosureByCableId(inCableId, connection);

    let outClosureSplices = [];

    if(res) {
        const outClosureId = res.closure_id;

        outClosureSplices = await connection.query(`
        SELECT DISTINCT(conn.b_fibre_id), seal_int.cable_id, seal_int.direction, port.closure_id, port.seal_model_id, seal_model.odin_product_id
        FROM ftth.non_geom_connection as conn
        LEFT JOIN ftth.port as port on (conn.closure_id = port.closure_id)
        LEFT JOIN ftth.seal_model as seal_model on (port.seal_model_id = seal_model.id)
        LEFT JOIN ftth.seal_interface as seal_int on (port.id = seal_int.port_id)
        LEFT JOIN ftth.fibre as fibre on (fibre.cable_id = seal_int.cable_id)
        WHERE port.closure_id = ${outClosureId}
        AND seal_int.cable_id IS NOT NULL
        AND conn.b_fibre_id = fibre.id
        AND seal_int.cable_id = ${inCableId};`,
        );
    }

    const totalSplices = inClosureSplices.length + outClosureSplices.length;
    const inClosureSealIds = inClosureSplices.map(elem => elem.seal_model_id);

    console.log('inClosureSealIds', inClosureSealIds);
    const uniqueInClosureSeals = [ ...new Set(inClosureSealIds) ];
    console.log('uniqueInClosureSeals', uniqueInClosureSeals);

    let sealProducts = {};
    for(const connection of inClosureSplices) {
        const match = sealProducts[connection['odin_product_id']];

        if(!match) {
            sealProducts[connection['odin_product_id']] = 1;
        } else {
            sealProducts[connection['odin_product_id']] += 1;
        }
    }

    let sealProductsToArray = [];
    for(const key of Object.keys(sealProducts)) {
        sealProductsToArray.push({
            id: key,
            quantity: sealProducts[key],
        });
    }

    console.log({
        totalSplices,
        totalInClosureSeals: uniqueInClosureSeals.length,
        sealProducts: sealProductsToArray,
    })

    return {
        inClosureSplices,
        outClosureSplices,
        totalSplices,
        totalInClosureSeals: uniqueInClosureSeals.length,
        sealProducts: sealProductsToArray,
    }
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getTotalTraysByClosureId = async (closureId, connection) => {

    const trays = await connection.query(`
        SELECT DISTINCT(tray.name), model.odin_product_id
        FROM ftth.tray as tray, ftth.splitter as splitter, ftth.tray_model as model
        WHERE splitter.closure_id = ${closureId}
        AND splitter.tray_id = tray.id
        AND model.id = tray.model_id
    `);

    let trayProducts = {};
    for(const tray of trays) {
        const match = trayProducts[tray['odin_product_id']];

        if(!match) {
            trayProducts[tray['odin_product_id']] = 1;
        } else {
            trayProducts[tray['odin_product_id']] += 1;
        }
    }

    let trayProductsToArray = [];
    for(const key of Object.keys(trayProducts)) {
        trayProductsToArray.push({
            id: key,
            quantity: trayProducts[key],
        });
    }

    return {
        totalTrays: trays.length,
        trayProducts: trayProductsToArray,
    }
}

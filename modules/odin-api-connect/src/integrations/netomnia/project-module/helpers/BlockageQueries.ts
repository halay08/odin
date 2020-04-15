/**
 *
 * @param closureId
 * @param connection
 */
export const getBlockageById = async (blockageId, connection) => {

    let blockageData = await connection.query(`
        SELECT blockage.id, model.id as model_id, model.name as model_name
        FROM ftth.blockage as blockage, ftth.blockage_model as model
        WHERE blockage.id = ${blockageId}
        AND model.id = model_id;
        `);

    return blockageData[0];
}


/**
 *
 * @param closureId
 * @param connection
 */
export const getBlockageByCableId = async (cableId, connection) => {

    let blockageData = await connection.query(`
        SELECT cable.id as cable_id, blockage.id as blockage_id, model.id as model_id, model.name as model_name
        FROM ftth.blockage as blockage, ftth.cable as cable, ftth.blockage_model as model
        WHERE ST_Intersects(blockage.geometry, cable.geometry)
        AND cable.id = ${cableId}
        AND model.id = blockage.model_id;
    `)

    return blockageData;
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getBlockageByRopeId = async (ropeId, connection) => {

    let blockageData = await connection.query(`
        SELECT rope.id as rope_id, blockage.id as blockage_id, model.id as model_id, model.name as model_name
        FROM ftth.blockage as blockage, ftth.rope as rope, ftth.blockage_model as model
        WHERE ST_Intersects(blockage.geometry, rope.geometry)
        AND rope.id = ${ropeId}
        AND model.id = blockage.model_id;
    `)

    return blockageData;
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getBlockageByDuctId = async (ductId, connection) => {

    let blockageData = await connection.query(`
        SELECT duct.id as duct_id, blockage.id as blockage_id, model.id as model_id, model.name as model_name
        FROM ftth.blockage as blockage, ftth.duct as duct, ftth.blockage_model as model
        WHERE ST_Intersects(blockage.geometry, duct.geometry)
        AND duct.id = ${ductId}
        AND model.id = blockage.model_id;
    `)

    return blockageData;
}


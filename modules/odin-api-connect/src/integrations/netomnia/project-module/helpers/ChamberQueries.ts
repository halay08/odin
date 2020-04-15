/**
 *
 * @param closureId
 * @param connection
 */
export const getChamberByClosureId = async (closureId, connection) => {

    // first try to get the chamber from the chamber table in cosmos
    let chamber = await connection.query(`
        SELECT ftth.chamber.id as id, ftth.chamber_model.name as name, ftth.chamber_model.odin_product_id, ftth.chamber.build_status_id
        FROM ftth.chamber, ftth.closure, ftth.chamber_model
        WHERE ST_Intersects(ftth.chamber.geometry, ftth.closure.geometry)
        AND ftth.closure.id = ${closureId}
        AND ftth.chamber_model.id = ftth.chamber.model_id
    `)

    if(chamber) {
        return chamber && chamber[0] ? chamber[0] : undefined;
    }

    // If nothing exists try to get the chamber from the openreach structure table in cosmos
    chamber = await connection.query(`
        SELECT openreach.structure.id as id
        FROM openreach.structure, ftth.closure
        WHERE ST_Intersects(openreach.structure.geom, ftth.closure.geometry)
        AND ftth.closure.id = ${closureId}
    `)

    // console.log('chamberId', chamberId);

    return chamber && chamber[0] ? chamber[0] : undefined;
}

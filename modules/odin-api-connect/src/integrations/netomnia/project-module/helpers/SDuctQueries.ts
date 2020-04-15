/**
 *
 * @param cableId
 * @param connection
 */
export const getSDuctByCableId = async (cableId, connection) => {

    const sduct = await connection.query(`
        SELECT ST_Length(
            CASE
                WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
                    THEN ftth.duct.geometry
                WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(ftth.duct.geometry)
            END
            ) as length,ftth.duct.id, ftth.duct_model.odin_product_id, ftth.duct.build_status_id
        FROM ftth.cable, ftth.duct
        LEFT JOIN ftth.duct_type ON (ftth.duct_type.id = ftth.duct.type_id)
        LEFT JOIN ftth.duct_model ON (ftth.duct_model.id = ftth.duct.model_id)
        WHERE ST_Equals(ftth.duct.geometry, ftth.cable.geometry)
        AND ftth.duct_model.id = ftth.duct.model_id
        AND ftth.duct_type.name = '2-Sduct'
        AND ftth.cable.id = ${cableId};
    `);

    return sduct[0];
}


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

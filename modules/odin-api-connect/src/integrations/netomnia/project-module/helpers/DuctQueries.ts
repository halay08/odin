/**
 *
 * @param cableId
 * @param connection
 */
export const getAllDuctsByPolygonId = async (polygonId, connection) => {

    const duct = await connection.query(`
        SELECT ST_Length(
        CASE
        WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
            THEN ftth.duct.geometry
        WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
            THEN ST_CurveToLine(ftth.duct.geometry)
            END
        ) as length, ftth.duct.dig, ftth.duct.id, ftth.duct_model.name,ftth.duct_type.name as duct_type, ftth.surface_type.name as surface_type, ftth.duct_model.odin_product_id, ftth.duct.build_status_id
        FROM ftth.polygon, ftth.duct
        LEFT JOIN ftth.duct_type ON (ftth.duct_type.id = ftth.duct.type_id)
        LEFT JOIN ftth.surface_type ON (ftth.surface_type.id = ftth.duct.surface_type_id)
        LEFT JOIN ftth.duct_model ON (ftth.duct_model.id = ftth.duct.model_id)
        WHERE ST_Intersects(ftth.duct.geometry, ftth.polygon.geometry)
        AND ftth.duct_type.name = '1-Duct'
        AND ftth.duct.dig = true
        AND ftth.polygon.id = ${polygonId};
        `);

    return duct;
}

/**
 *
 * @param cableId
 * @param connection
 */
export const getDuctById = async (ductId, connection) => {

    const duct = await connection.query(`
        SELECT ST_Length(
        CASE
        WHEN ST_GeometryType(ftth.duct.geometry) <> 'ST_MultiCurve'
            THEN ftth.duct.geometry
        WHEN ST_GeometryType(ftth.duct.geometry) = 'ST_MultiCurve'
            THEN ST_CurveToLine(ftth.duct.geometry)
            END
        ) as length, ftth.duct.dig, ftth.duct.id, ftth.duct_model.name as duct_model,ftth.duct_type.name as duct_type, ftth.surface_type.name as surface_type, ftth.duct_model.odin_product_id, ftth.duct.build_status_id
        FROM ftth.duct
        LEFT JOIN ftth.duct_type ON (ftth.duct_type.id = ftth.duct.type_id)
        LEFT JOIN ftth.surface_type ON (ftth.surface_type.id = ftth.duct.surface_type_id)
        LEFT JOIN ftth.duct_model ON (ftth.duct_model.id = ftth.duct.model_id)
        WHERE ftth.duct.id = ${ductId};
        `);

    return duct[0];
}




/**
 *
 * @param closureId
 * @param connection
 */
export const getAllL4ClosuresInL0Polygon = async (polygonId, connection) => {

    const l4ClosureIds = await connection.query(
        `SELECT closure.id
        FROM ftth.polygon, ftth.closure as closure
        LEFT JOIN ftth.closure_type as closure_type on (closure.type_id = closure_type.id)
        WHERE ST_Intersects(ftth.polygon.geometry, closure.geometry)
        AND ftth.polygon.id = ${polygonId}
        AND closure_type.name = 'L4'
        ORDER BY closure.id ASC`,
    );

    return l4ClosureIds;


}

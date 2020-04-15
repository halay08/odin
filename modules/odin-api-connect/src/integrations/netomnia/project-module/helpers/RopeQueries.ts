/**
 *
 * @param cableId
 * @param conn
 */
export const getRopeByCableId = async (cableId: string, conn) => {

    const rope = await conn.query(`
        SELECT ST_Length(
            CASE
                WHEN ST_GeometryType(ftth.rope.geometry) <> 'ST_MultiCurve'
                    THEN ftth.rope.geometry
                WHEN ST_GeometryType(ftth.rope.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(ftth.rope.geometry)
            END
            ) as length,ftth.rope.id, ftth.rope.build_status_id
        FROM ftth.rope, ftth.cable
        WHERE ST_Equals(CASE
            WHEN ST_GeometryType(ftth.rope.geometry) <> 'ST_MultiCurve'
                THEN ftth.rope.geometry
            WHEN ST_GeometryType(ftth.rope.geometry) = 'ST_MultiCurve'
                THEN ST_CurveToLine(ftth.rope.geometry)
        END, CASE
        WHEN ST_GeometryType(ftth.cable.geometry) <> 'ST_MultiCurve'
            THEN ftth.cable.geometry
        WHEN ST_GeometryType(ftth.cable.geometry) = 'ST_MultiCurve'
            THEN ST_CurveToLine(ftth.cable.geometry)
        END)
        AND ftth.cable.id = ${cableId}
    `);

    return rope[0];
}

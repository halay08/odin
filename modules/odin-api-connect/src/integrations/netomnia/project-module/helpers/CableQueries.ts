/**
 *
 * @param cable
 * @param connection
 */
export const getCableSourceByCableId = async (cable, connection) => {
    const source = await connection.query(`
        SELECT port.*
        FROM ftth.seal_interface as seal, ftth.port as port
        WHERE seal.cable_id = ${cable}
        AND seal.direction = 'In'
        AND seal.port_id = port.id
    `);

    return source[0];
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getInCableByClosureId = async (closureId, connection) => {

    const cable = await connection.query(`
        SELECT ST_Length(
            CASE
                WHEN ST_GeometryType(ftth.cable.geometry) <> 'ST_MultiCurve'
                    THEN ftth.cable.geometry
                WHEN ST_GeometryType(ftth.cable.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(ftth.cable.geometry)
            END
            ) as length, ftth.seal_interface.cable_id as id, ftth.cable_type.name as name, ftth.cable_model.odin_product_id, ftth.cable.build_status_id
        FROM ftth.port, ftth.seal_interface, ftth.cable_type, ftth.cable, ftth.cable_model
        WHERE ftth.port.closure_id = ${closureId}
        AND ftth.seal_interface.port_id = ftth.port.id
        AND ftth.seal_interface.direction = 'In'
        AND ftth.cable.id = ftth.seal_interface.cable_id
        AND ftth.cable_type.id = ftth.cable.type_id
        AND ftth.cable.model_id = ftth.cable_model.id
    `);

    // Compute the cable length and round to the nearest 100th
    if(cable && cable[0]) {
        cable.forEach(
            element => {
                element.length_100 = (100 * Math.ceil(element.length / 100)) / 100;
            },
        );
    }
    return cable[0];
}

/**
 *
 * @param connection
 */
export const getCableLengthByPolygon = async (geometry, cableType, connection) => {

    try {
        const cables = await connection.query(`
        SELECT ST_Length(
            CASE
                WHEN ST_GeometryType(ftth.cable.geometry) <> 'ST_MultiCurve'
                    THEN ftth.cable.geometry
                WHEN ST_GeometryType(ftth.cable.geometry) = 'ST_MultiCurve'
                    THEN ST_CurveToLine(ftth.cable.geometry)
            END
            ) as length
        FROM  ftth.cable
        LEFT JOIN ftth.cable_type ON (ftth.cable_type.id = ftth.cable.type_id)
        WHERE ST_Intersects(ftth.cable.geometry, '${geometry}')
        AND ftth.cable_type.name = '${cableType}'
    `);

        // Compute the cable length and round to the nearest 100th
        let length = 0;
        if(cables[0]) {
            for(const cable of cables) {
                console.log('cable', cable);
                length += cable.length
            }
        }

        return length;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

/**
 *
 * @param connection
 */
export const getCableCountByPolygon = async (geometry, cableType, connection) => {

    const cable = await connection.query(`
        SELECT count(*)
        FROM  ftth.cable
        LEFT JOIN ftth.cable_type ON (ftth.cable_type.id = ftth.cable.type_id)
        WHERE ST_Intersects(ftth.cable.geometry, '${geometry}')
        AND ftth.cable_type.name = '${cableType}'
    `);

    // Compute the cable length and round to the nearest 100th
    if(cable && cable[0]) {
        return Number(cable[0].count)
    }
    return 0;
}

/**
 *
 * @param cable
 * @param connection
 */
export const getOutClosureByCableId = async (cableId, connection) => {
    const source = await connection.query(`
        SELECT ftth.port.closure_id as closure_id
        FROM ftth.seal_interface
        LEFT JOIN ftth.port ON (ftth.port.id = ftth.seal_interface.port_id)
        WHERE ftth.seal_interface.cable_id = ${cableId}
        AND ftth.seal_interface.direction = 'Out';
    `);

    return source[0];
}

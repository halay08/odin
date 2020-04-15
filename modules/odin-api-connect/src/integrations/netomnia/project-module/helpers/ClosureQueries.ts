/**
 *
 * @param closureId
 * @param connection
 */
export const getClosureById = async (closureId, connection) => {
    const closure = await connection.query(
        `SELECT closure.id, model.odin_product_id as product_id, closure.build_status_id as status_id
         FROM ftth.closure as closure, ftth.closure_model as model
         WHERE closure.id = ${closureId}
         AND model.id = closure.model_id`,
    )

    return closure[0]
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getSplittersByClosureId = async (closureId, connection) => {

    const splitters = await connection.query(`
        SELECT *
        FROM ftth.splitter as splitter
        WHERE splitter.closure_id = ${closureId}`,
    );

    return {
        totalSplitters: splitters.length,
    }
}

/**
 *
 * @param closureId
 * @param connection
 */
export const getClosureProduct = async (closureId, connection) => {
    let product = await connection.query(`
        SELECT ftth.closure_model.odin_product_id, ftth.closure.build_status_id
        FROM ftth.closure, ftth.closure_model
        WHERE ftth.closure.id = ${closureId}
        AND ftth.closure_model.id = ftth.closure.model_id
    `)
    return product;
}

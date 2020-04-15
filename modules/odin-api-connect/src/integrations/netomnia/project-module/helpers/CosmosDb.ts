/**
 *
 * @param data
 * @param conn
 */
export const saveAssocInCosmos = async (data, conn) => {

    console.log('data', data);
    const importData = await conn.query(`
        INSERT INTO ftth.odin_feature_import
        (id, feature_id, odin_task_id, feature_type, odin_milestone_id, created_at, odin_feature_id, polygon_id)
        VALUES (DEFAULT, ${data.feature_id}, '${data.odin_task_id}', '${data.feature_type}', '${data.odin_milestone_id}', '${new Date().toISOString()}', '${data.odin_feature_id}', '${data.polygon_id}')`);

    return importData;

}

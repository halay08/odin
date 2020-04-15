import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param cable
 * @param cableModel
 * @param componentSchema
 */
export function constructCableTubes(
    cableId: string,
    cableModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(cableModel) {

        const tubeCount = getProperty(cableModel, 'TubeCount')

        for(let i = 0; i < Number(tubeCount); i++) {

            const record = new DbRecordCreateUpdateDto()
            record.entity = 'ProjectModule:FeatureComponent'
            record.type = 'CABLE_TUBE'
            record.properties = {
                TubeNumber: i + 1,
                TubeColor: i + 1,
            }
            record.associations = [
                {
                    recordId: cableId,
                },
            ]

            creates.push(record)

        }

    }

    return creates

}

import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param closureId
 * @param closureModel
 * @param componentSchema
 */
export function constructClosureSlots(
    closureId: string,
    closureModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(closureModel) {

        const slotCount = getProperty(closureModel, 'SlotCount')
        const sideCount = getProperty(closureModel, 'SideCount')

        for(let i = 0; i < Number(slotCount); i++) {

            const record = new DbRecordCreateUpdateDto()
            record.entity = 'ProjectModule:FeatureComponent'
            record.type = 'CLOSURE_SLOT'
            record.properties = {
                SlotNumber: i + 1,
            }
            record.associations = [
                {
                    recordId: closureId,
                },
            ]

            creates.push(record)

        }

    }

    return creates

}

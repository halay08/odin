import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param slotId
 * @param trayModel
 * @param componentSchema
 */
export function constructSlotTrays(
    slotId: string,
    trayModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(trayModel) {

        const record = new DbRecordCreateUpdateDto()
        record.entity = 'ProjectModule:FeatureComponent'
        record.type = 'SLOT_TRAY'
        record.properties = {
            TrayNumber: 1,
        }
        record.associations = [
            {
                recordId: slotId,
                relationType: RelationTypeEnum.PARENT,
            },
        ]

        creates.push(record)


    }

    return creates

}

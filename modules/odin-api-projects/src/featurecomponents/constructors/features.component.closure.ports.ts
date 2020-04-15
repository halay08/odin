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
export function constructClosurePorts(
    closureId: string,
    closureModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(closureModel) {

        const portCount = getProperty(closureModel, 'PortCount')

        for(let i = 0; i < Number(portCount); i++) {

            const record = new DbRecordCreateUpdateDto()
            record.entity = 'ProjectModule:FeatureComponent'
            record.type = 'CLOSURE_PORT'
            record.properties = {
                PortNumber: i + 1,
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

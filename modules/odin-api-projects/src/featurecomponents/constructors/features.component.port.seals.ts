import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param portId
 * @param sealModel
 * @param componentSchema
 */
export function constructPortSeals(
    portId: string,
    sealModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(sealModel) {

        const interfaceCount = getProperty(sealModel, 'InterfaceCount')

        for(let i = 0; i < Number(interfaceCount); i++) {

            const record = new DbRecordCreateUpdateDto()
            record.entity = 'ProjectModule:FeatureComponent'
            record.type = 'PORT_SEAL'
            record.properties = {
                InterfaceNumber: i + 1,
            }
            record.associations = [
                {
                    recordId: portId,
                    relationType: RelationTypeEnum.PARENT,
                },
            ]

            creates.push(record)

        }

    }

    return creates

}

import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param tubeId
 * @param cableModel
 * @param componentSchema
 */
export function constructTubeFibres(
    tubeId: string,
    cableModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(cableModel) {

        const tubeCount = getProperty(cableModel, 'TubeCount')
        const fibreCount = getProperty(cableModel, 'FibreCount')

        if(Number(fibreCount) > 0) {

            // divide the fibre count by tubes
            let tubeFibreCount = Number(fibreCount) / Number(tubeCount);

            if(tubeFibreCount < 1) {
                tubeFibreCount = 1
            }

            for(let j = 0; j < Number(tubeFibreCount); j++) {
                const record = new DbRecordCreateUpdateDto()
                record.entity = 'ProjectModule:FeatureComponent'
                record.type = 'TUBE_FIBRE'
                record.properties = {
                    FibreNumber: j + 1,
                    FibreColor: j + 1,
                }
                record.associations = [
                    {
                        recordId: tubeId,
                        relationType: RelationTypeEnum.PARENT,
                    },
                ]

                creates.push(record)
            }
        }


    }

    return creates

}

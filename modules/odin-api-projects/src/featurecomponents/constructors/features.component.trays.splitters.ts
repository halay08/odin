import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 *
 * @param trayId
 * @param trayModel
 * @param componentSchema
 */
export function constructTraySplitters(
    trayId: string,
    trayModel: DbRecordEntityTransform,
    componentSchema: SchemaEntity,
): DbRecordCreateUpdateDto[] {

    let creates = []

    if(trayModel) {

        const splitterType = getProperty(trayModel, 'SplitterType')
        const splitterQuantity = getProperty(trayModel, 'SplitterQuantity')

        console.log('splitterType', splitterType)
        console.log('splitterQuantity', splitterQuantity)

        if(splitterType && splitterQuantity) {

            for(let a = 0; a < Number(splitterQuantity); a++) {

                const splitType = splitterType.split('_')

                console.log('splitType', splitType);
                console.log('splitType', splitType[1]);

                for(let b = 0; b < Number(splitType[1]); b++) {

                    const record = new DbRecordCreateUpdateDto()
                    record.entity = 'ProjectModule:FeatureComponent'
                    record.type = 'TRAY_SPLITTER'
                    record.properties = {
                        SplitterType: splitterType,
                        SplitterNumber: a + 1,
                    }
                    record.associations = [
                        {
                            recordId: trayId,
                            relationType: RelationTypeEnum.PARENT,
                        },
                    ]

                    creates.push(record)
                }

            }

        }

    }

    return creates

}

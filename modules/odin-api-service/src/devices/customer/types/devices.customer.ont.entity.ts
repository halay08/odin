import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


const portNumbers = () => {
    const array = [];

    for(let i = 1; i < 17; i++) {
        array.push({ label: `${i}`, value: `${i}`, position: i });
    }
    return array;
}


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Model',
        label: 'model',
        description: 'model of the customer device',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: '621X', value: '621X', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'PONPort',
        label: 'pon port',
        description: 'pon location for the customer device',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: portNumbers(),
        validators: [ SchemaColumnValidatorTypes.NUMBER.name ],
    },
    {
        name: 'SerialNumber',
        label: 'serial number',
        description: 'serial number for the customer device, scanned during install',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
];

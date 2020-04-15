import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Model',
        label: 'model',
        description: 'model of the network device',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: '6310', value: '6310', position: 0 },
            { label: '6320', value: '6320', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
];

import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Description',
        label: 'description',
        description: 'price book description',
        type: SchemaColumnTypes.TEXT_LONG,
        position: 2,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [
            SchemaColumnValidatorEnums.TEXT_LONG,
        ],
    },
    {
        name: 'IsStandard',
        label: 'is standard',
        description: 'is this the standard price book',
        type: SchemaColumnTypes.BOOLEAN,
        position: 5,
        isStatic: true,
        isHidden: false,
        isVisibleInTables: true,
        defaultValue: false,
        validators: [],
    },
    {
        name: 'IsActive',
        label: 'is active',
        description: 'is the price book active',
        type: SchemaColumnTypes.BOOLEAN,
        position: 6,
        isStatic: true,
        isHidden: false,
        defaultValue: false,
        isVisibleInTables: true,
        validators: [],
    },
];


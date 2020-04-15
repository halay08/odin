import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'type of vendor',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: 'Contractor', value: 'CONTRACTOR', position: 0 },
            { label: 'Supplier', value: 'SUPPLIER', position: 1 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'Archived',
        description: 'is the vendor archived',
        type: SchemaColumnTypes.BOOLEAN,
        position: 5,
        isStatic: true,
        isHidden: false,
        isVisibleInTables: true,
        validators: [],
    },
];


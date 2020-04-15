import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'The type of milestone',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: 'Default', value: 'DEFAULT', position: 0 },
            { label: 'L0', value: 'L0', position: 1 },
            { label: 'L1', value: 'L1', position: 2 },
            { label: 'L2', value: 'L2', position: 3 },
            { label: 'L3', value: 'L3', position: 4 },
            { label: 'L4', value: 'L4', position: 5 },
        ],
        validators: [],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'The description of the milestone',
        type: SchemaColumnTypes.TEXT_LONG,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [],
        validators: [],
    },
];

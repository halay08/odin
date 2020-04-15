import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'The type of task',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [],
        validators: [],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'The description of the subtask',
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

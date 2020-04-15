import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'ExternalRef',
        label: 'external ref',
        description: 'The external id of the feature',
        type: SchemaColumnTypes.NUMBER,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [],
        validators: [],
    },
];

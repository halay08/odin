import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Description',
        label: 'description',
        description: 'description of the return order',
        type: SchemaColumnTypes.TEXT,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
];

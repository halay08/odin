import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [

    {
        name: 'Body',
        label: 'body',
        description: 'the body of the note',
        type: SchemaColumnTypes.TEXT_LONG,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },

];


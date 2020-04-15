import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'EmailAddress',
        label: 'email address',
        description: 'Contacts Email Address',
        type: SchemaColumnTypes.EMAIL,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
            SchemaColumnValidatorTypes.EMAIL.name,
        ],

    }, {
        name: 'Phone',
        label: 'phone',
        description: 'Phone number',
        type: SchemaColumnTypes.PHONE_NUMBER,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [
            SchemaColumnValidatorTypes.PHONE.name,
        ],

    },
    {
        name: 'Website',
        label: 'website',
        description: 'Website',
        type: SchemaColumnTypes.TEXT,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [],

    },

];


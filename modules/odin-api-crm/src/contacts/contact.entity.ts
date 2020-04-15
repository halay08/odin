import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [

    {
        name: 'FirstName',
        label: 'first name',
        description: 'the contacts first name',
        type: SchemaColumnTypes.TEXT,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    }, {
        name: 'LastName',
        label: 'last name',
        description: 'the contacts last name',
        type: SchemaColumnTypes.TEXT,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    }, {
        name: 'EmailAddress',
        label: 'email address',
        description: 'the contacts email address',
        type: SchemaColumnTypes.EMAIL,
        position: 2,
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
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.PHONE.name ],
    },
    {
        name: 'Mobile',
        label: 'mobile',
        description: 'the contact mobile phone number',
        type: SchemaColumnTypes.PHONE_NUMBER,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.PHONE.name ],
    },

];


import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'name',
        label: 'type',
        description: 'Type of accounts',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [
            { label: 'Business', value: 'BUSINESS', position: 0 },
            { label: 'Residential', value: 'RESIDENTIAL', position: 1 },
            { label: 'Landlord', value: 'LANDLORD', position: 2 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'GroupBilling',
        label: 'group billing',
        description: 'this will group all billable orders where applicable into a single invoice',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        defaultValue: 'YES',
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
];


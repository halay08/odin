import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'DisplayName',
        label: 'display name ',
        description: 'Simplified facing display name for the offer',
        type: SchemaColumnTypes.TEXT,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
        ],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'description of the offer',
        type: SchemaColumnTypes.TEXT,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'CustomerType',
        label: 'customer type',
        description: 'customer type the product is available to',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Business', value: 'BUSINESS', position: 0 },
            { label: 'Residential', value: 'RESIDENTIAL', position: 1 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'Channel',
        label: 'channel',
        description: 'channel for the offer',
        type: SchemaColumnTypes.ENUM,
        position: 3,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'DIRECT',
        options: [
            { label: 'Direct', value: 'DIRECT', position: 0 },
            { label: 'Facebook', value: 'FACEBOOK', position: 1 },
            { label: 'Google', value: 'GOOGLE', position: 2 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
        ],
    },
    {
        name: 'Code',
        label: 'code',
        description: 'code to retrieve offer',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'AvailableFrom',
        description: 'offer is available from this date',
        type: SchemaColumnTypes.DATE_TIME,
        position: 5,
        isStatic: true,
        isHidden: false,
        validators: [ SchemaColumnValidatorTypes.DATE_TIME.name ],
    },
    {
        name: 'AvailableTo',
        description: 'offer is available to this date',
        type: SchemaColumnTypes.DATE_TIME,
        position: 6,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.DATE_TIME.name ],
    },
];


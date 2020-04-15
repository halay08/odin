import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'CustomerType',
        label: 'customer type',
        description: 'customer type using the service',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: 'Residential', value: 'RESIDENTIAL', position: 0 },
            { label: 'Business', value: 'BUSINESS', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'Type',
        label: 'type',
        description: 'type of service',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: 'Broadband', value: 'BROADBAND', position: 0 },
            { label: 'Voice', value: 'VOICE', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'UploadSpeed',
        label: 'upload speed',
        description: 'upload speed (broadband)',
        type: SchemaColumnTypes.NUMBER,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.NUMBER.name ],
    },
    {
        name: 'DownloadSpeed',
        label: 'download speed',
        description: 'download speed (broadband)',
        type: SchemaColumnTypes.NUMBER,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.NUMBER.name ],
    },
];

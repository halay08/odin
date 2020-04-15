import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Model',
        label: 'model',
        description: 'model of the customer device',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        options: [
            { label: 'Eero', value: 'EERO', position: 0 },
            { label: 'Linksys', value: 'LINKSYS', position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'SerialNumber',
        label: 'serial number',
        description: 'serial number for the customer device, scanned during install',
        type: SchemaColumnTypes.TEXT,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'WifiPassword',
        label: 'wifi password',
        description: 'wifi password',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'wifiSSID',
        label: 'wifi ssid',
        description: 'wifi ssid',
        type: SchemaColumnTypes.TEXT,
        position: 5,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: true,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
];

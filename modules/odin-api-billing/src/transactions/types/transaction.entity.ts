import { SchemaColumnValidatorTypes } from "@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";
import { SchemaColumnTypes } from "@d19n/models/dist/schema-manager/schema/column/types/schema.column.types";

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'type of transaction',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Payment', value: "PAYMENT", position: 0 },
            { label: 'Refund', value: "REFUND", position: 1 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'CurrencyCode',
        description: 'Currency code',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'GBP',
        options: [
            { label: 'GBP', value: 'GBP', position: 0 },
        ],
        validators: [ SchemaColumnValidatorTypes.REQUIRED.name ],
    },
    {
        name: 'Amount',
        description: 'amount of the transaction',
        type: SchemaColumnTypes.CURRENCY,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'GBP',
        options: [
            { label: 'GBP', value: 'GBP', position: 0 },
        ],
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.NUMBER_CURRENCY.name,
        ],
    },
    {
        name: 'ExternalRef',
        description: 'payment id from the provider',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'GBP',
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.TEXT.name,
        ],
    },
    {
        name: 'Status',
        label: 'status',
        description: 'status of the transaction',
        type: SchemaColumnTypes.TEXT,
        position: 5,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },
    {
        name: 'ErrorMessage',
        label: 'error message',
        description: 'error if there is one',
        type: SchemaColumnTypes.TEXT,
        position: 6,
        isStatic: true,
        isHidden: true,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorTypes.TEXT.name ],
    },

];

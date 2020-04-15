import { OrganizationAppTypes } from "@d19n/models/dist/identity/organization/app/organization.app.types";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";
import { SchemaColumnTypes } from "@d19n/models/dist/schema-manager/schema/column/types/schema.column.types";

export const columns: SchemaColumnCreateUpdateDto[] = [

    {
        name: 'Provider',
        label: 'provider',
        description: 'payment provider',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: true,
        isHidden: false,
        options: [
            {
                label: 'Gocardless',
                value: OrganizationAppTypes.GOCARDLESS,
                position: 0,
            },
        ],
        validators: [ 'REQUIRED' ],
    },
    {
        name: 'Type',
        label: 'type',
        description: 'payment method type',
        type: SchemaColumnTypes.ENUM,
        position: 1,
        isStatic: true,
        isHidden: false,
        options: [
            { label: 'MANDATE', value: 'MANDATE', position: 0 },
        ],
        validators: [ 'REQUIRED' ],
    },
    {
        name: 'Status',
        label: 'status',
        description: 'payment method status',
        type: SchemaColumnTypes.TEXT,
        position: 2,
        isStatic: true,
        isHidden: false,
        validators: [ 'REQUIRED', 'TEXT' ],
    },
    {
        name: 'Default',
        label: 'default method',
        description: 'is this the default payment method',
        type: SchemaColumnTypes.ENUM,
        position: 3,
        isStatic: true,
        isHidden: false,
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ 'REQUIRED' ],
    },
    {
        name: 'BankAccountId',
        label: "bank account id",
        description: 'reference to the external payment method Id to be used',
        type: SchemaColumnTypes.ALPHA_NUMERICAL,
        position: 4,
        isStatic: true,
        isHidden: false,
        validators: [ 'ALPHA_NUMERICAL' ],
    },
    {
        name: 'ExternalRef',
        label: 'external reference id',
        description: 'reference to the external payment method Id to be used',
        type: SchemaColumnTypes.ALPHA_NUMERICAL,
        position: 4,
        isStatic: true,
        isHidden: false,
        validators: [ 'REQUIRED', 'ALPHA_NUMERICAL', 'UNIQUE' ],
    },

];


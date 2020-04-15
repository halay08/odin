import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Type',
        label: 'type',
        description: 'type of product',
        type: SchemaColumnTypes.ENUM,
        position: 0,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Base product', value: 'BASE_PRODUCT', position: 0 }, // Will be deprecated 2020
            { label: 'Add-on product', value: 'ADD_ON_PRODUCT', position: 1 }, // Will be deprecated 2020
            { label: 'Non inventory', value: 'NON_INVENTORY', position: 3 },
            { label: 'Assembly', value: 'ASSEMBLY', position: 4 },
        ],
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
        ],
    },
    {
        name: 'Category',
        label: 'category',
        description: 'category of the product',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Default', value: 'DEFAULT', position: 0 },
            { label: 'Voice', value: 'VOICE', position: 1 },
            { label: 'Broadband', value: 'BROADBAND', position: 2 },
            { label: 'Material', value: 'MATERIAL', position: 3 },
            { label: 'Labor', value: 'LABOR', position: 4 },
        ],
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
        ],
    },
    {
        name: 'ChargeType',
        label: 'Charge type',
        description: 'charge type',
        type: SchemaColumnTypes.ENUM,
        position: 2,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'One-Time', value: 'ONE_TIME', position: 0 },
            { label: 'Recurring', value: 'RECURRING', position: 1 },
            { label: 'Usage', value: 'USAGE', position: 2 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'ContractType',
        label: 'contract type',
        description: 'the type of contract required',
        type: SchemaColumnTypes.ENUM,
        position: 3,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        isVisibleInTables: false,
        options: [
            { label: 'None', value: 'NONE', position: 0 },
            { label: 'Monthly', value: 'MONTHLY', position: 1 },
            { label: 'Annual 12', value: 'ANNUAL_12', position: 2 },
            { label: 'Annual 18', value: 'ANNUAL_18', position: 2 },
            { label: 'Annual 24', value: 'ANNUAL_24', position: 2 },
            { label: 'Annual 36', value: 'ANNUAL_36', position: 2 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'Description',
        label: 'description',
        description: 'description of the product',
        type: SchemaColumnTypes.TEXT,
        position: 4,
        isStatic: true,
        isHidden: false,
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
    {
        name: 'DisplayName',
        label: 'display name',
        description: 'The display name for the product, customer facing',
        type: SchemaColumnTypes.TEXT,
        position: 5,
        isStatic: true,
        isHidden: false,
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
    {
        name: 'LegalTerms',
        label: 'legal terms',
        description: 'The legal terms of the product',
        type: SchemaColumnTypes.TEXT_LONG,
        position: 6,
        isStatic: true,
        isHidden: false,
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
    {
        name: 'UnitType',
        label: 'unit type',
        description: 'unit of measure the product',
        type: SchemaColumnTypes.ENUM,
        position: 6,
        isStatic: false,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Per Unit', value: 'UNIT', position: 0 },
            { label: 'Per Linear Meter', value: 'LINEAR_METER', position: 4 },
            { label: 'Per 100 Meter', value: '100_METER', position: 5 },
        ],
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
        ],
    },
    {
        name: 'UnitPrice',
        label: 'unit price',
        description: 'suggested price to sell a single product',
        type: SchemaColumnTypes.CURRENCY,
        position: 7,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorEnums.NUMBER_CURRENCY,
        ],
    },
    {
        name: 'UnitCost',
        label: 'unit cost',
        description: 'unit cost for the product derived from product components UnitCost',
        type: SchemaColumnTypes.CURRENCY,
        position: 8,
        isStatic: true,
        isHidden: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorEnums.NUMBER_CURRENCY,
        ],
    },
    {
        name: 'MinimumSalePrice',
        label: 'minimum sale price',
        description: 'minimum sale price of the product components default is UnitCost',
        type: SchemaColumnTypes.NUMBER,
        position: 9,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorEnums.NUMBER_CURRENCY,
        ],
    },
    {
        name: 'IntervalUnit',
        label: 'interval unit',
        description: 'unit for the billing interval',
        type: SchemaColumnTypes.ENUM,
        position: 10,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'MONTHS',
        options: [
            { label: 'Month', value: 'MONTHS', position: 1 },
            { label: 'Days', value: 'DAYS', position: 2 },
        ],
        validators: [],
    },
    {
        name: 'IntervalLength',
        label: 'interval length',
        description: 'length of the billing interval, set to 0 for one-time charges',
        type: SchemaColumnTypes.NUMBER,
        position: 11,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 1,
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'TrialUnit',
        label: 'trial unit',
        description: 'trial unit for the product',
        type: SchemaColumnTypes.ENUM,
        position: 12,
        isStatic: true,
        isHidden: false,
        defaultValue: 'MONTHS',
        options: [
            { label: 'Month', value: 'MONTHS', position: 1 },
            { label: 'Days', value: 'DAYS', position: 2 },
        ],
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'TrialLength',
        label: 'trial length',
        description: 'length for the items trial length',
        type: SchemaColumnTypes.NUMBER,
        position: 13,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'DiscountValue',
        label: 'discount value',
        description: 'the value to discount',
        type: SchemaColumnTypes.CURRENCY,
        position: 14,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.NUMBER_CURRENCY ],
    },
    {
        name: 'DiscountType',
        label: 'discount type',
        description: 'the type of discount',
        type: SchemaColumnTypes.ENUM,
        position: 14,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'AMOUNT',
        options: [
            { label: 'Amount', value: 'AMOUNT', position: 0 },
            { label: 'Percent', value: 'PERCENT', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
    {
        name: 'DiscountUnit',
        label: 'discount unit',
        description: 'discount duration unit',
        type: SchemaColumnTypes.ENUM,
        position: 14,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'MONTHS',
        options: [
            { label: 'On-going', value: 'ON_GOING', position: 0 },
            { label: 'Month', value: 'MONTHS', position: 1 },
            { label: 'Days', value: 'DAYS', position: 2 },
        ],
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'DiscountLength',
        label: 'discount length',
        description: 'length for the product discount duration',
        type: SchemaColumnTypes.NUMBER,
        position: 15,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'AvailableFrom',
        label: 'available from',
        description: 'item is available from this date',
        type: SchemaColumnTypes.DATE,
        position: 16,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
            SchemaColumnValidatorEnums.DATE,
        ],
    },
    {
        name: 'AvailableTo',
        label: 'available to',
        description: 'item is available to this date',
        type: SchemaColumnTypes.DATE,
        position: 17,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        validators: [ SchemaColumnValidatorEnums.DATE ],
    },
    {
        name: 'TaxRate',
        label: 'Tax rate',
        description: 'tax rate for the product',
        type: SchemaColumnTypes.PERCENT,
        position: 18,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
            SchemaColumnValidatorEnums.NUMBER_PERCENT,
        ],
    },
    {
        name: 'Taxable',
        label: 'Taxable',
        description: 'is the product taxable',
        type: SchemaColumnTypes.ENUM,
        position: 19,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'YES',
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'TaxIncluded',
        label: 'tax included',
        description: 'is the tax included in the UnitPrice',
        type: SchemaColumnTypes.ENUM,
        position: 20,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'YES',
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'RequiresProvisioning',
        label: 'Requires provisioning',
        description: 'does the product require service provisioning',
        type: SchemaColumnTypes.ENUM,
        position: 21,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'RequiresOnSiteSetup',
        label: 'Requires on-site setup',
        description: 'does the product require on-site setup',
        type: SchemaColumnTypes.ENUM,
        position: 22,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'Retrievable',
        label: 'retrievable',
        description: 'retrievable product (leased, rented)',
        type: SchemaColumnTypes.ENUM,
        position: 22,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 'NO',
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [
            SchemaColumnValidatorEnums.REQUIRED,
        ],
    },
    {
        name: 'Shippable',
        label: 'Shippable',
        description: 'can the product be shipped to the end customer',
        type: SchemaColumnTypes.ENUM,
        position: 23,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        options: [
            { label: 'Yes', value: 'YES', position: 0 },
            { label: 'No', value: 'NO', position: 1 },
        ],
        validators: [ SchemaColumnValidatorEnums.REQUIRED ],
    },
    {
        name: 'MarkUpPercent',
        label: 'Markup percent',
        description: 'markup percent',
        type: SchemaColumnTypes.PERCENT,
        position: 25,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.NUMBER_PERCENT ],
    },
    {
        name: 'AccountingItemCode',
        label: 'Accounting code',
        description: 'account item code',
        type: SchemaColumnTypes.TEXT,
        position: 26,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
    {
        name: 'InStockQuantity',
        label: 'in stock quantity',
        description: 'quantity in stock',
        type: SchemaColumnTypes.TEXT,
        position: 27,
        isStatic: true,
        isHidden: true,
        isVisibleInTables: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.NUMBER ],
    },
    {
        name: 'ManufacturerSku',
        label: 'manufacturer sku',
        description: 'The Stock Keeping Unit number from the Manufacturer',
        type: SchemaColumnTypes.TEXT,
        position: 28,
        isStatic: true,
        isHidden: false,
        isTitleColumn: false,
        defaultValue: 0,
        validators: [ SchemaColumnValidatorEnums.TEXT ],
    },
];


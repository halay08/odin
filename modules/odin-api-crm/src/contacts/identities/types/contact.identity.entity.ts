import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';


export const columns: SchemaColumnCreateUpdateDto[] = [
    {
        name: 'Name',
        label: 'name',
        description: 'name of the identity twitter, zendesk, gocardless...',
        type: SchemaColumnTypes.TEXT,
        position: 0,
        isStatic: true,
        isHidden: false,
        isTitleColumn: true,
        isVisibleInTables: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.TEXT.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
        ],
    }, {
        name: 'ExternalId',
        label: 'external id',
        description: 'id of the record in the external system',
        type: SchemaColumnTypes.ALPHA_NUMERICAL,
        position: 1,
        isStatic: true,
        isHidden: false,
        isVisibleInTables: true,
        validators: [
            SchemaColumnValidatorTypes.REQUIRED.name,
            SchemaColumnValidatorTypes.ALPHA_NUMERICAL.name,
            SchemaColumnValidatorTypes.UNIQUE.name,
        ],
    },
];

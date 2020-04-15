import { ClassValidatorExceptionType } from '@d19n/common/dist/exceptions/types/ClassValidatorExceptionType';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorEntity } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';

export class ValidateDBRecordColumnValues {

  /**
   *
   * @param columnValidators
   * @param body
   * @param column
   * @param property
   * @param options
   */
  public static validate(
    columnValidators: SchemaColumnValidatorEntity[],
    body: DbRecordCreateUpdateDto,
    column,
    property,
    options: { isUpdating: boolean },
  ) {

    // Validate the values for the record
    let totalValidators = column.validators.length;
    let totalPassing = 0;
    let validationErrors: ClassValidatorExceptionType[] = [];

    if(column.validators.length > 0) {
      for(let v = 0; v < column.validators.length; v++) {

        const columnValidator = SchemaColumnValidatorTypes[column.validators[v].type];

        if(column.type === SchemaColumnTypes.ENUM) {
          // Check if the property is required and if there is no value passed in return a validation error
          if(columnValidator.name === SchemaColumnValidatorTypes.REQUIRED.name && !body.properties[property]) {

            const validationError = new ClassValidatorExceptionType();
            validationError.property = property;
            validationError.value = body.properties[property];
            validationError.constraints = {
              validatorMessage: `${property} is a required field`,
              validatorType: column.validators[v].type,
              columnType: column.type,
            };

            validationErrors.push(validationError);

          } else if(body.properties[property]) {
            // If the property is not required and a value is passed in validate it against the available options
            const options: string[] = column.options.map(elem => elem.value);

            if(options.includes(body.properties[property])) {
              totalPassing += 1;
            } else {
              const validationError = new ClassValidatorExceptionType();
              validationError.property = property;
              validationError.value = body.properties[property];
              validationError.constraints = {
                validatorMessage: `value: ${body.properties[property]} for property: ${property} is not valid`,
                validatorType: column.validators[v].type,
                columnType: column.type,
              };

              validationErrors.push(validationError);
            }
          } else {
            // There is no value passed in and it is not required, consider it passing
            totalPassing += 1;
          }
        } else {

          let isValid = true;

          const columnValidator = SchemaColumnValidatorTypes[column.validators[v].type];

          if(columnValidator.name === SchemaColumnValidatorTypes.REQUIRED.name) {
            // field is required
            const regexp = new RegExp(columnValidator.pattern, 'igm');
            if(!!body.properties[property]) {
              // There is value to validate
              isValid = regexp.test(body.properties[property]);

            } else if([
              null,
              'null',
              undefined,
              'undefined',
              '',
            ].includes(body.properties[property]) && !options.isUpdating) {
              // value is undefined and required on create
              isValid = false
            }
          } else if(!!body.properties[property]) {
            // field not required, has a value
            const regexp = new RegExp(columnValidator.pattern, 'igm');
            isValid = regexp.test(body.properties[property]);
          }

          if(isValid) {
            totalPassing += 1;
          } else {

            const validationError = new ClassValidatorExceptionType();
            validationError.property = property;
            validationError.value = body.properties[property];
            validationError.constraints = {
              validatorType: column.validators[v].type,
              columnType: column.type,
            };

            validationErrors.push(validationError);
          }
        }
      }
    }

    if(totalValidators !== totalPassing) {

      throw new ExceptionType(422, 'error validating value', validationErrors);

    }

    return true;
  }

}


export const IsJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

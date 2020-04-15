import { ClassValidatorExceptionType } from '@d19n/common/dist/exceptions/types/ClassValidatorExceptionType';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import moment from 'moment';

export class DateParser {

  /**
   * convert a date (string or Date() object) to UTC time zone unix milliseconds format
   * Example:
   * accepts: 2020-04-09, 1586145600000
   * returns: 1586145600000
   *
   * @param date
   * @param column
   */
  public static toYearMonthDay(date, column: SchemaColumnEntity): string {
    let dateVal = date;
    if(!!dateVal) {
      // validate the date
      // check if dateVal is in UnixTime
      const regexp = new RegExp('^[0-9]+$', 'igm');
      const isUnixTime = regexp.test(dateVal);
      if(isUnixTime) {
        dateVal = moment(dateVal, 'x').utc().format();
      }

      dateVal = moment(new Date(dateVal)).utc().format();

      if(dateVal === 'Invalid date') {
        const validationError = new ClassValidatorExceptionType();
        validationError.property = column.name;
        validationError.value = dateVal;
        validationError.constraints = {
          validatorType: 'MOMENT_DATE_VALIDATOR',
          columnType: column.type,
        };
        throw new ExceptionType(422, 'validation error', [ validationError ]);
      }

      // Verify the dateVal is in ISO_8601 format
      const isValidConverted = moment(dateVal, moment.ISO_8601).isValid();

      if(!isValidConverted) {
        const validationError = new ClassValidatorExceptionType();
        validationError.property = column.name;
        validationError.value = dateVal;
        validationError.constraints = {
          validatorType: 'MOMENT_DATE_VALIDATOR',
          columnType: column.type,
        };
        throw new ExceptionType(
          422,
          'validation error, dates must be ISO 8601 format YYYY-MM-DD',
          [ validationError ],
        );
      }

      if(!moment(dateVal).isValid()) {
        const validationError = new ClassValidatorExceptionType();
        validationError.property = column.name;
        validationError.value = dateVal;
        validationError.constraints = {
          validatorType: 'MOMENT_DATE_VALIDATOR',
          columnType: column.type,
        };
        throw new ExceptionType(422, 'validation error', [ validationError ]);
      } else {
        dateVal = moment(dateVal).utc().format('YYYY-MM-DD');
        return dateVal;
      }
    }
    return null;
  }

  /**
   * convert a date (string or Date() object) to UTC time zone unix milliseconds format
   * Example:
   * accepts: 2020-04-09, 1586145600000
   * returns: 1586145600000
   *
   * @param date
   * @param column
   */
  public static toUtcUnixMs(date, column: SchemaColumnEntity): string {
    try {
      let dateVal = date;
      if(!!dateVal) {
        // validate the date
        // check if dateVal is in UnixTime
        const regexp = new RegExp('^[0-9]+$', 'igm');
        const isUnixTime = regexp.test(dateVal);
        if(isUnixTime) {
          dateVal = moment(dateVal, 'x').utc().format();
        }

        dateVal = moment(new Date(dateVal)).utc().format();

        if(dateVal === 'Invalid date') {
          const validationError = new ClassValidatorExceptionType();
          validationError.property = column.name;
          validationError.value = dateVal;
          validationError.constraints = {
            validatorType: 'MOMENT_DATE_VALIDATOR',
            columnType: column.type,
          };
          throw new ExceptionType(422, 'validation error', [ validationError ]);
        }

        // Verify the dateVal is in ISO_8601 format
        const isValidConverted = moment(dateVal, moment.ISO_8601).isValid();

        if(!isValidConverted) {
          const validationError = new ClassValidatorExceptionType();
          validationError.property = column.name;
          validationError.value = dateVal;
          validationError.constraints = {
            validatorType: 'MOMENT_DATE_VALIDATOR',
            columnType: column.type,
          };
          throw new ExceptionType(
            422,
            'validation error, dates must be ISO 8601 format YYYY-MM-DD',
            [ validationError ],
          );
        }

        if(!moment(dateVal).isValid()) {
          const validationError = new ClassValidatorExceptionType();
          validationError.property = column.name;
          validationError.value = dateVal;
          validationError.constraints = {
            validatorType: 'MOMENT_DATE_VALIDATOR',
            columnType: column.type,
          };

          throw new ExceptionType(422, 'validation error', [ validationError ]);

        } else {
          dateVal = moment(dateVal).utc().toISOString();
          return dateVal;
        }
      }
      return null;
    } catch (e) {
      console.error(e);
      throw new ExceptionType(422, e.message);
    }
  }
}

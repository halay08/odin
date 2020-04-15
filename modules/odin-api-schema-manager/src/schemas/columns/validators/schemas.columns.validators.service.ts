import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { changeKeysSnakeCaseToCamelCase } from '@d19n/common/dist/helpers/TransformData';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaColumnOptionRaw } from '@d19n/models/dist/schema-manager/schema/column/option/interfaces/schema.column.option.raw.interface';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnValidatorCreateUpdate } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.create.update';
import { SchemaColumnValidatorEntity } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { constantCase } from 'change-case';
import { validate } from 'class-validator';
import moment from 'moment';
import { DeleteResult } from 'typeorm';
import { SchemasService } from '../../schemas.service';
import { SchemasColumnsValidatorsRepository } from './schemas.columns.validators.repository';


@Injectable()
export class SchemasColumnsValidatorsService {

  private readonly schemasValidatorsRepository: SchemasColumnsValidatorsRepository;
  private readonly schemasService: SchemasService;

  public constructor(
    @InjectRepository(SchemasColumnsValidatorsRepository) schemasValidatorsRepository: SchemasColumnsValidatorsRepository,
    @Inject(forwardRef(() => SchemasService)) schemasService: SchemasService,
  ) {
    this.schemasValidatorsRepository = schemasValidatorsRepository;
    this.schemasService = schemasService;
  }


  /**
   * batch create a batch of schema columns.
   *
   * @param principal
   * @param column
   * @param schemaValidatorBatchCreate
   *
   */
  public async batchUpdateOrCreateByOrganizationEntity(
    principal: OrganizationUserEntity,
    column: SchemaColumnEntity,
    body: string[],
  ): Promise<{ updateResults: SchemaColumnOptionRaw[], createResults: SchemaColumnOptionRaw[], deleteResults: SchemaColumnOptionRaw[] }> {

    try {

      let createResults = [];
      let updateResults = [];
      let deleteResults = [];

      const parsedValidators: SchemaColumnValidatorCreateUpdate[] = body.map(elem => ({ type: constantCase(elem) }));

      if(column && principal.organization) {
        // delete all validators and create only the validators being passed in
        // they are managed as a complete array / no partial updates
        const validators: string[] = body.map(elem => elem);

        const res: DeleteResult = await this.schemasValidatorsRepository
          .createQueryBuilder()
          .delete()
          .where({
            organization: principal.organization,
            column,
          }).andWhere(`type NOT IN ${validators.length > 0 ? '(:...validators)' : '(:validators)'}`, { validators })
          .returning('id, type')
          .execute();

        deleteResults.push(...res.raw);
      }

      // Create the new
      if(column && parsedValidators.length > 0) {
        for(let x in parsedValidators) {

          const validator = new SchemaColumnValidatorEntity();
          validator.organization = principal.organization;
          validator.column = column;
          validator.type = parsedValidators[x].type;

          const errors = await validate(validator, {
            skipMissingProperties: true,
          });

          if(errors.length > 0) {
            throw new ExceptionType(422, 'validation error', errors);
          }

          const existing = await this.schemasValidatorsRepository.query(`
          SELECT * 
          FROM schemas_columns_validators
          WHERE organization_id = '${principal.organization.id}'
          AND column_id = '${column.id}'
          AND type = '${constantCase(parsedValidators[x].type)}'
          `);

          const existingValidator = existing[0];

          console.log('existingValidator', existingValidator);

          if(existingValidator) {

            const update = {

              id: existingValidator.id,
              type: constantCase(parsedValidators[x].type),
             
            };

            const res = await this.schemasValidatorsRepository.query(`
                UPDATE schemas_columns_validators as t
                SET 
                  type = c.type, 
                  updated_at = c.updated_at::timestamp
                FROM (VALUES ('${update.id}', '${update.type}', '${moment().utc().toISOString()}')) 
                AS c(id, type, updated_at)
                WHERE c.id::uuid = t.id::uuid
                RETURNING t.id, t.column_id, t.type;
              `);

            updateResults.push(...res[0]);

          } else {

            const validator = new SchemaColumnValidatorEntity();
            validator.organization = principal.organization;
            validator.column = column;
            validator.type = constantCase(parsedValidators[x].type);

            const errors = await validate(validator, {
              skipMissingProperties: true,
            });

            if(errors.length > 0) {
              throw new ExceptionType(422, 'validation error', errors);
            }

            const res = await this.schemasValidatorsRepository.query(`
                INSERT INTO schemas_columns_validators (organization_id, column_id, type, updated_at, created_at)
                VALUES('${validator.organization.id}', '${validator.column.id}', '${validator.type}', '${moment().utc().toISOString()}', '${moment().utc().toISOString()}')
                RETURNING id, column_id, type;
              `)

            createResults.push(...res);

          }
        }
      }

      return {

        updateResults: updateResults.map(elem => changeKeysSnakeCaseToCamelCase<SchemaColumnOptionRaw>(elem)),
        createResults: createResults.map(elem => changeKeysSnakeCaseToCamelCase<SchemaColumnOptionRaw>(elem)),
        deleteResults: deleteResults.map(elem => changeKeysSnakeCaseToCamelCase<SchemaColumnOptionRaw>(elem)),

      };

    } catch (e) {

      throw new ExceptionType(500, e.message);

    }
  }
}

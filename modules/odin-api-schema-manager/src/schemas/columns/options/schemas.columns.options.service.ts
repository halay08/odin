import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { changeKeysSnakeCaseToCamelCase } from '@d19n/common/dist/helpers/TransformData';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaColumnOptionRaw } from '@d19n/models/dist/schema-manager/schema/column/option/interfaces/schema.column.option.raw.interface';
import { SchemaColumnOptionCreateUpdate } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.create.update';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { constantCase } from 'change-case';
import { validate } from 'class-validator';
import moment from 'moment';
import { DeleteResult } from 'typeorm';
import { SchemasColumnsOptionsRepository } from './schemas.columns.options.repository';


@Injectable()
export class SchemasColumnsOptionsService {


  public constructor(@InjectRepository(SchemasColumnsOptionsRepository) private schemasColumnsOptionsRepository: SchemasColumnsOptionsRepository) {

    this.schemasColumnsOptionsRepository = schemasColumnsOptionsRepository;

  }

  /**
   *
   * @param principal
   * @param column
   * @param body
   */
  public async batchUpdateOrCreateByOrganizationEntity(
    principal: OrganizationUserEntity,
    column: SchemaColumnEntity,
    body: SchemaColumnOptionCreateUpdate[],
  ): Promise<{ updateResults: SchemaColumnOptionRaw[], createResults: SchemaColumnOptionRaw[], deleteResults: SchemaColumnOptionRaw[] }> {

    try {

      let createResults = [];
      let updateResults = [];
      let deleteResults = [];

      if(column.type === SchemaColumnTypes.ENUM) {

        if(column && principal.organization) {
          // delete all options that are not in the current array of options
          const options = body.map(elem => constantCase(elem.value));

          const res: DeleteResult = await this.schemasColumnsOptionsRepository
            .createQueryBuilder()
            .delete()
            .where({
              organization: principal.organization,
              column,
            })
            .andWhere(`value NOT IN ${options.length > 0 ? '(:...options)' : '(:options)'}`, { options })
            .returning('id, column_id, label, value')
            .execute();

          deleteResults.push(...res.raw);

        }

        if(column && body.length > 0) {

          for(let x in body) {

            const existing = await this.schemasColumnsOptionsRepository.query(`
          SELECT * 
          FROM schemas_columns_options 
          WHERE organization_id = '${principal.organization.id}'
          AND column_id = '${column.id}'
          AND value = '${constantCase(body[x].value)}'
          `);

            const existingOption = existing[0];

            if(existingOption) {

              const update = {
                id: existingOption.id,
                label: body[x].label,
                value: constantCase(body[x].value),
                position: body[x].position,
              };

              const res = await this.schemasColumnsOptionsRepository.query(`
                UPDATE schemas_columns_options as t
                SET 
                  label= c.label,
                  value = c.value, 
                  updated_at = c.updated_at::timestamp
                FROM (VALUES ('${update.id}', '${update.label}', '${update.value}', ${update.position}, '${moment().utc().toISOString()}')) 
                AS c(id, label, value, position, updated_at)
                WHERE c.id::uuid = t.id::uuid
                RETURNING t.id, t.column_id, t.label, t.value;
              `);

              updateResults.push(...res[0]);

            } else {

              const option = new SchemaColumnOptionEntity();
              option.organization = principal.organization;
              option.column = column;
              option.label = body[x].label;
              option.value = constantCase(body[x].value);
              option.position = body[x].position;

              const errors = await validate(option, {
                skipMissingProperties: true,
              });

              if(errors.length > 0) {
                throw new ExceptionType(422, 'validation error', errors);
              }

              const res = await this.schemasColumnsOptionsRepository.query(`
                INSERT INTO schemas_columns_options (organization_id, column_id, label, value, position, updated_at, created_at)
                VALUES('${option.organization.id}', '${option.column.id}', '${option.label}', '${option.value}', ${option.position}, '${moment().utc().toISOString()}', '${moment().utc().toISOString()}')
                RETURNING id, column_id, label, value;
              `)

              createResults.push(...res);

            }
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

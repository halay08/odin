import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { EntityRepository, Repository } from 'typeorm';
import { SchemaColumnValidatorEntity } from "@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.entity";
import { SchemaColumnEntity } from "@d19n/models/dist/schema-manager/schema/column/schema.column.entity";

@EntityRepository(SchemaColumnValidatorEntity)
export class SchemasColumnsValidatorsRepository extends Repository<SchemaColumnValidatorEntity> {

  /**
   *
   * @param organization
   * @param columnId
   * @param validatorId
   */
  public getByOrganizationAndSchemaAndId(
    organization: OrganizationEntity,
    columnId: string,
    validatorId: string,
  ): Promise<SchemaColumnValidatorEntity> {
    return this.findOneOrFail({
      where: { organization, column_id: columnId, id: validatorId },
    });
  }

  /**
   * Retrieve a schema validator by it's matching name, schema and organization.
   *
   * @param organization
   * @param column
   * @param type
   */
  public getByOrganizationAndColumnAndName(
    organization: OrganizationEntity,
    column: SchemaColumnEntity,
    type: string,
  ): Promise<SchemaColumnValidatorEntity> {
    return this.findOne({
      where: { organization, column, type },
    });
  }

}

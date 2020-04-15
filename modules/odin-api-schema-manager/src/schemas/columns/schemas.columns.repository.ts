import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SchemaColumnEntity)
export class SchemasColumnsRepository extends Repository<SchemaColumnEntity> {

  /**
   *
   * @param organization
   * @param schemaId
   *
   * @param name
   */
  public getSchemaColumnByOrganizationAndSchemaIdAndName(
    organization: OrganizationEntity,
    schemaId: string,
    schemaTypeId: string,
    name: string,
  ): Promise<SchemaColumnEntity> {

    return this.findOne({
      where: { organizationId: organization.id, name: name, schemaId: schemaId, schemaTypeId: schemaTypeId || null },
      order: { 'position': 'ASC' },
    });
  }

  /**
   *
   * @param organization
   * @param columnId
   * @param schemaId
   *
   */
  public getSchemaColumnByOrganizationAndSchemaIdAndId(
    organization: OrganizationEntity,
    schemaId: string,
    columnId: string,
  ): Promise<SchemaColumnEntity> {
    return this.findOne({
      where: { organizationId: organization.id, id: columnId, schemaId: schemaId },
      relations: [ 'validators', 'options', 'schemaType' ],
      order: { 'position': 'ASC' },
    });
  }

  /**
   * @param  organization
   * @param schemaId
   *
   */
  public listSchemaColumnsByOrganizationAndSchemaId(
    organization: OrganizationEntity,
    schemaId: string,
  ): Promise<SchemaColumnEntity[]> {

    return this.find({
      where: { organizationId: organization.id, schemaId: schemaId },
      relations: [ 'validators', 'options', 'schemaType' ],
      order: { 'position': 'ASC' },
    });

  }
}

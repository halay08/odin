import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { DeleteResult, EntityRepository, Repository } from 'typeorm';


@EntityRepository(SchemaAssociationEntity)
export class SchemasAssociationsRepository extends Repository<SchemaAssociationEntity> {

  /**
   *
   * @param organization
   * @param id
   */
  public getByOrganizationAndId(
    organization: OrganizationEntity,
    id: string,
  ): Promise<SchemaAssociationEntity> {
    return this.findOne({
      where: { organizationId: organization.id, id }, join: {
        alias: 'association',
        leftJoinAndSelect: {
          // Source
          parentSchema: 'association.parentSchema',
          // Target
          childSchema: 'association.childSchema',
        },
      },
    });
  }

  /**
   *
   * @param  organization
   * @param id
   *
   */
  public deleteByPrincipalAndId(
    organization: OrganizationEntity,
    id: string,
  ): Promise<DeleteResult> {
    return this.delete({ organizationId: organization.id, id });
  }

  // New from Refactor: ODN-595
  /**
   *
   * @param organization
   * @param whereQuery
   * @param relations
   */
  public getSchemaAssociationByOrganizationAndQuery(
    organization: OrganizationEntity,
    whereQuery: { [key: string]: any },
    relations?: string[],
  ): Promise<SchemaAssociationEntity[]> {
    return this.find({
      where: { organizationId: organization.id, ...whereQuery },
      relations: relations ? relations : [],
    });
  }

  /**
   *
   * @param organization
   * @param associationId
   * @param relations
   */
  public getSchemaAssociationByOrganizationAndId(
    organization: OrganizationEntity,
    associationId: string,
    relations?: string[],
  ): Promise<SchemaAssociationEntity> {
    return this.findOne({
      where: { organizationId: organization.id, id: associationId },
      relations: relations ? relations : [],
    });
  }

  public async getByOrganizationParentAndChildSchema(
    organization: OrganizationEntity,
    parentSchema: SchemaEntity,
    childSchemaId: string,
    relations?: string[],
  ) {
    return this.findOne({
      where: { organizationId: organization.id, parentSchemaId: parentSchema.id, childSchemaId: childSchemaId },
      relations: relations ? relations : [],
    });
  }
}

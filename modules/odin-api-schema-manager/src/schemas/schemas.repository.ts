import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { EntityRepository, In, Repository, Brackets } from 'typeorm';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';


@EntityRepository(SchemaEntity)
export class SchemasRepository extends Repository<SchemaEntity> {

  /**
   *
   * @param principal
   * @param schemaId
   * @param incrementRecordNum
   */
  public async getByOrganizationAndIdAutoIncrement(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
    incrementRecordNum?: boolean,
  ): Promise<SchemaEntity> {
    try {

      // let schema = await this.findOne({ organization, id: schemaId });
      const res = await this.getSchemaByOrganizationAndId(principal, schemaId);

      console.log('res', res);

      if(!res) {

        throw new ExceptionType(404, 'schema not found');

      }

      const schema = new SchemaEntity();
      schema.id = res.id;

      if(res && incrementRecordNum && res.isSequential) {

        const nextVal = await this.getNextSequenceValue(schemaId);

        schema.recordNumberPrefix = res.recordNumberPrefix;
        schema.isSequential = res.isSequential;

        // temp to ensure we do not fail to generate a record number
        let recordNumber;

        if(nextVal) {

          schema.recordNumber = nextVal

        } else {

          schema.recordNumber = res.recordNumber;
          recordNumber = Number(res.recordNumber) + 1;

          await this.query(`UPDATE schemas SET record_number = ${recordNumber} WHERE id = '${schema.id}'`);

        }
      }

      return schema;
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   * Retrieve the next sequence value for a schema.
   *
   * @param {string} schemaId
   *
   */
  public async getNextSequenceValue(schemaId: string): Promise<number> {

    try {

      const [ { nextval } ] = await this.query(`SELECT nextval('${schemaId}_seq')`);

      return nextval;

    } catch (e) {
      console.error(e);
      // if an error is thrown getting the next val just return undefined so the schema manager handles
      // issuing the next number
      return undefined;
    }

  }

  /**
   * Retrieve all schemas that belong to an organization.
   *
   * @param {OrganizationEntity|OrganizationUserEntity} principal
   *
   */
  public getByOrganization(principal: OrganizationEntity | OrganizationUserEntity): Promise<SchemaEntity[]> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
    }

    let query = this.createQueryBuilder('schema').where({ organization })
    if(principal instanceof OrganizationUserEntity){
      const permissionsIds=this.getPermissionsIds(principal)
      query=query.leftJoin('schema.permissions', 'permissions');
      query=query.andWhere(new Brackets(subQb => {
        subQb.where('permissions.id IN (:...permissionsIds)', { permissionsIds })
          .orWhere('permissions IS NULL')
      }
      ));
    }

    return query.getMany();
  }

  /**
   * Retrieve all schemas by module.
   *
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param {string} moduleName
   *
   */
  public getByOrganizationAndModule(
    principal: OrganizationEntity | OrganizationUserEntity,
    moduleName: string,
  ): Promise<SchemaEntity[]> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
      const permissionsIds=this.getPermissionsIds(principal)
      return this.find({
        join: { alias: 'schema', leftJoin: { permissions: 'schema.permissions' } },
        where: qb => {
          qb.where({organization, moduleName}).andWhere(new Brackets(subQb => {
            subQb.where('permissions.id IN (:...permissionsIds)', { permissionsIds })
              .orWhere('permissions IS NULL')
          }
          ));
        }
      });
    }
    return this.find({
      where: { organization, moduleName },
    });
  }

  /**
   *
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param moduleName
   * @param entityName
   * @param relations
   */
  public getSchemaByOrganizationModuleAndEntity(
    principal: OrganizationEntity | OrganizationUserEntity,
    moduleName: string,
    entityName: string,
  ): Promise<SchemaEntity> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
      const permissionsIds=this.getPermissionsIds(principal)
      return this.findOne({
        join: { alias: 'schema', leftJoin: { permissions: 'schema.permissions' } },
        where: qb => {
          qb.where({organization, moduleName, entityName })
            .andWhere(new Brackets(subQb => {
              subQb.where('permissions.id IN (:...permissionsIds)', { permissionsIds }).orWhere('permissions IS NULL')
            }));
        }
      });
    }

    return this.findOne({
      where: { organization, moduleName, entityName },
    });
  }

  /**
   *
   * @param {OrganizationEntity | OrganizationUserEntity} principal
   * @param schemaId
   * @param relations
   */
  public getSchemaByOrganizationAndId(
    principal: OrganizationEntity | OrganizationUserEntity,
    schemaId: string,
  ): Promise<SchemaEntity> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
      const permissionsIds=this.getPermissionsIds(principal)
      return this.findOne({
        join: { alias: 'schema', leftJoin: { permissions: 'schema.permissions' } },
        where: qb => {
          qb.where({organization, id: schemaId }).andWhere(new Brackets(subQb => {
            subQb.where('permissions.id IN (:...permissionsIds)', { permissionsIds })
              .orWhere('permissions IS NULL')
          }
          ));
        }

      })
    }
    return this.findOne({
      where: { organization, id: schemaId },
    });
  }

  public getPermissionsIds(principal: OrganizationUserEntity): string[]{
    let permissionsIds: any[]=principal.roles.map(role =>{
      const rolePermissionsId=role.permissions.map(permission =>permission.id)
      return rolePermissionsId
    })
    permissionsIds=permissionsIds.flat()
    return permissionsIds
  }


}

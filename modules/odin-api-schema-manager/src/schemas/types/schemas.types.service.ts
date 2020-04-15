import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeCreateDto } from '@d19n/models/dist/schema-manager/schema/types/dto/schema.type.create.dto';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { constantCase } from 'change-case';
import { DeleteResult } from 'typeorm';
import { DbCacheService } from '../../cache/db.cache.service';
import { SchemasService } from '../schemas.service';
import { SchemasTypesRepository } from './schemas.types.repository';


@Injectable()
export class SchemasTypesService {


  public constructor(
    @InjectRepository(SchemasTypesRepository) private schemasTypesRepository: SchemasTypesRepository,
    @Inject(forwardRef(() => SchemasService)) private schemasService: SchemasService,
    private dbCacheService: DbCacheService,
  ) {

    this.schemasTypesRepository = schemasTypesRepository;
    this.dbCacheService = dbCacheService;
    this.schemasService = schemasService;

  }

  /**
   *
   * @param principal
   * @param schemaId
   * @param body
   */
  public async createByPrincipal(
    principal: OrganizationUserEntity,
    schemaId: string,
    body: SchemaTypeCreateDto,
  ): Promise<SchemaTypeEntity> {

    try {

      // Get the schema
      const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId,
        },
      );

      const schemaType = new SchemaTypeEntity();
      schemaType.organization = principal.organization;
      schemaType.schemaId = schemaId;
      schemaType.name = constantCase(body.name);
      schemaType.label = body.label;
      schemaType.description = body.description;
      schemaType.isDefault = body.isDefault;

      const res = await this.schemasTypesRepository.save(schemaType);

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      return res;

    } catch (e) {

      // TODO: Extract to general postgres error handler
      let code = e.statusCode;
      let message = e.message;

      if(e.code === '23505') {

        code = 409
        message = 'duplicate key value violates unique constraint'

      }
      console.log('code', code, message);

      throw new ExceptionType(code, message, e.validation);

    }
  }


  /**
   *
   * @param principal
   * @param id
   */
  public async deleteByPrincipalAndId(
    principal: OrganizationUserEntity,
    schemaId: string,
    schemaTypeId: string,
  ): Promise<DeleteResult> {

    try {

      // Get the schema
      const schema: SchemaEntity = await this.schemasService.getSchemaByOrganizationAndId(
        principal.organization,
        {
          schemaId,
        },
      );

      const res = await this.schemasTypesRepository.delete({ organization: principal.organization, schemaId, id: schemaTypeId });

      await this.dbCacheService.clearSchemasFromCache(principal.organization, schema.id);
      await this.dbCacheService.clearSchemasFromCache(
        principal.organization,
        `${schema.moduleName}:${schema.entityName}`,
      );

      return res;

    } catch (e) {

      // TODO: Extract to general postgres error handler
      let code = e.statusCode;
      let message = e.message;

      throw new ExceptionType(code, message, e.validation);

    }

  }
}

import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type';
import { RPC_GET_SCHEMA_BY_ID } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationsUsersRbacPermissionsRepository } from 'src/organizations/users/rbac/permissions/organizations.users.rbac.permissions.repository';
import { OrganizationsUsersRbacPermissionsService } from 'src/organizations/users/rbac/permissions/organizations.users.rbac.permissions.service';
import { RBACPermissionCreate } from 'src/organizations/users/rbac/permissions/types/RBACPermissionCreate';
import { RedisClient } from '../../../../common/RedisClient';
import { REDIS_CLIENT } from '../../../../utilities/Constants';

const { SCHEMA_MODULE } = SchemaModuleTypeEnums;

@Injectable()
export class OrganizationsSchemasRbacPermissionsService {

    private readonly amqpConnection: AmqpConnection;
    private readonly permissionsRepository: OrganizationsUsersRbacPermissionsRepository;
    private readonly permissionsService: OrganizationsUsersRbacPermissionsService;
    private redisService: RedisClient;

    constructor(
        amqpConnection: AmqpConnection,
        @InjectRepository(OrganizationsUsersRbacPermissionsRepository) permissionsRepository: OrganizationsUsersRbacPermissionsRepository,
        permissionsService: OrganizationsUsersRbacPermissionsService,
        @Inject(REDIS_CLIENT) private readonly redisClient: any,
    ) {
        this.amqpConnection = amqpConnection;
        this.permissionsRepository = permissionsRepository;
        this.permissionsService = permissionsService;
        this.redisService = new RedisClient(redisClient);
    }


    private async flushAllFromCache() {
        await this.redisService.flushCache();
    }

    public async getSchemaById(
        principal: OrganizationUserEntity,
        schemaId: any,
    ): Promise<SchemaEntity> {
        try {
            // Get schema by id over RPC
            const response = await this.amqpConnection.request<any>({
                exchange: SCHEMA_MODULE,
                routingKey: `${SCHEMA_MODULE}.${RPC_GET_SCHEMA_BY_ID}`,
                payload: {
                    principal,
                    schemaId,
                },
                timeout: 20000,
            });
            await this.flushAllFromCache();
            return response.data;

        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Batch create new permissions for DB_RECORD.
     *
     * @param principal
     * @param body
     */
    public async batchCreateByPrincipal(
        principal: OrganizationUserEntity,
        schemaId: string,
    ): Promise<OrganizationUserRbacPermissionEntity[]> {
        try {
            let batchCreates = [];
            const permissions = [
                'get',
                'update',
                'search',
                'delete',
                'create',
                'merge',
            ];
            // Get schema by id RPC call
            const schema: SchemaEntity = await this.getSchemaById(principal, schemaId);
            for(let i in permissions) {
                let data: RBACPermissionCreate = {
                    name:
                        schema.moduleName.toLocaleLowerCase() + '.' +
                        schema.entityName.toLocaleLowerCase() + '.' +
                        permissions[i],
                    description:
                        'OrganizationUserEntity can ' +
                        permissions[i] + ' ' +
                        schema.moduleName + ' ' +
                        schema.entityName + ' ',
                    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.DB_RECORD,
                }
                const res: OrganizationUserRbacPermissionEntity = await this.permissionsService.create(
                    principal,
                    data,
                );
                await this.assignPermissionToSchemaEntity(principal, schema, res);
                await this.flushAllFromCache();
                batchCreates.push(res);
            }
            return batchCreates;
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     * Create all permissions for a single schema. when enabling access control
     *
     * @param principal
     * @param schemaId
     *
     * @return {Promise<boolean>}
     */
    public async assignPermissionToSchemaEntity(
        principal: OrganizationUserEntity,
        schema: any,
        permission: any,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.permissionsRepository
                    .createQueryBuilder()
                    .relation(OrganizationUserRbacPermissionEntity, 'schema')
                    .of(permission)
                    .add(schema);

                await this.flushAllFromCache();
                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Delete permisisons based on the schemaId.
     *
     * @param {OrganizationEntity} organization
     * @param {string} id
     *
     */
    public batchDeleteByPrincipalAndId(
        principal: OrganizationUserEntity,
        schemaId: string,
    ): Promise<{ affected: number }> {
        return new Promise(async (resolve, reject) => {
            try {

                const schema = await this.getSchemaById(principal, schemaId);
                let count = 0;
                for(let permission of schema.permissions) {
                    count++;
                    const id = permission.id;
                    const deleteResult = await this.permissionsRepository.delete(
                        { id, organization: principal.organization },
                    );
                }
                await this.flushAllFromCache();
                return resolve({ affected: count });
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

}

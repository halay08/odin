import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type';
import { RPC_GET_SCHEMA_BY_ID } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
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
export class OrganizationsSchemasColumnsRbacPermissionsService {

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


    /**
     *
     * @param principal
     * @param schemaId
     * @param columnId
     */
    public async getSchemaColumnById(
        principal: OrganizationUserEntity,
        schemaId: any,
        columnId: any,
    ): Promise<SchemaColumnEntity> {
        try {
            // Get schema column by id RPC call
            const schemaColumn = await this.amqpConnection.request<any>({
                exchange: SCHEMA_MODULE,
                routingKey: `${SCHEMA_MODULE}.getColumnBySchemaIdAndColumnId`,
                payload: {
                    principal,
                    schemaId,
                    columnId,
                },
                timeout: 20000,
            });
            await this.flushAllFromCache();
            return schemaColumn.data;

        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Batch create new permissions for Schema Column.
     *
     * @param principal
     * @param body
     */
    public async batchCreateByPrincipal(
        principal: OrganizationUserEntity,
        schemaId: string,
        columnId: string,
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
            // Get schema column by id RPC call
            // Get schema column by id RPC call
            const schemaColumn = await this.getSchemaColumnById(principal, schemaId, columnId);
            const schema = await this.amqpConnection.request<any>({
                exchange: SCHEMA_MODULE,
                routingKey: `${SCHEMA_MODULE}.${RPC_GET_SCHEMA_BY_ID}`,
                payload: {
                    principal,
                    schemaId,
                },
                timeout: 10000,
            });
            for(let i in permissions) {
                let data: RBACPermissionCreate = {
                    name:
                        schema.data.moduleName.toLocaleLowerCase() + '.' +
                        schema.data.entityName.toLocaleLowerCase() + '.' +
                        schemaColumn.name.toLocaleLowerCase() + '.' +
                        permissions[i],
                    description:
                        'OrganizationUserEntity can ' +
                        permissions[i] + ' ' +
                        schema.data.moduleName + ' ' +
                        schema.data.entityName + ' ' +
                        schemaColumn.name,
                    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.DB_RECORD,
                }
                const res: OrganizationUserRbacPermissionEntity = await this.permissionsService.create(
                    principal,
                    data,
                );
                await this.assignPermissionToSchemaColumnEntity(principal, schemaColumn, res);
                await this.flushAllFromCache();
                batchCreates.push(res);
            }
            return batchCreates;
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     * Create all permissions for a single schema column when enabling access control
     *
     * @param principal
     * @param schemaId
     *
     * @return {Promise<boolean>}
     */
    public async assignPermissionToSchemaColumnEntity(
        principal: OrganizationUserEntity,
        schemaColumn: any,
        permission: any,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.permissionsRepository
                    .createQueryBuilder()
                    .relation(OrganizationUserRbacPermissionEntity, 'schemasColumn')
                    .of(permission)
                    .add(schemaColumn);
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
     * @param {string} schemaId
     * @param {string} columnId
     *
     */
    public batchDeleteByPrincipalAndId(
        principal: OrganizationUserEntity,
        schemaId: string,
        columnId: string,
    ): Promise<{ affected: number }> {
        return new Promise(async (resolve, reject) => {
            try {

                const schemaColumn = await this.getSchemaColumnById(principal, schemaId, columnId);
                let count = 0;
                for(let permission of schemaColumn.permissions) {
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

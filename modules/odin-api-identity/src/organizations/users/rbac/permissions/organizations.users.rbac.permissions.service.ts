import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClient } from 'src/common/RedisClient';
import { In } from 'typeorm';
import { REDIS_CLIENT } from '../../../../utilities/Constants';
import { OrganizationsUsersRbacPermissionsRepository } from './organizations.users.rbac.permissions.repository';
import { RBACPermissionCreate } from './types/RBACPermissionCreate';

@Injectable()
export class OrganizationsUsersRbacPermissionsService {

    private readonly permissionsRepository: OrganizationsUsersRbacPermissionsRepository;
    private redisService: RedisClient;

    public constructor(
        @InjectRepository(OrganizationsUsersRbacPermissionsRepository) permissionsRepository: OrganizationsUsersRbacPermissionsRepository,
        @Inject(REDIS_CLIENT) private readonly redisClient: any,
    ) {
        this.permissionsRepository = permissionsRepository;
    }

    private async flushAllFromCache() {
        await this.redisService.flushCache();
    }

    /**
     * Retrieve all permissions by organization.
     *
     *
     */
    public getByOrganizationEntity(organization: OrganizationEntity): Promise<Array<OrganizationUserRbacPermissionEntity>> {
        return this.permissionsRepository.find({
            where: { organization },
            order: { name: 'DESC' },
        });
    }

    /**
     * Retrieve an existing permission by organization and id.
     *
     * @param {OrganizationEntity} organization
     * @param {string} id
     *
     */
    public getByOrganizationAndId(
        organization: OrganizationEntity,
        id: string,
    ): Promise<OrganizationUserRbacPermissionEntity> {
        return new Promise(async (resolve, reject) => {
            const permission = await this.permissionsRepository.findOne({
                where: { id },
                relations: [ 'roles' ],
            });
            if(permission) {
                return resolve(permission);
            } else {
                return reject(new NotFoundException('could not locate permission'));
            }
        });
    }

    /**
     * Retrieve an existing permission by organization and permissionIds.
     *
     * @param {OrganizationEntity} organization
     * @param {string[]} permissionIds
     *
     */
    public getByOrganizationAndPermissionIds(
        organization: OrganizationEntity,
        permissionIds: string[],
        relations?: string[]
    ): Promise<OrganizationUserRbacPermissionEntity[]> {
        return new Promise(async (resolve, reject) => {
            const permissions = await this.permissionsRepository.find({
                where: { id: In(permissionIds) },
                relations: relations,
            });
            if(!!permissions) {
                return resolve(permissions);
            } else {
                return reject(new NotFoundException('could not locate permission'));
            }
        });
    }

    /**
     * Retrieve an existing permission by organization and name.
     *
     * @param {OrganizationEntity} organization
     * @param {string} name
     *
     */
    public getByOrganizationAndName(
        organization: OrganizationEntity,
        name: string,
    ): Promise<OrganizationUserRbacPermissionEntity> {
        return new Promise(async (resolve, reject) => {
            const permission = await this.permissionsRepository.findOne({
                where: {
                    organization,
                    name,
                },
            });
            if(permission) {
                return resolve(permission);
            } else {
                return reject(new NotFoundException('could not locate permission'));
            }
        });
    }

    /**
     * Retreive an existing permission by organization and name.
     *
     * @param {OrganizationEntity} organization
     * @param type
     * @param {string} name
     *
     */
    public getByOrganizationAndTypeAndName(
        organization: OrganizationEntity,
        type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE,
        name: string,
        options?: { noErrors: boolean },
    ): Promise<OrganizationUserRbacPermissionEntity> {
        return new Promise(async (resolve, reject) => {
            const permission = await this.permissionsRepository.findOne({
                where: {
                    organization,
                    name,
                    type,
                },
            });
            if(!permission && !options.noErrors) {
                return resolve(permission);
            }
            return resolve(permission);
        });
    }

    /**
     * Create a new permission.
     *
     * @param {OrganizationUserEntity} principal
     * @param {RBACPermissionCreate} permissionCreate
     *
     */
    public async create(
        principal: OrganizationUserEntity,
        permissionCreate: RBACPermissionCreate,
    ): Promise<OrganizationUserRbacPermissionEntity> {
        return new Promise((resolve, reject) => {
            this.getByOrganizationAndName(principal.organization, permissionCreate.name).catch(async (e) => {
                const permission = new OrganizationUserRbacPermissionEntity();

                permission.organization = principal.organization;
                permission.name = permissionCreate.name;
                permission.description = permissionCreate.description;
                permission.type = permissionCreate.type;

                const res = await this.permissionsRepository.save(permission);
                return resolve(res);

            }).then(result => {
                reject(new ConflictException(`permission with the name "${permissionCreate.name}" already exists`));
            });
        });
    }

    /**
     * Delete an existing permission by it's owning organization and permission id.
     *
     * @param {OrganizationUserEntity} principal
     * @param {string} permissionId
     *
     */
    public deleteByPrincipalAndId(
        principal: OrganizationUserEntity,
        permissionId: string,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.getByOrganizationAndId(principal.organization, permissionId).catch(e => {
                reject(e);
            }).then(async (permission: OrganizationUserRbacPermissionEntity) => {
                if(permission) {
                    const result = await this.permissionsRepository.remove(permission);
                    if(result) {
                        await this.flushAllFromCache();
                        return resolve(true);
                    } else {
                        return reject(false);
                    }
                }
            });
        });
    }

}

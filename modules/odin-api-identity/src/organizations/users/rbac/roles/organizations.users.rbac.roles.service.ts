import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, DeleteResult, In } from 'typeorm';
import { RedisClient } from '../../../../common/RedisClient';
import { REDIS_CLIENT } from '../../../../utilities/Constants';
import { OrganizationUsersService } from '../../organizations.users.service';
import { OrganizationsUsersRbacPermissionsService } from '../permissions/organizations.users.rbac.permissions.service';
import { OrganizationsUsersRbacRolesRepository } from './organizations.users.rbac.roles.repository';
import { RBACRoleCreate } from './types/RBACRoleCreate';

@Injectable()
export class OrganizationsUsersRbacRolesService {
    private readonly rolesRepository: OrganizationsUsersRbacRolesRepository;
    private readonly permissionsService: OrganizationsUsersRbacPermissionsService;
    private readonly usersService: OrganizationUsersService;
    private redisService: RedisClient;
    private readonly odinDb: Connection;

    public constructor(
        @InjectRepository(OrganizationsUsersRbacRolesRepository) rolesRepository: OrganizationsUsersRbacRolesRepository,
        @Inject(forwardRef(() => OrganizationUsersService)) usersService: OrganizationUsersService,
        @Inject(REDIS_CLIENT) private readonly redisClient: any,
        permissionsService: OrganizationsUsersRbacPermissionsService,
        @InjectConnection('odinDbConnection') odinDb: Connection,
    ) {
        this.rolesRepository = rolesRepository;
        this.permissionsService = permissionsService;
        this.usersService = usersService;
        this.redisService = new RedisClient(redisClient);
        this.odinDb = odinDb
    }

    private async flushAllFromCache() {
        await this.redisService.flushCache();
    }

    /**
     *
     * @param organization
     */
    public search(
        organization: OrganizationEntity,
    ): Promise<OrganizationUserRbacRoleEntity[]> {
        try {
            return this.rolesRepository.find({
                where: { organization: organization },
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Retrieve a role by it's id and owning organization.
     *
     * @param organization
     * @param id
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async getByOrganizationAndId(
        organization: OrganizationEntity,
        id: string,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            const role = await this.rolesRepository.findOne({
                where: { id, organization },
                join: {
                    alias: 'role',
                    leftJoinAndSelect: {
                        users: 'role.users',
                    },
                },
            });
            if(role) {

                await this.flushAllFromCache();
                return resolve(role);
            } else {
                return reject(new NotFoundException('could not locate role'));
            }
        });
    }

    /**
     * Retrieve an existing role by organization and roleIds
     *
     * @param {OrganizationEntity} organization
     * @param {string[]} roleIds
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async getByOrganizationAndRoleIds(
        roleIds: string[],
    ): Promise<OrganizationUserRbacRoleEntity[]> {
        return new Promise(async (resolve, reject) => {
            const roles = await this.rolesRepository.find({
                where: { id: In(roleIds) },
            });
            if(!!roles) {
                return resolve(roles);
            } else {
                return reject(new NotFoundException('could not locate role'));
            }
        });
    }

    /**
     * Retrieve a role by it's name and owning organization.
     *
     * @param organization
     * @param name
     *
     */
    public async getByOrganizationAndName(
        organization: OrganizationEntity,
        name: string,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            const role = await this.rolesRepository.findOne({
                where: { name, organization },
            });
            if(role) {
                return resolve(role);
            } else {
                return reject(new NotFoundException('could not locate role'));
            }
        });
    }

    /**
     * Get users belonging to a role id and owning organization.
     *
     * @param organization
     * @param roleId
     * @param userId
     *
     */
    public async getOrganizationUserEntitiesByGroupIdAndOrganizationEntity(
        organization: OrganizationEntity,
        roleId: string,
    ): Promise<Array<OrganizationUserEntity>> {
        const role = await this.rolesRepository.findOne({
            where: { organization, id: roleId },
            join: {
                alias: 'role',
                leftJoinAndSelect: {
                    users: 'role.users',
                },
            },
        });
        return role.users;
    }

    /**
     * Delete an existing role by it's id and owning organization.
     *
     * @param {OrganizationEntity} organization
     * @param {string} id
     *
     */
    public deleteByPrincipalAndId(
        principal: OrganizationUserEntity,
        id: string,
    ): Promise<{ affected: number }> {
        return new Promise(async (resolve, reject) => {
            try {
                const deleteResult: DeleteResult = await this.rolesRepository.delete(
                    { id, organization: principal.organization },
                );

                await this.flushAllFromCache();
                return resolve({ affected: deleteResult.affected });
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Create a new role.
     * this will automatically add the role to the authenticated user.
     * @param principal
     * @param roleCreate
     *
     */
    public createByPrincipal(
        principal: OrganizationUserEntity,
        roleCreate: RBACRoleCreate,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const role: OrganizationUserRbacRoleEntity = await this.rolesRepository.findOne(
                    {
                        where: {
                            name: roleCreate.name,
                            organization: principal.organization,
                        },
                    },
                );

                if(!!role) {
                    return reject(
                        new ExceptionType(
                            409,
                            'a role with that name already exists',
                        ),
                    );
                } else {
                    const update: OrganizationUserRbacRoleEntity = await this.rolesRepository.save(
                        {
                            user: principal,
                            organization: principal.organization,
                            name: roleCreate.name,
                            description: roleCreate.description,
                        },
                    );

                    return resolve(update);
                }
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a permission to a role.
     *
     * @param principal
     * @param roleId
     * @param permissionId
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async addPermission(
        principal: OrganizationUserEntity,
        roleId: string,
        permissionId: string,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const role = await this.getByOrganizationAndId(
                    principal.organization,
                    roleId,
                );
                const permission = await this.permissionsService.getByOrganizationAndId(
                    principal.organization,
                    permissionId,
                );

                role.permissions.push(permission);

                const res = await this.rolesRepository.save(role);

                await this.flushAllFromCache();
                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a multiple permission to a role.
     *
     * @param principal
     * @param roleId
     * @param permissionIds
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async addPermissionsToRole(
        principal: OrganizationUserEntity,
        roleId: string,
        permissionIds: string[],
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const role = await this.getByOrganizationAndId(
                    principal.organization,
                    roleId,
                );
                if(permissionIds && permissionIds.length) {
                    const permissions = await this.permissionsService.getByOrganizationAndPermissionIds(
                        principal.organization,
                        permissionIds,
                    );
                    role.permissions = permissions;
                } else {
                    role.permissions = [];
                }
                const res = await this.rolesRepository.save(role);

                await this.flushAllFromCache();
                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a multiple users to a role.
     *
     * @param principal
     * @param roleId
     * @param userIds
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async assignUsersToRole(
        principal: OrganizationUserEntity,
        roleId: string,
        userIds: string[],
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const role = await this.getByOrganizationAndId(
                    principal.organization,
                    roleId,
                );
                if(userIds && userIds.length) {
                    const users = await this.usersService.getByOrganizationAndUserIds(
                        principal.organization,
                        userIds,
                    );
                    role.users = users;
                } else {
                    role.users = [];
                }
                const res = await this.rolesRepository.save(role);

                await this.flushAllFromCache();
                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Remove a permission assignment from an existing role by owning organization.
     *
     * @param organization
     * @param {string} roleId
     * @param {string} permissionId
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async permissionRemove(
        organization: OrganizationEntity,
        roleId: string,
        permissionId: string,
    ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.rolesRepository
                    .createQueryBuilder()
                    .delete()
                    .from(OrganizationUserRbacRoleEntity)
                    .relation(OrganizationUserRbacRoleEntity, 'permissions')
                    .of(await this.getByOrganizationAndId(organization, roleId))
                    .remove(
                        await this.permissionsService.getByOrganizationAndId(
                            organization,
                            permissionId,
                        ),
                    );

                await this.flushAllFromCache();
                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a user to a role by owning organization.
     *
     * @param principal
     * @param roleId
     * @param userId
     *
     * @return {Promise<boolean>}
     */
    public async assignToOrganizationUserEntity(
        principal: OrganizationUserEntity,
        roleId: string,
        userId: string,
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const user: OrganizationUserEntity = await this.usersService.getByIdAndPrincipalOrganizationEntity(
                    principal.organization,
                    userId,
                );
                const role: OrganizationUserRbacRoleEntity = await this.getByOrganizationAndId(
                    principal.organization,
                    roleId,
                );
                await this.rolesRepository
                    .createQueryBuilder()
                    .relation(OrganizationUserRbacRoleEntity, 'users')
                    .of(role)
                    .add(user);

                await this.flushAllFromCache();
                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Remove a user from a role by owning organization.
     *
     * @param principal
     * @param roleId
     * @param userId
     *
     * @return {Promise<boolean>}
     */
    public async unassignFromOrganizationUserEntity(
        principal: OrganizationUserEntity,
        roleId: string,
        userId: string,
    ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const user: OrganizationUserEntity = await this.usersService.getByIdAndPrincipalOrganizationEntity(
                    principal.organization,
                    userId,
                );
                const role: OrganizationUserRbacRoleEntity = await this.getByOrganizationAndId(
                    principal.organization,
                    roleId,
                );
                await this.rolesRepository
                    .createQueryBuilder()
                    .delete()
                    .from(OrganizationUserRbacRoleEntity)
                    .relation(OrganizationUserRbacRoleEntity, 'users')
                    .of(role)
                    .remove(user);

                await this.flushAllFromCache();
                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Get linked roles.
     *
     * @param {OrganizationEntity} organization
     * @param {string} id
     *
     */
    public async linksGet(
        organization: OrganizationEntity,
        id: string,
    ): Promise<Array<OrganizationUserRbacRoleEntity>> {
        return new Promise(async (resolve, reject) => {
            try {
                const entity = await this.rolesRepository.findOne({
                    where: { id, organization },
                    relations: [ 'links' ],
                });
                return resolve(entity.links);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Link a role to a role.
     *
     * @param {OrganizationUserEntity} principal
     * @param {string} roleId
     * @param {string} linkedRoleIds
     *
     * @return {Promise<boolean>}
     */
    public async linkRolesToRole(
        principal: OrganizationUserEntity,
        roleId: string,
        linkedRoleIds: string[],
    ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {

                 await this.rolesRepository
                        .createQueryBuilder()
                        .relation(OrganizationUserRbacRoleEntity, 'links')
                        .of(roleId)
                        .add(linkedRoleIds);

                await this.flushAllFromCache();

                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Remove a linked role from a role.
     *
     * @param {OrganizationUserEntity} principal
     * @param {string} parentRoleId
     * @param {string} roleToRemoveId
     *
     * @return {Promise<boolean>}
     */
    public async linkRemove(
        principal: OrganizationUserEntity,
        parentRoleId: string,
        roleToRemoveId: string,
    ): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                const parentRole: OrganizationUserRbacRoleEntity = await this.getByOrganizationAndId(
                    principal.organization,
                    parentRoleId,
                );
                const childRole: OrganizationUserRbacRoleEntity = await this.getByOrganizationAndId(
                    principal.organization,
                    roleToRemoveId,
                );
                await this.rolesRepository
                    .createQueryBuilder()
                    .delete()
                    .from(OrganizationUserRbacRoleEntity)
                    .relation(OrganizationUserRbacRoleEntity, 'links')
                    .of(parentRole)
                    .remove(childRole);

                await this.flushAllFromCache();

                return resolve(true);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Retrieve an existing role by userId
     *
     * @param {string} userIds
     *
     * @return {Promise<string[]>}
     */
    public async getRolesAndLinkedRolesByUserId(
        userId: string,
    ): Promise<string[]> {
        return new Promise(async (resolve, reject) => {

            const roles = await this.odinDb.query(`
            SELECT organizations_users_roles_id
            FROM organizations_users_roles_assignments
            WHERE organizations_users_id = '${userId}'`)

            const linkedRoles = await this.odinDb.query(`
            SELECT child_role_id
            FROM organizations_roles_links
            WHERE role_id IN (
                    SELECT organizations_users_roles_id
                    FROM organizations_users_roles_assignments
                    WHERE organizations_users_id = '${userId}'
            )`)

            const allRoles = [];

            // add roles
            for(const role of roles) {
                allRoles.push(role.organizations_users_roles_id);
            }

            // add linked roles
            for(const linkedRole of linkedRoles) {
                allRoles.push(linkedRole.child_role_id);
            }

            const uniqueRoles = [ ...new Set(allRoles) ];

            if(!!roles) {

                return resolve(uniqueRoles);

            } else {

                return reject(new NotFoundException('could not locate role'));

            }
        });
    }
}

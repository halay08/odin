import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserCreate } from '@d19n/models/dist/identity/organization/user/organization.user.create';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserStatus } from '@d19n/models/dist/identity/organization/user/organization.user.status';
import { OrganizationUserUpdate } from '@d19n/models/dist/identity/organization/user/organization.user.update';
import { IdentityOrganizationUserChangePassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.change.password';
import { IdentityOrganizationUserForgotPassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.forgot.password';
import { IdentityOrganizationUserLogin } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.login';
import { IdentityOrganizationUserRegister } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.register';
import { IdentityOrganizationUserResetPassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.reset.password';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { DeleteResult, In } from 'typeorm';
import { RedisClient } from '../../common/RedisClient';
import { REDIS_CLIENT } from '../../utilities/Constants';
import { OrganizationEntitysService } from '../organizations.service';
import { OrganizationsUsersGroupsService } from './groups/organizations.users.groups.service';
import { SanitizeUser } from './helpers/sanitize.user';
import { OrganizationUserEntityRepository } from './organizations.users.repository';
import { OrganizationsUsersRbacService } from './rbac/organizations.users.rbac.service';
import { OrganizationsUsersRbacRolesService } from './rbac/roles/organizations.users.rbac.roles.service';

const { NOTIFICATION_MODULE } = SchemaModuleTypeEnums;

dotenv.config();

@Injectable()
export class OrganizationUsersService extends SanitizeUser {
    public readonly userRepository: OrganizationUserEntityRepository;
    private readonly organizationsService: OrganizationEntitysService;
    private groupsService: OrganizationsUsersGroupsService;
    private rbacService: OrganizationsUsersRbacService;
    private redisService: RedisClient;
    private rolesService: OrganizationsUsersRbacRolesService;
    private readonly amqpConnection: AmqpConnection;

    public constructor(
        @InjectRepository(OrganizationUserEntity)userRepository: OrganizationUserEntityRepository,
        @Inject(forwardRef(() => OrganizationsUsersRbacService))rbacService: OrganizationsUsersRbacService,
        @Inject(forwardRef(() => OrganizationsUsersRbacRolesService))rolesService: OrganizationsUsersRbacRolesService,
        @Inject(REDIS_CLIENT) private readonly redisClient: any, organizationsService: OrganizationEntitysService,
        @Inject(forwardRef(() => OrganizationsUsersGroupsService))groupsService: OrganizationsUsersGroupsService,
        amqpConnection: AmqpConnection,
    ) {
        super();

        this.rbacService = rbacService;
        this.userRepository = userRepository;
        this.organizationsService = organizationsService;
        this.groupsService = groupsService;
        this.redisService = new RedisClient(redisClient);
        this.rolesService = rolesService;
        this.amqpConnection = amqpConnection;
    }

    public async removeAllFromCache(userId: string) {
        const cacheKey1 = `/my/${userId}`;
        await this.redisService.removeFromCache(cacheKey1);
    }

    /**
     * Creates a user account only if the email address doesn't exist.
     *
     * @param {OrganizationUserEntity} user
     * @returns {Promise<OrganizationUserEntity>}
     *
     */
    public async create(
        user: OrganizationUserEntity,
    ): Promise<OrganizationUserEntity> {
        if(await this.getByEmail(user.email)) {
            throw new ExceptionType(409, 'conflict, email already exists');
        } else {
            return this.userRepository.save(user);
        }
    }

    /**
     * Returns a user object (typically used for getting a profile via /my).
     *
     */
    public getOrganizationUserEntityById(
        userId: string,
    ): Promise<OrganizationUserEntity> {
        return new Promise(async (resolve, reject) => {
            try {

                const cacheKey = `/my/${userId}`;
                const cached = await this.redisService.getFromCache<OrganizationUserEntity>(cacheKey);

                if(cached) {
                    return resolve(cached);
                }

                // find the user
                const user = await this.userRepository.findOne({
                    where: { id: userId },
                });

                const roleIds = await this.rolesService.getRolesAndLinkedRolesByUserId(userId);
                const roles = await this.rolesService.getByOrganizationAndRoleIds(roleIds);
                user.roles = roles;

                if(!user) {
                    return reject(
                        new ExceptionType(404, 'could not locate user'),
                    );
                }
                const sanitized = this.sanitizeUser(user);
                // save to cache
                await this.redisService.saveToCache<OrganizationUserEntity>(cacheKey, sanitized);
                return resolve(sanitized);
            } catch (e) {
                console.error(e);
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Retrieve a user object ONLY if the email and password matches.
     * Note: This will take the plaintext password and automatically encrypt it!
     * @param {string} email
     *
     */
    public async getByEmail(email: string): Promise<OrganizationUserEntity> {
        try {
            return this.userRepository.findOne({
                where: { email },
            });
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Retrieve all users based on the owning organization.
     * @param {OrganizationEntity} organization
     */
    public async getByOrganizationEntity(
        organization: OrganizationEntity,
    ): Promise<OrganizationUserEntity[]> {
        try {
            const res = await this.userRepository.find({
                where: { organization },
            });
            return this.sanitizeUsers(res);
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Retrieve an existing users by organization and userIds.
     *
     * @param {OrganizationEntity} organization
     * @param {string[]} userIds
     *
     */
    public getByOrganizationAndUserIds(
        organization: OrganizationEntity,
        userIds: string[],
    ): Promise<OrganizationUserEntity[]> {
        return new Promise(async (resolve, reject) => {
            const users = await this.userRepository.find({
                where: { id: In(userIds) },
            });
            if(!!users) {
                return resolve(users);
            } else {
                return reject(new NotFoundException('could not locate user'));
            }
        });
    }

    /**
     * Retrieve a specific user based on the owning organization.
     * @param {OrganizationEntity} organization
     * @param id
     */
    public async getByIdAndPrincipalOrganizationEntity(
        organization: OrganizationEntity,
        id: string,
    ): Promise<OrganizationUserEntity> {
        try {
            const res = await this.userRepository.findOne({
                where: { id, organization },
            });
            return this.sanitizeUser(res);
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * OrganizationUserEntity login.
     */
    public async login(
        userLogin: IdentityOrganizationUserLogin,
    ): Promise<OrganizationUserEntity> {
        return new Promise(async (resolve, reject) => {

            const user = await this.getByEmail(userLogin.email.trim().toLowerCase());

            if(user) {
                const verifyPassword = await bcrypt.compare(
                    userLogin.password,
                    user.password,
                );
                if(!verifyPassword) {
                    return reject(new ExceptionType(401, 'password incorrect'));
                }
            }

            // remove the previous users cached key
            await this.removeAllFromCache(user.id);

            return resolve(user);
        });
    }

    /**
     * Registers a new user by creating both the organization and user.
     */
    public async register(
        userRegister: IdentityOrganizationUserRegister,
    ): Promise<OrganizationUserEntity> {
        try {
            //
            // First create organization so we can later assignToOrganizationUserEntity it to the
            // user record that we'll created.
            //
            const _organization: OrganizationEntity = new OrganizationEntity();
            _organization.name = userRegister.organizationName;
            let organization: OrganizationEntity = await this.organizationsService.create(
                _organization,
            );
            //
            // Create user assigning the organization to it.
            //
            const _user: OrganizationUserEntity = new OrganizationUserEntity();
            _user.status = OrganizationUserStatus.PENDING_CONFIRMATION;
            _user.organization = organization;
            _user.email = userRegister.email.trim().toLowerCase();
            _user.firstname = userRegister.firstname;
            _user.lastname = userRegister.lastname;
            _user.password = userRegister.password;

            const res: OrganizationUserEntity = await this.create(_user);

            await this.rbacService.initializeAdmin(res);
            // generate token with an expiration of 24 hours
            const token = jwt.sign(
                { id: res.id },
                process.env.JWT_TOKEN_SECRET,
                { expiresIn: 86400 },
            );

            jwt.verify(token, process.env.JWT_TOKEN_SECRET);

            return this.sanitizeUser(res);
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * update a user
     * @param principal
     * @param userId
     * @param body
     */
    public async updateByPrincipalAndId(
        principal: OrganizationUserEntity,
        userId: string,
        body: OrganizationUserUpdate,
    ): Promise<OrganizationUserEntity> {
        try {
            const userRecord = await this.getOrganizationUserEntityById(userId);
            userRecord.firstname = body.firstname;
            userRecord.lastname = body.lastname;
            userRecord.status = OrganizationUserStatus[body.status];
            userRecord.email = !!body.email ? body.email.trim().toLowerCase() : null;

            const res = await this.userRepository.save(userRecord);

            await this.removeAllFromCache(userId);
            return this.sanitizeUser(res);
        } catch (e) {
            throw new ExceptionType(
                404,
                'could not locate any user with that email',
            );
        }
    }

    /**
     * activate a user after registration by Id
     * @param userId
     */
    public async activateOrganizationUserEntityById(
        userId: string,
    ): Promise<OrganizationUserEntity> {
        try {
            const userRecord = await this.userRepository.findOne({
                id: userId,
            });
            if(!userRecord) {
                throw new ExceptionType(404, 'could not activate user');
            }

            userRecord.status = OrganizationUserStatus.ACTIVE;
            userRecord.emailVerified = true;

            const res = await this.userRepository.save(userRecord);
            await this.removeAllFromCache(userId);
            return this.sanitizeUser(res);
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * changing users password
     * @param principal
     * @param changePassword
     */
    public async changePassword(
        principal: OrganizationUserEntity,
        changePassword: IdentityOrganizationUserChangePassword,
    ): Promise<OrganizationUserEntity> {
        try {
            const user = await this.getByEmail(changePassword.email);
            if(!user) {
                throw new ExceptionType(
                    404,
                    'could not locate user with that email',
                );
            }

            if(changePassword.password !== changePassword.confirmPassword) {
                throw new ExceptionType(404, 'passwords do not match');
            }

            user.password = changePassword.password;
            const res = await this.userRepository.save(user);

            await this.removeAllFromCache(user.id);

            return this.sanitizeUser(res);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * changing users password
     * @param body
     */
    public async forgotPasswordByEmail(
        body: IdentityOrganizationUserForgotPassword,
    ): Promise<OrganizationUserEntity> {
        try {
            const user = await this.getByEmail(body.email);
            if(!user) {
                throw new ExceptionType(
                    404,
                    'could not locate user with that email',
                );
            }
            // generate token with an expiration of 15 minutes
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_TOKEN_SECRET,
                { expiresIn: 900 },
            );

            const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

            // send the email with password reset link
            const resetLink = `${user.organization.webUrl}reset-password/${token}`;

            const response = await this.amqpConnection.request<any>({
                exchange: NOTIFICATION_MODULE,
                routingKey: `${NOTIFICATION_MODULE}.SendResetPasswordEmail`,
                payload: {
                    principal: user,
                    body: {
                        to: user.email,
                        from: 'no-reply@odinsystems.com',
                        subject: `${user.organization.name} password reset`,
                        body: 'link expires in 15 minutes',
                        resetLink: resetLink,
                    },
                },
                timeout: 10000,
            });

            return this.sanitizeUser(user);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * changing users password
     * @param userId
     * @param resetPassword
     */
    public async resetPassword(
        userId: string,
        resetPassword: IdentityOrganizationUserResetPassword,
    ): Promise<OrganizationUserEntity> {
        try {
            const user = await this.getOrganizationUserEntityById(userId);

            if(resetPassword.password !== resetPassword.confirmPassword) {
                throw new ExceptionType(404, 'no user found with that id');
            }

            user.password = resetPassword.password;
            const res = await this.userRepository.save(user);
            await this.removeAllFromCache(user.id);

            return this.sanitizeUser(res);
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param body
     */
    public createByOrganizationEntity(
        principal: OrganizationUserEntity,
        body: OrganizationUserCreate,
    ): Promise<OrganizationUserEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = new OrganizationUserEntity();
                user.organization = principal.organization;
                user.status = OrganizationUserStatus.ACTIVE;
                user.firstname = body.firstname;
                user.lastname = body.lastname;
                user.email = body.email.trim().toLowerCase();
                user.password = body.password;
                user.isBetaTester = false;

                const res = await this.create(user);
                return resolve(this.sanitizeUser(res));
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a group assignment to user by owning principal organization.
     *
     * @param {OrganizationUserEntity} principal
     * @param {string} userId
     * @param groupIds
     *
     * @return {Promise<void>}
     */
    public async groupAdd(
        principal: OrganizationUserEntity,
        userId: string,
        groupIds: string[],
    ): Promise<OrganizationUserEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getByIdAndPrincipalOrganizationEntity(
                    principal.organization,
                    userId,
                );

                if(groupIds && groupIds.length) {
                    const groups = await this.groupsService.getByOrganizationAndIds(
                        principal.organization,
                        groupIds,
                    );
                    user.groups = groups;
                } else {
                    user.groups = [];
                }
                const res = await this.userRepository.save(user);

                await this.removeAllFromCache(user.id);
                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Remove a group assignment from user by owning principal organization.
     *
     * @param {OrganizationUserEntity} principal
     * @param {string} userId
     * @param {string} groupId
     *
     * @return {Promise<void>}
     */
    public async groupRemove(
        principal: OrganizationUserEntity,
        userId: string,
        groupId: string,
    ): Promise<boolean> {
        try {
            await this.userRepository
                .createQueryBuilder()
                .delete()
                .from(OrganizationUserEntity)
                .relation(OrganizationUserEntity, 'groups')
                .of(
                    await this.getByIdAndPrincipalOrganizationEntity(
                        principal.organization,
                        userId,
                    ),
                )
                .remove(
                    await this.groupsService.getByOrganizationAndId(
                        principal.organization,
                        groupId,
                    ),
                );

            await this.removeAllFromCache(userId);

            return true;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Delete schema by id and owning organization.
     *
     * @param principal
     * @param userId
     *
     */
    public deleteByPrincipalAndId(
        principal: OrganizationUserEntity,
        userId: string,
    ): Promise<{ affected: number }> {
        return new Promise(async (resolve, reject) => {
            try {
                const deleteResult: DeleteResult = await this.userRepository.delete(
                    {
                        id: userId,
                    },
                );
                if(deleteResult.affected < 1) {
                    return reject(new ExceptionType(500, 'no records deleted'));
                }

                await this.removeAllFromCache(userId);
                return resolve({ affected: deleteResult.affected });
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Add a multiple roles to a user.
     *
     * @param principal
     * @param userId
     * @param roleIds
     *
     * @return {Promise<OrganizationUserEntity>}
     */
    public async addRolesToUser(
        principal: OrganizationUserEntity,
        userId: string,
        roleIds: string[],
    ): Promise<OrganizationUserEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.getByIdAndPrincipalOrganizationEntity(
                    principal.organization,
                    userId,
                );

                if(roleIds && roleIds.length) {
                    const roles = await this.rolesService.getByOrganizationAndRoleIds(
                        roleIds,
                    );
                    user.roles = roles;
                } else {
                    user.roles = [];
                }
                const res = await this.userRepository.save(user);

                await this.removeAllFromCache(userId);

                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }
}

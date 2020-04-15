import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { RPC_GET_USER_BY_ID } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IGetOrganizationUserById } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { RedisClient } from '../../common/RedisClient';
import { REDIS_CLIENT } from '../../utilities/Constants';
import { OrganizationEntitysService } from '../organizations.service';
import { OrganizationsUsersGroupsService } from './groups/organizations.users.groups.service';
import { SanitizeUser } from './helpers/sanitize.user';
import { OrganizationUserEntityRepository } from './organizations.users.repository';
import { OrganizationsUsersRbacService } from './rbac/organizations.users.rbac.service';
import { OrganizationsUsersRbacRolesService } from './rbac/roles/organizations.users.rbac.roles.service';

dotenv.config();

@Injectable()
export class OrganizationsUsersServiceRpc extends SanitizeUser {
    public readonly userRepository: OrganizationUserEntityRepository;
    private readonly organizationsService: OrganizationEntitysService;
    private readonly groupsService: OrganizationsUsersGroupsService;
    private rbacService: OrganizationsUsersRbacService;
    private redisService: RedisClient;
    private rolesService: OrganizationsUsersRbacRolesService;

    public constructor(
        @InjectRepository(OrganizationUserEntity)
            userRepository: OrganizationUserEntityRepository,
        @Inject(forwardRef(() => OrganizationsUsersRbacService))
            rbacService: OrganizationsUsersRbacService,
        @Inject(forwardRef(() => OrganizationsUsersRbacRolesService))
            rolesService: OrganizationsUsersRbacRolesService,
        @Inject(REDIS_CLIENT) private readonly redisClient: any,
        organizationsService: OrganizationEntitysService,
        groupsService: OrganizationsUsersGroupsService,
    ) {
        super();
        this.rbacService = rbacService;
        this.userRepository = userRepository;
        this.organizationsService = organizationsService;
        this.groupsService = groupsService;
        this.redisService = new RedisClient(redisClient);
        this.rolesService = rolesService;
    }

    // RPC methods
    @RabbitRPC({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${RPC_GET_USER_BY_ID}`,
        queue: `${process.env.MODULE_NAME}.${RPC_GET_USER_BY_ID}`,
    })
    public async getUserByIdRpc(msg: IGetOrganizationUserById) {
        console.log(`Received message RPC: ${JSON.stringify(msg)}`);
        try {
            // find the user
            const user = await this.userRepository.findOne({
                where: { id: msg.id },
            });

            if(user) {
                const sanitized = this.sanitizeUser(user);
                return {
                    statusCode: 200,
                    message: 'success',
                    data: sanitized,
                };
            } else {
                return {
                    statusCode: 404,
                    message: 'user not found',
                    data: undefined,
                };
            }
        } catch (e) {
            console.error(e);
            return {
                statusCode: 500,
                message: e.message,
                data: undefined,
            }
        }
    }

}

import { OrganizationEntity } from "@d19n/models/dist/identity/organization/organization.entity";
import { OrganizationUserGroupEntity } from "@d19n/models/dist/identity/organization/user/group/organization.user.group.entity";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import {
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { OrganizationsUsersGroupsRepository } from "./organizations.users.groups.repository";
import { OrganizationUserGroupCreateUpdate } from "@d19n/models/dist/identity/organization/user/group/organization.user.group.create.update";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { In } from "typeorm";
import { OrganizationUsersService } from '../organizations.users.service';
@Injectable()
export class OrganizationsUsersGroupsService {
    private readonly groupsRepository: OrganizationsUsersGroupsRepository;
    private readonly usersService: OrganizationUsersService;
    public constructor(
        groupsRepository: OrganizationsUsersGroupsRepository,
        usersService: OrganizationUsersService,
    ) {
        this.groupsRepository = groupsRepository;
        this.usersService = usersService;
    }

    /**
     *
     * @param organization
     */
    public getByOrganizationEntity(
        organization: OrganizationEntity
    ): Promise<Array<OrganizationUserGroupEntity>> {
        return new Promise(async (resolve, reject) => {
            const response: void | Array<OrganizationUserGroupEntity> = await this.groupsRepository
                .find({ where: { organization } })
                .catch(reject);
            if (response) {
                return resolve(response);
            }
        });
    }

    /**
     *
     * @param organization
     * @param body
     */
    public createByOrganizationEntity(
        organization: OrganizationEntity,
        body: OrganizationUserGroupCreateUpdate
    ): Promise<OrganizationUserGroupEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const group: OrganizationUserGroupEntity = await this.groupsRepository.findOne(
                    { name: body.name }
                );

                if (!!group) {
                    return reject(
                        new ExceptionType(
                            409,
                            "a group with that name already exists"
                        )
                    );
                }
                const newGroup = new OrganizationUserGroupEntity();
                newGroup.organization = organization;
                newGroup.name = body.name;
                newGroup.description = body.description;
                // newGroup.groups = body.groups;
                const response: OrganizationUserGroupEntity = await this.groupsRepository.save(
                    newGroup
                );
                return resolve(response);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     *
     * @param organization
     * @param groupId
     */
    public getByOrganizationAndId(
        organization: OrganizationEntity,
        groupId: string
    ): Promise<OrganizationUserGroupEntity> {
        return new Promise(async (resolve, reject) => {
            const response: void | OrganizationUserGroupEntity = await this.groupsRepository
                .findOne({
                    where: {
                        organization,
                        id: groupId
                    },
                    join: {
                        alias: "group",
                        leftJoinAndSelect: {
                            users: "group.users"
                        }
                    }
                })
                .catch(reject);
            if (response) {
                return resolve(response);
            }
        });
    }

    /**
     *
     * @param organization
     * @param groupIds
     */
    public getByOrganizationAndIds(
        organization: OrganizationEntity,
        groupIds: string[]
    ): Promise<OrganizationUserGroupEntity[]> {
        return new Promise(async (resolve, reject) => {
            const response = await this.groupsRepository
                .find({
                    where: {
                        organization,
                        id: In(groupIds)
                    }
                })
                .catch(reject);
            if (response) {
                return resolve(response);
            }
        });
    }

    /**
     * Get by user id and organization.
     *
     * @param organization
     * @param user
     *
     */
    public getAllByOrganizationUserEntityAndOrganizationEntity(
        organization: OrganizationEntity,
        user: OrganizationUserEntity
    ): Promise<Array<OrganizationUserGroupEntity>> {
        return new Promise(async (resolve, reject) => {
            const response: void | Array<
                OrganizationUserGroupEntity
            > = await this.groupsRepository
                .find({
                    where: {
                        organization,
                        user
                    }
                })
                .catch(() => {
                    reject(new NotFoundException("could not locate group"));
                });

            if (response) {
                return resolve(response);
            } else {
                reject(new NotFoundException("could not locate group"));
            }
        });
    }

    // /**
    //  *
    //  * @param principal
    //  * @param roleId
    //  * @param userId
    //  */
    // public async assignToOrganizationUserEntity(principal: OrganizationUserEntity, groupId:
    // string, userId: string): Promise<boolean> {  const group = await
    // this.getByOrganizationAndId(principal.organization, groupId); const user = await
    // this.usersService.getOrganizationUserEntityById(userId); user.groups.push(group);
    // console.log(await this.usersService.userRepository.save(user)); return true;  }

    /**
     * Get users belonging to a group id and owning organization.
     *
     * @param organization
     * @param groupId
     * @param userId
     *
     * @return {Promise<OrganizationUserGroupEntity>}
     */
    public async getOrganizationUserEntitiesByGroupIdAndOrganizationEntity(
        organization: OrganizationEntity,
        groupId: string
    ): Promise<OrganizationUserEntity[]> {
        const group = await this.groupsRepository.findOne({
            where: { organization, id: groupId },
            join: {
                alias: "group",
                leftJoinAndSelect: {
                    users: "group.users"
                }
            }
        });
        return group.users;
    }

    /**
     * Add a user to an existing group by owning organization.
     *
     * @param {OrganizationEntity} organization
     * @param {string} groupId
     * @param {string} userId
     *
     * @return {Promise<boolean>}
     */
    public async addOrganizationUserEntityByGroupIdAndOrganizationEntity(
        organization: OrganizationEntity,
        groupId: string,
        userId: string
    ): Promise<boolean> {
        console.log(1);
        console.log(await this.getByOrganizationAndId(organization, groupId));
        console.log(2);
        console.log(userId);
        // console.log(await this.usersService.getByIdAndPrincipalOrganizationEntity(organization,
        // userId));
        console.log(9999);
        // await this.groupsRepository
        //           .createQueryBuilder()
        //           .relation(OrganizationUserGroupEntity, 'users')
        //           .of(await this.getByOrganizationAndId(organization, groupId))
        //           .add(await
        // this.usersService.getByIdAndPrincipalOrganizationEntity(organization, userId));
        return true;
    }

    /**
     *
     * @param organization
     * @param recordId
     */
    public async deleteByPrincipalAndId(
        organization: OrganizationEntity,
        recordId: string
    ): Promise<any> {
        return new Promise(async resolve => {
            // Delete the record
            const dbRecord = await this.groupsRepository.delete({
                id: recordId
            });
            if (!dbRecord) {
                return resolve({
                    status: "FAILED",
                    message: "failed to delete group"
                });
            }
            return resolve({
                status: "DELETED",
                message: "successfully deleted group"
            });
        });
    }

    //
    // Group links (children)
    //

    /**
     * Retrieve the children of a specific group.
     *
     * @param {OrganizationEntity} organization
     * @param {string} groupId
     *
     * @returns {Promise<Array<OrganizationUserGroupEntity>>}
     */
    public async childrenGet(
        organization: OrganizationEntity,
        groupId: string
    ): Promise<Array<OrganizationUserGroupEntity>> {
        // await
        // this.groupsRepository.createQueryBuilder('group').innerJoinAndSelect('group.groups',
        // 'children').getMany().then(v => console.log(v)).catch(e => console.log(e));  await
        // this.groupsRepository.find({  where: { id: groupId, organization }, relations: [
        // 'groups' ]  }).catch(e => console.log(e));
        const group = await this.groupsRepository.findOne({
            where: { id: groupId, organization },
            relations: ["groups"]
        });
        console.log(group);
        return group.groups;
    }

    /**
     * Add a child group to an existing group.
     *
     * @param {OrganizationEntity} organization
     * @param {string} groupId
     * @param {string} childGroupId
     *
     * @returns {Promise<OrganizationUserGroupEntity>}
     */
    public async childAdd(
        organization: OrganizationEntity,
        groupId: string,
        childGroupId: string
    ): Promise<boolean> {
        await this.groupsRepository
            .createQueryBuilder()
            .relation(OrganizationUserGroupEntity, "groups")
            .of(await this.getByOrganizationAndId(organization, groupId))
            .add(await this.getByOrganizationAndId(organization, childGroupId));

        return true;
    }

    /**
     * Remove a child group from an existing group.
     *
     * @param {OrganizationEntity} organization
     * @param {string} groupId
     * @param {string} childGroupId
     *
     * @returns {Promise<OrganizationUserGroupEntity>}
     */
    public async childRemove(
        organization: OrganizationEntity,
        groupId: string,
        childGroupId: string
    ): Promise<boolean> {
        await this.groupsRepository
            .createQueryBuilder()
            .delete()
            .from(OrganizationUserGroupEntity)
            .relation(OrganizationUserGroupEntity, "groups")
            .of(await this.getByOrganizationAndId(organization, groupId))
            .remove(
                await this.getByOrganizationAndId(organization, childGroupId)
            );
        return true;
    }

    /**
     * Add a multiple users to a group.
     *
     * @param principal
     * @param groupId
     * @param userIds
     *
     * @return {Promise<OrganizationUserRbacRoleEntity>}
     */
    public async assignUsersToGroup(
        principal: OrganizationUserEntity,
        groupId: string,
        userIds: string[],
    ): Promise<OrganizationUserGroupEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const group = await this.getByOrganizationAndId(
                    principal.organization,
                    groupId,
                );
                if(userIds && userIds.length) {
                    const users = await this.usersService.getByOrganizationAndUserIds(
                        principal.organization,
                        userIds,
                    );
                    group.users = users;
                } else {
                    group.users = [];
                }
                const res = await this.groupsRepository.save(group);
                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }
}

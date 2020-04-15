import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationUsersService } from '../../organizations.users.service';
import { OrganizationsUsersRbacPermissionsService } from '../permissions/organizations.users.rbac.permissions.service';
import { OrganizationsUsersRbacRolesController } from './organizations.users.rbac.roles.controller';
import { OrganizationsUsersRbacRolesRepository } from './organizations.users.rbac.roles.repository';
import { OrganizationsUsersRbacRolesService } from './organizations.users.rbac.roles.service';
import { RBACRoleCreate } from './types/RBACRoleCreate';

const organizationUserEntity = require('../../../../../test/entities/organization.user.entity');

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
};

export const mockRepository = jest.fn(() => ({
    metadata: {
        columns: [],
        relations: [],
    },
}));


describe('Organizations Users Rbac Roles Controller', () => {
    let controller: OrganizationsUsersRbacRolesController;
    let spyService: OrganizationsUsersRbacRolesService;
    let repositoryMock: MockType<Repository<OrganizationUserRbacRoleEntity>>;

    beforeEach(async () => {
        const testingModule: TestingModule = await Test.createTestingModule({
            controllers: [ OrganizationsUsersRbacRolesController ],
            providers: [
                OrganizationsUsersRbacRolesService,
                OrganizationsUsersRbacPermissionsService,
                OrganizationUsersService,
                {
                    provide: 'OrganizationsUsersRbacRolesRepository',
                    useClass: Repository,
                },
                {
                    provide: 'OrganizationsUsersRbacPermissionsRepository',
                    useClass: Repository,
                },
                // {
                //     // how you provide the injection token in a test instance
                //     provide: getRepositoryToken(OrganizationUserRbacRoleEntity),
                //     // as a class value, Repository needs no generics
                //     useFactory: mockRepository
                // },
            ],
        }).compile();

        console.log('testingModule', testingModule);

        controller = testingModule.get<OrganizationsUsersRbacRolesController>(OrganizationsUsersRbacRolesController);
        spyService = testingModule.get<OrganizationsUsersRbacRolesService>(OrganizationsUsersRbacRolesService);
        repositoryMock = testingModule.get(getRepositoryToken(OrganizationUserRbacRoleEntity));
    });

    describe('createByPrincipal', () => {
        it('should create a new role with an authenticated user', async () => {
            const params: RBACRoleCreate = {
                name: 'manager',
                description: 'this is the role for managers',
            };
            controller.createByPrincipal(organizationUserEntity, params);
            expect(spyService.createByPrincipal(organizationUserEntity, params)).toHaveBeenCalledWith(params);
        });
    });
});

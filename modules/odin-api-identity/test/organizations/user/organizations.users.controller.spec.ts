import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { RBACControllerHelpers } from "../../helpers/RBACControllerHelpers";
import { TokenControllerHelpers } from "../../helpers/TokenControllerHelpers";
import { OrganizationUserEntityControllerHelpers } from "../../helpers/UserControllerHelpers";
import { OrganizationUserStatus } from "@d19n/models/dist/identity/organization/user/organization.user.status";
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type";
import { OrganizationUserTokenEntity } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.entity";


describe('E2E OrganizationUserEntity Controller Integration Test', () => {

    let principal: OrganizationUserEntity;
    let token: OrganizationUserTokenEntity;

    const email = "testing122334@test.com";
    const password = "password122334";

    test('Register a new user and organization', async done => {
        return await new Promise(async () => {
            const userRegister = OrganizationUserEntityControllerHelpers.constructRegisterOrganizationUserEntity(email, password);

            const res = await OrganizationUserEntityControllerHelpers.userRegisterNewOrganizationEntity(userRegister);

            console.log(res);

            expect(res.successful).toBe(true);
            expect(res.response.data.status).toMatch(OrganizationUserStatus.PENDING_CONFIRMATION);
            expect(res.response.data).toHaveProperty('id');
            expect(res.response.data).toHaveProperty('firstname');
            expect(res.response.data).toHaveProperty('lastname');

            principal = res.response.data;
            done();
        });
    });

    test('Activate a new user by Id', async done => {
        return await new Promise(async () => {
            const res = await OrganizationUserEntityControllerHelpers.activateById(principal.id);

            expect(res.successful).toBe(true);
            expect(res.response.data.status).toMatch(OrganizationUserStatus.ACTIVE);

            done();
        });
    });

    test('Get the authenticated users profile', async done => {
        // Get the new schema
        const res = await OrganizationUserEntityControllerHelpers.userGerMyProfile(email, password);

        expect(res.successful).toBe(true);
        expect(res.response.data).toHaveProperty('id');
        expect(res.response.data).toHaveProperty('email');
        expect(res.response.data).toHaveProperty('roles');

        principal = res.response.data;

        done();
    });


    test('Create a new Admin role for the user to manage Tokens', async done => {
        const body = {
            name: "rbac.tokens",
            permissionType: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.TOKEN,
        };
        const res = await RBACControllerHelpers.createEntityAdminByPrincipal(email, password, body);

        expect(res.successful).toBe(true);
        done();
    }, 10000);

    test('Create a new Token', async done => {
        const body = {
            name: "Slack Token",
            description: 'Slack user token',
        };

        const res = await TokenControllerHelpers.create(email, password, body);

        expect(res.successful).toBe(true);
        token = res.response.data;
        done();
    });


    //
    // Cleanup tests
    //
    test('Delete a user by id', async done => {
        const res = await OrganizationUserEntityControllerHelpers.deleteById(email, password, principal.id);
        expect(res.successful).toBe(true);
        done();
    });


});

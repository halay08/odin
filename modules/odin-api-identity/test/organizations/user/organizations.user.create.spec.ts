import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { OrganizationUserEntityControllerHelpers } from "../../helpers/UserControllerHelpers";
import { OrganizationUserStatus } from "@d19n/models/dist/identity/organization/user/organization.user.status";
import { OrganizationUserCreate } from "@d19n/models/dist/identity/organization/user/organization.user.create";

describe('E2E OrganizationUserEntity Controller Integration Test', () => {

    let newUser: OrganizationUserEntity;

    const email = "testing122334@test.com";
    const password = "password122334";

    test('Create a new user', async done => {
        return await new Promise(async () => {

            const userCreate = new OrganizationUserCreate();
            userCreate.firstname = 'James';
            userCreate.lastname = 'Smith';
            userCreate.email = 'james1@test.com';
            userCreate.password = 'asdnmmasd';

            const res = await OrganizationUserEntityControllerHelpers.createUserByPrincipal('test@test.com', 'asdfasdf', userCreate);

            console.log(res);

            expect(res.successful).toBe(true);
            expect(res.response.data.status).toMatch(OrganizationUserStatus.ACTIVE);
            expect(res.response.data).toHaveProperty('id');
            expect(res.response.data).toHaveProperty('firstname');
            expect(res.response.data).toHaveProperty('lastname');

            newUser = res.response.data;
            console.log('newUser', newUser);
            done();
        });
    });

    test('As a principal user, I want to assign roles to the new user', async done => {

        done();

    });

});

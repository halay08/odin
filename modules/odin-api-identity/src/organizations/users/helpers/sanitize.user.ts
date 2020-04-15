import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';

export class SanitizeUser {

    protected sanitizeUser(user: OrganizationUserEntity) {
        delete user.password;
        return user;
    }

    protected sanitizeUsers(users: OrganizationUserEntity[]) {
        const sanitized = [];
        for(const user of users) {
            delete user.password;
            sanitized.push(user);
        }

        return sanitized;
    }

}

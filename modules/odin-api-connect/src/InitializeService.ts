import { Injectable } from '@nestjs/common';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";

@Injectable()
export class InitializeService {

    public initialize(principal: OrganizationUserEntity, jwtToken: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let initializeResults = [];
            return resolve('nothing to initialize');
        });
    }
}

import { InjectRepository }                             from "@nestjs/typeorm";
import { Injectable }                                   from "@nestjs/common";
import { OrganizationEntity }                           from "@d19n/models/dist/identity/organization/organization.entity";
import { OrganizationUserEntity }                       from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { OrganizationUserEntityLoginHistoryRepository } from "./organizations.users.authentication.login.history.repository";
import { OrganizationUserEntityLoginHistoryEntity }     from "./organizations.users.authentication.login.history.entity";

/**
 * Column options service layer.
 */
@Injectable()
export class OrganizationUserEntityLoginHistoryService {

    private readonly userLoginHistoryRepository: OrganizationUserEntityLoginHistoryRepository;

    public constructor(@InjectRepository(OrganizationUserEntityLoginHistoryRepository) userLoginHistoryRepository: OrganizationUserEntityLoginHistoryRepository) {
        this.userLoginHistoryRepository = userLoginHistoryRepository;
    }

    /**
     *
     * @param organization
     * @param user
     * @param activity
     * @param ipAddress
     */
    public async recordLoginEvent(
        organization: OrganizationEntity,
        user: OrganizationUserEntity,
        activity: string,
        ipAddress: string
    ): Promise<OrganizationUserEntityLoginHistoryEntity> {
        try {

            const event = new OrganizationUserEntityLoginHistoryEntity();
            event.organization = organization;
            event.user = user;
            event.activity = activity;
            event.ipAddress = ipAddress;

            return await this.userLoginHistoryRepository.save(event);

        } catch (e) {

            console.error(e);
        }
    }
}

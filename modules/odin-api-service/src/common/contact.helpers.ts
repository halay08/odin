import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { forwardRef, Inject } from '@nestjs/common';

export class ContactHelpers {
    private dbService: DbService;


    constructor(@Inject(forwardRef(() => DbService)) dbService: DbService) {
        this.dbService = dbService;
    }


    /**
     *
     * @param principal
     * @param contactId
     */
    public async getSipwiseContactIdentity(principal: OrganizationUserEntity, contactId: string) {
        const contact = await this.dbService.getDbRecordTransformedByOrganizationAndId(
            principal.organization,
            contactId,
            [ 'ContactIdentity' ],
        );

        const contactIdentity = contact['ContactIdentity'].dbRecords;
        const sipwiseIdentity = contactIdentity ? contactIdentity.find(elem => elem.title === 'SIPWISE') : undefined;

        return sipwiseIdentity;
    }
}

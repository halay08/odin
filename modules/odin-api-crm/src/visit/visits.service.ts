import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject } from '@nestjs/common';

export class VisitsService {

    private schemasService: SchemasService;
    private dbService: DbService;

    constructor(
        schemasService: SchemasService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
    }

    /**
     *
     * @param principal
     * @param body
     * @param headers
     */
    async createNewVisit(
        principal: OrganizationUserEntity,
        body: DbRecordCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes[]> {
        try {
            return await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ body ],
                { upsert: true },
            );
        } catch (e) {
            throw new ExceptionType(e.statusCode, e.message);
        }
    }
}

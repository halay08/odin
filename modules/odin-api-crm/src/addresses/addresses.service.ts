import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { PremisesService } from '../premise/premises.service';

@Injectable()
export class AddressesService {


    constructor(
        private readonly dbService: DbService,
        private readonly premisesService: PremisesService,
        private readonly amqpConnection: AmqpConnection,
    ) {

        this.dbService = dbService;
        this.premisesService = premisesService;
        this.amqpConnection = amqpConnection;

    }


    /**
     *
     * @param principal
     * @param addressId
     */
    public async enrichAddress(
        principal: OrganizationUserEntity,
        addressId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {

            const address = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                addressId,
            );

            const udprn = getProperty(address, 'UDPRN');
            const umprn = getProperty(address, 'UMPRN');

            // get the premise from ops premises

            const premise = await this.premisesService.getPremiseByUdprnAndUmprnAndOrganization(
                principal.organization,
                udprn,
                umprn,
            )

            console.log('premise', premise);

            const update = new DbRecordCreateUpdateDto();
            update.entity = address.entity;
            update.properties = {
                ExPolygonId: premise.ex_polygon_id,
                TargetReleaseDate: premise.target_release_date,
                BuildStatus: premise.build_status_name,
                SalesStatus: premise.status ? premise.status.toUpperCase() : getProperty(address, 'SalesStatus'),
                L4PolygonId: premise.l4_polygon_id,
                L2PolygonId: premise.l2_polygon_id,
                Classification: premise.ab_plus_class_1,
            }

            console.log('update', update)

            return await this.dbService.updateDbRecordsByPrincipalAndId(
                principal,
                address.id,
                update,
            );

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }
    }
}

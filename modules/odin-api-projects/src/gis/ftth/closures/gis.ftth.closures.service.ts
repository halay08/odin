import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { GisFtthFeaturesService } from '../gis.ftth.features.service';
import { FtthClosureConnection } from './interfaces/ftth.closure-connection.interface';

@Injectable()
export class GisFtthClosuresService {

    private readonly cosmosConnection: Connection;

    constructor(
        @InjectConnection('cosmosDatabase') cosmosConnection: Connection,
        private gisFtthFeaturesService: GisFtthFeaturesService,
        private dbRecordsService: DbRecordsService,
        private schemasService: SchemasService,
    ) {

        this.cosmosConnection = cosmosConnection;
        this.gisFtthFeaturesService = gisFtthFeaturesService;
        this.dbRecordsService = dbRecordsService;
        this.schemasService = schemasService;
    }


    /**
     *
     * @param closureId
     */
    public async getConnectionsByClosureId(
        principal: OrganizationUserEntity,
        closureId: number,
    ): Promise<FtthClosureConnection> {
        try {

            const data = await this.cosmosConnection
                .query(`
            SELECT cn.*,
           fb1.name AS a_fibre_name,
           fb2.name AS b_fibre_name,
           cbl1.id AS a_cable_id,
           cbl2.id AS b_cable_id,
           tb1.name AS a_tube_name,
           tb2.name AS b_tube_name,
           si1.name AS a_seal_interface_name,
           si2.name AS b_seal_interface_name,
           si1.is_loop AS a_seal_interface_is_loop,
           si2.is_loop AS b_seal_interface_is_loop,
           prt1.name AS a_port_name,
           prt2.name AS b_port_name,
           sm1.name AS a_seal_model_name,
           sm2.name AS b_seal_model_name,
           tr1.name AS a_tray_name,
           tr2.name AS b_tray_name,
           tr3.name AS conn_tray_name,
           tm1.name AS a_tray_model_name,
           tm2.name AS b_tray_model_name,
           tm3.name AS conn_tray_model_name,
           slt1.name AS a_slot_name,
           slt2.name AS b_slot_name,
           slt3.name AS conn_slot_name,
           slt1.side AS a_slot_side,
           slt2.side AS b_slot_side,
           slt3.side AS conn_slot_side,
           CASE
               WHEN cn.is_splice THEN 'Splice'
               WHEN cn.splitter_id IS NULL THEN ''
               ELSE sp.name
           END point_type
        FROM ftth.non_geom_connection cn
        LEFT JOIN ftth.fibre fb1 ON cn.a_fibre_id = fb1.id
        LEFT JOIN ftth.fibre fb2 ON cn.b_fibre_id = fb2.id
        LEFT JOIN ftth.cable cbl1 ON fb1.cable_id = cbl1.id
        LEFT JOIN ftth.cable cbl2 ON fb2.cable_id = cbl2.id
        LEFT JOIN ftth.tube tb1 ON fb1.tube_id = tb1.id
        LEFT JOIN ftth.tube tb2 ON fb2.tube_id = tb2.id
        LEFT JOIN ftth.seal_interface si1 ON cbl1.id = si1.cable_id
        AND si1.direction = 'In'
        LEFT JOIN ftth.seal_interface si2 ON cbl2.id = si2.cable_id
        AND si2.direction = 'Out'
        LEFT JOIN ftth.port prt1 ON si1.port_id = prt1.id
        LEFT JOIN ftth.port prt2 ON si2.port_id = prt2.id
        LEFT JOIN ftth.seal_model sm1 ON prt1.seal_model_id = sm1.id
        LEFT JOIN ftth.seal_model sm2 ON prt2.seal_model_id = sm2.id
        LEFT JOIN ftth.tray tr1 ON cn.a_fibre_tray_id = tr1.id
        LEFT JOIN ftth.tray tr2 ON cn.b_fibre_tray_id = tr2.id
        LEFT JOIN ftth.tray tr3 ON cn.tray_id = tr3.id
        LEFT JOIN ftth.tray_model tm1 ON tr1.model_id = tm1.id
        LEFT JOIN ftth.tray_model tm2 ON tr2.model_id = tm2.id
        LEFT JOIN ftth.tray_model tm3 ON tr3.model_id = tm3.id
        LEFT JOIN ftth.slot slt1 ON tr1.slot_id = slt1.id
        LEFT JOIN ftth.slot slt2 ON tr2.slot_id = slt2.id
        LEFT JOIN ftth.slot slt3 ON tr3.slot_id = slt3.id
        LEFT JOIN ftth.splitter sp ON cn.splitter_id = sp.id
        WHERE cn.closure_id = ${closureId}
        ORDER BY a_tray_name`);

            return data;

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);

        }
    }


    /**
     *
     * @param principal
     * @param closureId
     */
    async getAllCablesIntersectingClosure(
        principal: OrganizationUserEntity,
        closureId: number,
    ): Promise<DbRecordEntityTransform[]> {

        try {

            const data = await this.cosmosConnection.query(`
               select ftth.cable.id
               from ftth.cable, ftth.closure
               WHERE ST_Intersects(ftth.cable.geometry, ftth.closure.geometry)
               AND ftth.closure.id = ${closureId}
            `);

            // using the Ids returned from GIS we want to update or create odin features
            const created = await this.gisFtthFeaturesService.importManyFeaturesFromGis(
                principal,
                'CABLE',
                data.map(elem => elem.id),
            )

            const records = await this.dbRecordsService.getManyDbRecordsByIds(
                principal.organization,
                { recordIds: created.map(elem => elem.id) },
            );

            const schema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                'ProjectModule:Feature',
            );

            return records.map(elem => DbRecordEntityTransform.transform(elem, schema))

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);

        }

    }
}

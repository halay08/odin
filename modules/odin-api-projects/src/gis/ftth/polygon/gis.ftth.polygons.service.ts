import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { FeaturesService } from '../../../features/features.service';
import { CreateFtthPolygonDto } from './dto/create-ftth-polygon.dto';
import { UpdateFtthPolygonDto } from './dto/update-ftth-polygon.dto';
import { FtthPolygonDeleteRes } from './interfaces/ftth-polygon-delete-res.interface';
import { FtthPolygon } from './interfaces/ftth-polygon.interface';

@Injectable()
export class GisFtthPolygonsService {


    constructor(
        @InjectConnection('cosmosDatabase') private cosmosConnection: Connection,
        @InjectConnection('myahDatabase') private myahConnection: Connection,
        private featuresService: FeaturesService,
    ) {

        this.cosmosConnection = cosmosConnection;
        this.myahConnection = myahConnection;
        this.featuresService = featuresService;

    }

    /**
     *
     * @param principal
     * @param body
     */
    public async create(principal: OrganizationUserEntity, body: CreateFtthPolygonDto): Promise<FtthPolygon> {
        try {

            const data = await this.cosmosConnection
                .query(`
                INSERT INTO ftth.polygon (geometry, description)
                VALUES (ST_SetSRID(ST_MakePoint('${body.coordX}', '${body.coordY}'), 27700),  ${body.description ? `'${body.description}'` : null})
                RETURNING id`);

            return data[0];


        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param principal
     * @param body
     */
    public async updateById(
        principal: OrganizationUserEntity,
        polygonId: number,
        body: UpdateFtthPolygonDto,
    ): Promise<FtthPolygon> {

        try {

            await this.cosmosConnection
                .query(`
                UPDATE ftth.polygon SET build_status_id = ${body.buildStatusId}
                WHERE id = ${polygonId}
                `);

            return { id: polygonId };

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param blockageId
     */
    public async deleteById(principal: OrganizationUserEntity, polygonId: number): Promise<FtthPolygonDeleteRes> {
        try {

            const data = await this.cosmosConnection.query(`DELETE FROM ftth.polygon WHERE id = ${polygonId}`);


            return { affected: data[1] };

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }


    /**
     *
     * @param polygonId
     */
    public async getPolygonById(polygonId: number): Promise<FtthPolygon> {
        try {

            return await this.cosmosConnection.query(
                `SELECT
            ftth.polygon.id,
            ftth.polygon.geometry,
            ftth.build_status.name build_status_name,
            ftth.polygon.geometry,
            ftth.polygon.l4_closure_id,
            ftth.polygon.target_release_date
            FROM ftth.polygon
            LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
            WHERE ftth.polygon.id = ${polygonId}
            `);

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

}

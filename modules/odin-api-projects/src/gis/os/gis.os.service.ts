import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { chunkArray } from '../../helpers/utilities'


@Injectable()
export class GisOsService {
    private readonly cosmosConnection: Connection;
    private readonly myahConnection: Connection;

    constructor(
        @InjectConnection('myahDatabase') myahConnection: Connection,
        @InjectConnection('cosmosDatabase') cosmosConnection: Connection,
    ) {
        this.cosmosConnection = cosmosConnection
        this.myahConnection = myahConnection;
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async premisesPassed(principal: OrganizationUserEntity) {
        try {
            const buildDone = await this.cosmosConnection.query(
                `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('7-Build Done')
        `);
            const done = await this.cosmosConnection.query(
                `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('8-Done')
        `);
            const buildDoneTotal = await this.getTotalPremisesByGeoms(buildDone);
            const doneTotal = await this.getTotalPremisesByGeoms(done);
            return {
                totalPremises: buildDoneTotal + doneTotal,
                buildDoneTotal,
                doneTotal,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async getPremisesByPolygonId(principal: OrganizationUserEntity, polygonId: string) {
        try {
            const records = await this.cosmosConnection.query(
                `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.id = ${polygonId}
        `);

            const premises = await this.getTotalPremisesByGeoms(records);

            return {
                premises,
            };
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

    /**
     *
     * @param records
     * @private
     */
    private async getTotalPremisesByGeoms(records: any[]): Promise<number> {
        const chunkedArray = chunkArray(records, 100);
        let totalPremises = 0;
        for(let i = 0; i < chunkedArray.length; i++) {
            const elem = chunkedArray[i];
            const polygonGeoms = elem.map(poly => `${poly.geometry}`);
            let query = '';
            for(let i = 0; i < polygonGeoms.length; i++) {
                if(i === 0) {
                    query = `SELECT os.ab_plus.udprn FROM os.ab_plus WHERE St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`
                } else {
                    query = query.concat(` OR St_Intersects(os.ab_plus.geom, '${polygonGeoms[i]}')`);
                }
            }
            const premises = await this.myahConnection.query(query);
            totalPremises += premises.length;
        }
        return totalPremises;
    }

    /**
     *
     * @param geometry
     */
    public async getPremisesFormattedByGeom(geometry: string) {
        try {
            return await this.myahConnection.query(
                `SELECT *
                FROM os.ab_plus
                WHERE St_Intersects(os.ab_plus.geom, '${geometry}')
                `);
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }


}

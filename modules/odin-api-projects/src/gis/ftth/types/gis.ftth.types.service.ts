import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { FeaturesService } from '../../../features/features.service';
import { FtthTypeDto } from './dto/ftth-type.dto';
import { FtthTypeDeleteRes } from './interfaces/ftth.cable.delete.res.interface';
import { FtthType } from './interfaces/ftth.type.interface';

@Injectable()
export class GisFtthTypesService {

    private readonly featuresService: FeaturesService;
    private readonly cosmosConnection: Connection;

    constructor(
        @InjectConnection('cosmosDatabase') cosmosConnection: Connection,
        featuresService: FeaturesService,
    ) {

        this.cosmosConnection = cosmosConnection;
        this.featuresService = featuresService;

    }

    /**
     *
     * @param principal
     * @param body
     */
    public async create(principal: OrganizationUserEntity, featureName: string, body: FtthTypeDto): Promise<FtthType> {
        try {

            const data = await this.cosmosConnection
                .query(`
                INSERT INTO ftth.${featureName}_type (name)
                VALUES ('${body.name}')
                RETURNING id, name`);

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
        featureName: string,
        body: FtthTypeDto,
    ): Promise<FtthType> {

        try {

            const data = await this.cosmosConnection
                .query(`
                UPDATE ftth.${featureName}_type
                SET
                    name = ${body.name}
                WHERE odin_option_id = ${body.columnOptionId}
                RETURNING id, name
                `);

            return { id: data[0].id };

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
    public async deleteById(
        principal: OrganizationUserEntity,
        featureName: string,
        body: FtthTypeDto,
    ): Promise<FtthTypeDeleteRes> {
        try {

            const existingType = await this.cosmosConnection.query(`SELECT id FROM ftth.${featureName}_type WHERE name = '${body.name}'`);
            console.log('existingType', existingType);

            if(existingType[0]) {

                const usageCount = await this.cosmosConnection.query(`SELECT count(id) FROM ftth.${featureName}_type WHERE id = ${existingType[0].id}`);
                console.log('usageCount', usageCount);

                // const data = await this.cosmosConnection.query(`DELETE FROM ftth.${featureName}_type WHERE name =
                // '${body.name}'`);

                // return { affected: data[1] };

                return { affected: usageCount[0].count }
            }

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }
    }

}

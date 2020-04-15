import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm/index';
import { QueryCreateUpdateDto } from './queries.create.update.dto';
import { QueryEntity } from './queries.entity';
import { IRecordQuery } from './types/queries.standard.interface';

@Injectable()
export class QueriesService {

    private readonly connection: Connection;

    constructor(@InjectConnection('odinDb') connection: Connection) {
        this.connection = connection;
    }

    /**
     *
     * @param principal
     * @param body
     */
    public async saveQueryByPrincipal(principal: OrganizationUserEntity, body: QueryCreateUpdateDto) {

        const existingQuery = await this.connection.manager.findOne(QueryEntity, { where: { name: body.name } });

        if(existingQuery) {
            throw new ExceptionType(409, 'a query with that name already exists');
        }

        const query = new QueryEntity();
        query.organization = principal.organization.id;
        query.user = principal.id;
        query.name = body.name;
        query.type = body.type;
        query.params = body.params;
        query.description = body.description;
        query.query = body.query;

        return await this.connection.manager.save(query);
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async getQueryByPrincipalAndName(principal: OrganizationUserEntity, query: { [key: string]: any }) {
        return await this.connection.query(`SELECT * FROM queries WHERE name = '${query.name}'`);
    }

    /**
     *
     * @param principal
     * @param query
     */
    public async runQueryByPrincipalAndName(principal: OrganizationUserEntity, query: IRecordQuery) {
        try {
            const sqlQuery = await this.connection.query(`SELECT * FROM queries WHERE name = '${query.name}'`);
            console.log('sqlQuery', sqlQuery);
            console.log('Query', query);

            if(sqlQuery[0] && sqlQuery[0].params && sqlQuery[0].type === 'SQL') {

                let queryString = sqlQuery[0].query;
                for(const key of Object.keys(sqlQuery[0].params)) {
                    console.log('key', key);
                    console.log('query[key]', query[key]);
                    queryString = queryString.replace(`{${key}}`, `'${query[key]}'`);
                }
                console.log('query', queryString);
                // Handle queries with params
                return await this.connection.query(queryString);

            } else if(sqlQuery[0] && sqlQuery[0].type === 'SQL') {

                console.log('sqlQuery', sqlQuery[0].query);
                return await this.connection.query(sqlQuery[0].query);
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param queryId
     * @param body
     */
    public async updateQueryByPrincipalAndName(
        principal: OrganizationUserEntity,
        queryId: string,
        body: QueryCreateUpdateDto,
    ) {
        console.log('UPDATE THE RECORD', body);
        const existingQuery = await this.connection.manager.findOne(QueryEntity, { where: { id: queryId } });
        existingQuery.name = body.name;
        existingQuery.description = body.description;
        existingQuery.params = body.params;
        existingQuery.query = body.query;

        return await this.connection.manager.save(existingQuery);
    }

    /**
     *
     * @param principal
     * @param queryId
     */
    public async deleteByPrincipalAndId(principal: OrganizationUserEntity, queryId: string) {
        return await this.connection.manager.delete(QueryEntity, { id: queryId });
    }
}

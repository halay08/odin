import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';
import { REDIS_CLIENT } from '../../utilities/Constants';
import { OrganizationsAppsRepository } from './organizations.apps.repository';

@Injectable()
export class OrganizationsAppsService {

    private readonly connectedAppRepository: OrganizationsAppsRepository;

    public constructor(
        @InjectRepository(OrganizationsAppsRepository) connectedAppRepository: OrganizationsAppsRepository,
        @Inject(REDIS_CLIENT) private readonly redisClient: any,
    ) {
        this.redisClient = redisClient;
        this.connectedAppRepository = connectedAppRepository;
    }

    /**
     *
     * @param organization
     */
    public listByOrganizationEntity(organization: OrganizationEntity): Promise<OrganizationAppEntity[]> {
        console.log('listByOrganizationEntity');
        return new Promise(async (resolve, reject) => {
            try {
                // find the connected app
                const connectedApps = await this.connectedAppRepository.find({
                    where: { organization },
                });
                return resolve(connectedApps);
            } catch (e) {
                console.error(e);
            }
        });
    }

    /**
     *
     * @param principal
     * @param name
     */
    public async getByOrganizationAppName(
        organization: OrganizationEntity,
        appName: string,
    ): Promise<OrganizationAppEntity> {
        try {
            // find the user
            const connectedApp = await this.connectedAppRepository.findOne({
                where: { organization: organization, name: appName },
            });

            return connectedApp;
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }


    /**
     *
     * @param organization
     * @param appId
     */
    public getByOrganizationAndId(
        organization: OrganizationEntity,
        appId: string,
    ): Promise<OrganizationAppEntity> {
        return new Promise(async (resolve, reject) => {

            const cacheKey = `connected_app_${appId}`;

            this.redisClient.get(cacheKey, async (err, reply) => {
                // error retrieving cached values
                if(err) {
                    return reject(new ExceptionType(500, err.message));
                }
                // return cached values
                if(reply) {
                    const parsed = JSON.parse(reply);
                    return resolve(parsed);
                }
                // find the connected app
                const connectedApp = await this.connectedAppRepository.findOne({
                    where: { id: appId },
                });
                if(!connectedApp) {
                    return reject(new ExceptionType(404, 'could not locate connected app'));
                }
                // only cache the user if they have roles
                if(connectedApp) {
                    await this.redisClient.set(cacheKey, JSON.stringify(connectedApp), 'EX', 10, (
                        err,
                        res,
                    ) => {
                        if(err) {
                            return reject(new ExceptionType(500, err.message));
                        }

                        return resolve(connectedApp);
                    });
                } else {
                    return resolve(connectedApp);
                }
            });
        });
    }

    /**
     * Create a new api token.
     *
     * @param {OrganizationUserEntity} principal
     * @param tokenCreate
     *
     * @return {Promise<ConnectedApp>}
     */
    public async create(
        principal: OrganizationUserEntity,
        tokenCreate: OrganizationAppEntity,
    ): Promise<OrganizationAppEntity> {
        try {
            const appCreate = new OrganizationAppEntity();

            appCreate.organization = principal.organization;
            appCreate.name = tokenCreate.name;
            appCreate.baseUrl = tokenCreate.baseUrl;
            appCreate.apiKey = tokenCreate.apiKey;
            appCreate.refreshToken = tokenCreate.refreshToken;

            const connectedApp: OrganizationAppEntity = await this.connectedAppRepository.save(appCreate);

            return connectedApp;

        } catch (e) {

            console.error(e);
            throw new ExceptionType(500, e.message);

        }

    }

    /**
     * update the app
     *
     * @param principal
     * @param appId
     * @param connectedApp
     */
    public async update(
        principal: OrganizationUserEntity,
        appId: string,
        body: OrganizationAppEntity,
    ): Promise<OrganizationAppEntity> {
        try {
            // find the connected app
            const appRecord = await this.connectedAppRepository.findOne({ where: { id: appId } });
            // change the values of the connected app
            appRecord.name = body.name;
            appRecord.baseUrl = body.baseUrl;
            appRecord.apiKey = body.apiKey;
            // save new values of the connected app
            const connectedApp: OrganizationAppEntity = await this.connectedAppRepository.save(appRecord);
            // return the connected app
            return connectedApp;
        } catch (e) {
            // return error if wrong id is sent
            throw new ExceptionType(
                404,
                'could not locate any App with that id',
            );
        }
    }

    /**
     * Delete an api token by it's id and owning organization.
     *
     * @param {string} id
     * @param {OrganizationEntity} organization
     *
     * @return {Promise<boolean>}
     */
    public async deleteByIdAndOrganizationEntity(
        principal: OrganizationUserEntity,
        id: string,
    ): Promise<DeleteResult> {
        try {
            const res: DeleteResult = await this.connectedAppRepository.delete({
                id,
                organization: principal.organization,
            });

            return res;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message);
        }

    }

    /**
     * Search across all api tokens.
     *
     * @param {OrganizationEntity} organization
     *
     * @return {Promise<Array<ConnectedApp>>}
     */
    public search(organization: OrganizationEntity): Promise<OrganizationAppEntity[]> {

        return this.connectedAppRepository.find({ where: { organization } });

    }

}

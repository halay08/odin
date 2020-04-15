import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserTokenCreate } from '@d19n/models/dist/identity/organization/user/token/organization.user.token.create';
import { OrganizationUserTokenEntity } from '@d19n/models/dist/identity/organization/user/token/organization.user.token.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { DeleteResult } from 'typeorm';
import { OrganizationsUsersTokensRepository } from './organizations.users.tokens.repository';

@Injectable()
export class OrganizationsUsersTokensService {

    public constructor(@InjectRepository(OrganizationsUsersTokensRepository) private readonly tokenRepository: OrganizationsUsersTokensRepository) {

    }

    /**
     *
     * @param token
     */
    public getByToken(token: string): Promise<OrganizationUserTokenEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const entity = await this.tokenRepository.findOne({
                    where: { token },
                });
                if(entity) {
                    return resolve(entity);
                } else {
                    return reject(new ExceptionType(404, 'not found'));
                }
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     *
     * @param tokenId
     */
    public getTokenById(tokenId: string): Promise<OrganizationUserTokenEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const entity = await this.tokenRepository.findOne({
                    where: { id: tokenId },
                });
                if(entity) {
                    return resolve(entity);
                } else {
                    return reject(new ExceptionType(404, 'not found'));
                }
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Create a new api token.
     *
     * @param {OrganizationUserEntity} principal
     * @param tokenCreate
     *
     */
    public async create(
        principal: OrganizationUserEntity,
        tokenCreate: OrganizationUserTokenCreate,
    ): Promise<OrganizationUserTokenEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const jwtToken = jwt.sign({ id: principal.id }, process.env.JWT_TOKEN_SECRET);
                const decoded = jwt.verify(jwtToken, process.env.JWT_TOKEN_SECRET);

                const token = new OrganizationUserTokenEntity();

                token.organization = principal.organization;
                token.user = principal;
                token.token = jwtToken;
                token.name = tokenCreate.name;
                token.description = tokenCreate.description;

                await this.tokenRepository.save(token);

                return resolve(this.getByToken(token.token));
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Delete an api token by it's id and owning organization.
     *
     * @param {string} id
     * @param {OrganizationEntity} organization
     *
     */
    public async deleteByIdAndOrganizationEntity(
        id: string,
        organization: OrganizationEntity,
    ): Promise<{ affected: number }> {
        return new Promise(async (resolve, reject) => {
            try {
                const deleteResult: DeleteResult = await this.tokenRepository.delete({ id, organization });
                return resolve({ affected: deleteResult.affected });
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     * Search across all api tokens.
     *
     * @param {OrganizationEntity} organization
     *
     * @return {Promise<Array<Token>>}
     */
    public search(organization: OrganizationEntity): Promise<OrganizationUserTokenEntity[]> {
        return this.tokenRepository.find({ where: { organization } });
    }

}

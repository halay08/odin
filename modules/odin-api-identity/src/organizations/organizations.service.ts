import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { DeleteResult } from "typeorm";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { OrganizationEntityRepository } from "./organizations.repository";

@Injectable()
export class OrganizationEntitysService {

  private readonly organizationRepository: OrganizationEntityRepository;

  public constructor(@InjectRepository(OrganizationEntityRepository) organizationRepository: OrganizationEntityRepository) {
    this.organizationRepository = organizationRepository;
  }

  /**
   * Retrieve an organization by it's name.
   *
   * @param {string} name
   * @returns {Promise<OrganizationEntity>}
   *
   * @throws {NotFoundException} Thrown if no name could be found.
   */
  public async getByName(name: string): Promise<OrganizationEntity> {
    const organization = await this.organizationRepository.getByName(name);

    if(!organization) {
      throw new NotFoundException('could not locate organization');
    } else {
      return organization;
    }
  }

  /**
   * Create a new organization.
   *
   * @param {OrganizationEntity} organization
   * @returns {Promise<OrganizationEntity>}
   *
   */
  public async create(organization: OrganizationEntity): Promise<OrganizationEntity> {
    let existing: OrganizationEntity;

    try {
      existing = await this.getByName(organization.name);
    } catch (e) {
      return this.organizationRepository.save(organization);
    }

    if(existing) {
      throw new ConflictException('organization by this name already exists');
    } else {
      return this.organizationRepository.save(organization);
    }
  }

  /**
   * Delete schema by id and owning organization.
   *
   * @param principal
   * @param organizationId
   *
   */
  public deleteByPrincipalAndId(
    principal: OrganizationUserEntity,
    organizationId: string,
  ): Promise<{ affected: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const deleteResult: DeleteResult = await this.organizationRepository.delete({
          id: organizationId,
        });
        // Log event
        // await this.logsUserActivityService.recordRemoveEvent(principal, schemaId, {
        //     id: schemaId,
        //     affected: deleteResult.affected
        // }, LogsConstants.SCHEMA_DELETED);

        return resolve({ affected: deleteResult.affected });
      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    });
  }

    /**
     * Retrieve a specific organization based on the id.
     * @param principal
     * @param organizationId
     */
    public async getOrganizationByPrincipalAndId(
        principal: OrganizationUserEntity,
        organizationId: string,
    ): Promise<OrganizationEntity> {
        try {
            const res = await this.organizationRepository.findOne({
                where: { id: organizationId },
            });
            return res;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Update a organization.
     * @param principal
     * @param organizationId
     * @param body
     */
    public async updateOrganizationByPrincipalAndId(
        principal: OrganizationUserEntity,
        organizationId: string,
        body: OrganizationEntity,
    ): Promise<OrganizationEntity> {
        try {
            const organizationRecord = await this.getOrganizationByPrincipalAndId(principal, organizationId);
            organizationRecord.name = body.name;
            organizationRecord.billingReplyToEmail = !!body.billingReplyToEmail ? body.billingReplyToEmail.trim().toLowerCase() : organizationRecord.billingReplyToEmail;
            organizationRecord.customerServiceReplyToEmail = !!body.customerServiceReplyToEmail ? body.customerServiceReplyToEmail.trim().toLowerCase() : organizationRecord.customerServiceReplyToEmail;
            organizationRecord.webUrl = !!body.webUrl ? body.webUrl.trim().toLowerCase() : organizationRecord.webUrl;

            const res = await this.organizationRepository.save(organizationRecord);

            return organizationRecord;
        } catch (e) {
            throw new ExceptionType(
                404,
                'could not locate organization with that id',
            );
        }
    }

}

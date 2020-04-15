import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplatesEmailCreateDto } from './templates.email.create.dto';
import { TemplatesEmailEntity } from './templates.email.entity';
import { TemplatesEmailRepository } from './templates.email.repository';

export class TemplatesEmailService {

    public constructor(@InjectRepository(TemplatesEmailRepository) private readonly templatesEmailRepository: TemplatesEmailRepository) {

    }


    /**
     *
     * @param organization
     * @param headers
     */
    public async listTemplatesByOrganization(
        organization: OrganizationEntity,
        headers: any,
    ): Promise<TemplatesEmailEntity[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.templatesEmailRepository.find({ organization });

                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    /**
     *
     * @param organization
     * @param headers
     */
    public async getTemplateByOrganizationAndLabel(
        organization: OrganizationEntity,
        label: string,
    ): Promise<TemplatesEmailEntity> {
        try {
            const res = await this.templatesEmailRepository.findOne({
                organization,
                label,
            });

            return res;
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     *
     * @param principal
     * @param body
     * @param headers
     */
    public async createTemplateByPrincipal(
        principal: OrganizationUserEntity,
        body: TemplatesEmailCreateDto,
        headers: any,
    ): Promise<TemplatesEmailEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const template = new TemplatesEmailEntity();

                template.organization = principal.organization;
                template.name = body.name;
                template.label = body.label;
                template.description = body.description;
                template.service = body.service;
                template.templateId = body.templateId;
                template.dynamicTemplateData = body.dynamicTemplateData;

                const res = await this.templatesEmailRepository.save(template);

                return resolve(res);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }
}

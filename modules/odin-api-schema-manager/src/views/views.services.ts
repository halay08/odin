import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { ViewsCreateUpdateDto } from '@d19n/models/dist/schema-manager/views/dto/views.create.update.dto';
import { ViewEntity } from '@d19n/models/dist/schema-manager/views/view.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pascalCase } from 'change-case';
import { DeleteResult } from 'typeorm';
import { ViewsRepository } from './views.repository';

@Injectable()
export class ViewsService {

  private readonly viewsRepository: ViewsRepository;

  constructor(
    @InjectRepository(ViewsRepository) viewsRepository: ViewsRepository,
  ) {
    this.viewsRepository = viewsRepository;
  }

  /**
   * Create a new view
   * @param principal
   * @param body
   */
  public async createView(principal: OrganizationUserEntity, body: ViewsCreateUpdateDto) {
    try {
      // find by user / entity
      const existingView = await this.viewsRepository.findOne({ where: { userId: principal.id, key: body.key } });
      // if exists update
      if(existingView) {

        existingView.view = body.view;
        existingView.title = body.title || pascalCase(`${principal.firstname}${body.key}`);
        existingView.key = body.key;

        return await this.viewsRepository.save(existingView);
      } else {
        // else create
        const newView = new ViewEntity();
        newView.organization = principal.organization;
        newView.userId = principal.id;
        newView.title = body.title;
        newView.key = body.key ? pascalCase(body.key.replace(
          ' ',
          '',
        )) : pascalCase(`${principal.firstname}${body.key}`);
        newView.moduleName = body.moduleName;
        newView.entityName = body.entityName;
        newView.view = body.view;

        return await this.viewsRepository.save(newView);
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }

  /**
   *
   * @param principal
   * @param key
   */
  public async getViewByKey(principal: OrganizationUserEntity, key: string): Promise<ViewEntity> {
    try {

      return await this.viewsRepository.findOne({
        where: {
          organization: principal.organization,
          key: key,
        },
      });

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);

    }
  }

  /**
   *
   * @param principal
   * @param moduleName
   * @param entityName
   */
  public async listViewsByUserAndModuleAndEntity(
    principal: OrganizationUserEntity,
    moduleName: string,
    entityName: string,
  ): Promise<ViewEntity[]> {

    try {

      return await this.viewsRepository.find({
        where: {
          userId: principal.id,
          moduleName,
          entityName,
        },
      });

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }

  }

  /**
   * A user can only delete their views
   * @param principal
   * @param viewId
   */
  public async deleteViewById(principal: OrganizationUserEntity, viewId: string): Promise<DeleteResult> {

    try {
      return await this.viewsRepository.delete({ id: viewId, userId: principal.id });

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message);
    }
  }
}

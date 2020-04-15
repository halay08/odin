import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { LogsUserActivityEntity } from '@d19n/models/dist/logs/user-activity/logs.user.activity.entity';
import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { Client } from '@elastic/elasticsearch';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import chalk from 'chalk';
import { ELASTIC_SEARCH_LOGS_CLIENT } from '../../common/Constants';
import { ElasticSearchClient } from '../../common/ElasticSearchClient';
import { LogsUserActivityRepository } from './logs.user.activity.repository';
import { DbRecordsService } from '../../db/records/db.records.service';
import { PipelineEntitysStagesService } from '../../pipelines/stages/pipelines.stages.service';


@Injectable()
export class LogsUserActivityService {

  private readonly elasticSearchClient: ElasticSearchClient;
  private readonly logsUserActivityRepository: LogsUserActivityRepository;

  public constructor(
    @InjectRepository(LogsUserActivityRepository) logsUserActivityRepository: LogsUserActivityRepository,
    @Inject(ELASTIC_SEARCH_LOGS_CLIENT) public readonly client: Client,
    @Inject(forwardRef(() => DbRecordsService)) private dbRecordsService: DbRecordsService,
    @Inject(forwardRef(() => PipelineEntitysStagesService)) private pipelineEntitysStagesService: PipelineEntitysStagesService,
    
  ) {
    this.elasticSearchClient = new ElasticSearchClient(client);
    this.logsUserActivityRepository = logsUserActivityRepository;
  }


  /**
   *
   * @param principal
   * @param query
   */
  public async searchByPrincipal(
    principal: OrganizationUserEntity,
    query: SearchQueryTypeHttp,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        query.schemas = 'logs_user_activity';
        const defaultOperator = 'AND';
        const results = await this.elasticSearchClient.search(principal,query, 'logs_user_activity', true);

        return resolve(results);
      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    });
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param body
   * @param type
   */
  public async createByPrincipal(
    principal: OrganizationUserEntity,
    recordId: string,
    body: any,
    type: LogsConstants,
  ): Promise<LogsUserActivityEntity> {
    try {
      const event = new LogsUserActivityEntity();
      event.recordId = recordId;
      event.revision = body;
      event.type = type;
      event.userId = principal.id;
      event.userName = `${principal.firstname} ${principal.lastname}`;
      event.organizationId = principal.organization.id;
      event.ipAddress = !!principal.headers ? principal.headers['x-forwarded-for'] || principal.headers['x-real-ip'] || '0.0.0.0' : '0.0.0.0';
      event.userAgent = !!principal.headers && principal.headers['user-agent'] ? principal.headers['user-agent'] : 'none';

      const res = await this.logsUserActivityRepository.save(event);

      const idFields=[ 
        'stageId', 
        'childRecordId', 'parentRecordId' ]
      const associations=[]
      for(let i = 0; i <idFields.length;i++) {
        const field = idFields[i]
        if(body[field]){
          let record
          if(field === 'stageId'){
            record = await this.pipelineEntitysStagesService.getPipelineStageByOrganizationAndId(principal.organization, body[field])
          } else {
            record = await this.dbRecordsService.getDbRecordById(principal.organization, body[field]);
          }
          
          associations.push(record)
        }
      }
      const evenWithAssociations={
        ...event,
        associations
      }
      
      this.elasticSearchClient.sync(evenWithAssociations, res.id, 'logs_user_activity').catch(e => {
        console.log(chalk.redBright(e));
      });

      return res;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param body
   * @param type
   */
  public async batchCreate(
    principal: OrganizationUserEntity,
    items: { recordId: string, revision: any }[],
    type: LogsConstants,
  ): Promise<LogsUserActivityEntity[]> {
    try {

      const newEvents = [];

      for(const item of items) {
        const event = new LogsUserActivityEntity();
        event.recordId = item.recordId;
        event.revision = item.revision;
        event.type = type;
        event.userId = principal.id;
        event.userName = `${principal.firstname} ${principal.lastname}`;
        event.organizationId = principal.organization.id;
        event.ipAddress = !!principal.headers ? principal.headers['x-forwarded-for'] || principal.headers['x-real-ip'] || '0.0.0.0' : '0.0.0.0';
        event.userAgent = !!principal.headers && principal.headers['user-agent'] ? principal.headers['user-agent'] : 'none';

        newEvents.push(event);
      }

      const response = await this.logsUserActivityRepository.save(newEvents, { chunk: 10 });

      for(const res of response) {
        this.elasticSearchClient.sync(res, res.id, 'logs_user_activity').catch(e => {
          console.log(chalk.redBright(e));
        });
      }

      return response;
    } catch (e) {
      console.error(e);
    }
  }

}

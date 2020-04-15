import { Inject, Injectable } from "@nestjs/common";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { ELASTIC_SEARCH_LOGS_CLIENT } from "../../common/Constants";
import { Client } from '@elastic/elasticsearch';
import { ElasticSearchClient } from "../../common/ElasticSearchClient";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { SearchQueryTypeHttp } from "@d19n/models/dist/search/search.query.type.http";


@Injectable()
export class LogsUserActivityService {

    private readonly elasticSearchClient: ElasticSearchClient;

    // private readonly logsUserActivityRepository: LogsUserActivityRepository;

    public constructor(
        // @InjectRepository(LogsUserActivityRepository) logsUserActivityRepository: LogsUserActivityRepository,
        @Inject(ELASTIC_SEARCH_LOGS_CLIENT) public readonly client: Client,
    ) {
        this.elasticSearchClient = new ElasticSearchClient(client);
        // this.logsUserActivityRepository = logsUserActivityRepository;
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
                const results = await this.elasticSearchClient.search(query, 'logs_user_activity', true);

                return resolve(results);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }

    // /**
    //  *
    //  * @param principal
    //  * @param request
    //  * @param body
    //  */
    // public async createByPrincipal(
    //     principal: OrganizationUserEntity,
    //     request: any,
    //     body: LogsUserActivityCreateDto,
    // ): Promise<LogsUserActivityEntity> {
    //
    //     console.log('request', request.headers);
    //     console.log('request', request.connection.remoteAddress);
    //
    //     const event = new LogsUserActivityEntity();
    //     event.recordId = body.recordId;
    //     event.revision = body.revision;
    //     event.type = body.type;
    //     event.userId = principal.id;
    //     event.userName = `${principal.firstname} ${principal.lastname}`;
    //     event.organizationId = principal.organization.id;
    //     event.ipAddress = request.headers['x-forwarded-for'] || request.headers['x-real-ip'] ||
    // request.connection.remoteAddress; event.userAgent = request.headers['user-agent'];  const res = await
    // this.logsUserActivityRepository.save(event);  this.elasticSearchClient.sync(event, res.id,
    // 'logs_user_activity').catch(e => { console.log(chalk.redBright(e)); });  return res; }

}

import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MilestonesService } from '../milestones/milestones.service';
import { ProgramsService } from '../programs/programs.service';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from '../tasks/tasks.service';


@Injectable()
export class ControllerInterceptor implements NestInterceptor {

    constructor(
        private readonly programsService: ProgramsService,
        private readonly projectsService: ProjectsService,
        private readonly milestonesService: MilestonesService,
        private readonly tasksService: TasksService,
    ) {
        this.programsService = programsService;
        this.projectsService = projectsService;
        this.milestonesService = milestonesService;
        this.tasksService = tasksService;
    }

    /**
     *
     * @param context
     * @param next
     */
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        if(request.path) {
            const requestMethod: string = request.method;
            const requestParams: { [key: string]: any } = request.params;
            const requestBody: any = request.body;

            const principal: OrganizationUserEntity = request.principal;
            const isChangingStage: boolean = requestBody.hasOwnProperty('stageId') && !!requestBody.stageId;
            // Add custom logic to be executed before sending the response to the user
            // Validation checks before making any requests
            if(requestMethod === 'PUT') {

                if(requestParams['entityName'] === SchemaModuleEntityTypeEnums.PROGRAM) {
                    await this.programsService.validateAgainstRules(
                        principal,
                        requestParams.recordId,
                        requestBody,
                    );
                }

                if(requestParams['entityName'] === SchemaModuleEntityTypeEnums.PROJECT) {
                    await this.projectsService.validateAgainstRules(
                        principal,
                        requestParams.recordId,
                        requestBody,
                    );
                }

                if(requestParams['entityName'] === SchemaModuleEntityTypeEnums.MILESTONE) {
                    await this.milestonesService.validateAgainstRules(
                        principal,
                        requestParams.recordId,
                        requestBody,
                    );
                }

                if(requestParams['entityName'] === SchemaModuleEntityTypeEnums.TASK) {
                    await this.tasksService.validateAgainstRules(
                        principal,
                        requestParams.recordId,
                        requestBody,
                    );
                }
            }


            return next
                .handle()
                .pipe(
                    map(async res => {
                            if(res) {
                                return new ApiResponseType<any>(
                                    request.res.statusCode,
                                    res.message,
                                    res,
                                )
                            } else {
                                throw new ExceptionType(500, 'no response ');
                            }
                        },
                    ))
        } else {
            // for Rabbitmq RPC calls via rabbitmq
            return next
                .handle()
                .pipe(
                    map(async res => {
                            // rabbitmq subscribers will have no response
                            if(res) {
                                return new ApiResponseType<any>(
                                    res ? res.statusCode : 200,
                                    res.message,
                                    res.data,
                                )
                            }
                            return res;
                        },
                    ));
        }
    }
}


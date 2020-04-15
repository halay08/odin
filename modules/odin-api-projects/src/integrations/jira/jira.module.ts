import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import { JiraIssuesService } from './issues/jira.issues.service';

@Module({
    imports: [
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [],
    providers: [
        JiraIssuesService,
    ],
    exports: [
        JiraIssuesService,
    ],
})

export class JiraModule {
}

import * as dotenv from "dotenv";
import { Module } from "@nestjs/common";
import { Client } from "@elastic/elasticsearch";
import { ELASTIC_SEARCH_LOGS_CLIENT } from "../../common/Constants";
import { LogsUserActivityService } from "./logs.user.activity.service";
import { LogsUserActivityController } from "./logs.user.activity.controller";


dotenv.config();

const elasticSearchProvider = {
    provide: ELASTIC_SEARCH_LOGS_CLIENT,
    useFactory: async () => {
        const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
        return client;
    },
};


@Module({
    imports: [
        // TypeOrmModule.forFeature([
        //     LogsUserActivityRepository,
        // ]),
    ],
    controllers: [
        LogsUserActivityController,
    ],
    providers: [
        LogsUserActivityService,
        elasticSearchProvider,
    ],
    exports: [
        LogsUserActivityService,
    ],
})

export class LogsUserActivityModule {
}

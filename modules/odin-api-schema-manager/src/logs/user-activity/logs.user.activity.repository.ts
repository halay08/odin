import { EntityRepository, Repository } from 'typeorm';
import { LogsUserActivityEntity } from "@d19n/models/dist/logs/user-activity/logs.user.activity.entity";

@EntityRepository(LogsUserActivityEntity)
export class LogsUserActivityRepository extends Repository<LogsUserActivityEntity> {

}

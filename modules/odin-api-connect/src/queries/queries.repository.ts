import { EntityRepository, Repository } from 'typeorm';
import { QueryEntity } from './queries.entity';

@EntityRepository(QueryEntity)
export class QueriesRepository extends Repository<QueryEntity> {

}

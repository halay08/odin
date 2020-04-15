import { ViewEntity } from '@d19n/models/dist/schema-manager/views/view.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ViewEntity)
export class ViewsRepository extends Repository<ViewEntity> {

}

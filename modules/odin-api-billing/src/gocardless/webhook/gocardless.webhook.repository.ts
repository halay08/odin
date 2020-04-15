import { EntityRepository, Repository } from 'typeorm';
import { GocardlessEventEntity } from "./events/types/gocardless.event.entity";

@EntityRepository(GocardlessEventEntity)
export class GocardlessWebhookRepository extends Repository<GocardlessEventEntity> {

}

import { EntityRepository, Repository } from 'typeorm';
import { GocardlessEventEntity} from "../webhook/events/types/gocardless.event.entity";

@EntityRepository(GocardlessEventEntity)
export class GoCardlessEventsRepository extends Repository<GocardlessEventEntity> {

}

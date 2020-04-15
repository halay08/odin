import { EntityRepository, Repository } from 'typeorm';
import { SendgridMailEventEntity } from "./types/sendgrid.mail.event.entity";

@EntityRepository(SendgridMailEventEntity)
export class SendgridRepository extends Repository<SendgridMailEventEntity> {

}

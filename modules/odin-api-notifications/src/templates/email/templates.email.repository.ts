import { TemplatesEmailEntity } from "./templates.email.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(TemplatesEmailEntity)
export class TemplatesEmailRepository extends Repository<TemplatesEmailEntity> {}

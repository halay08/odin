import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GocardlessWebhookRepository} from "../webhook/gocardless.webhook.repository";

@Injectable()
export class EventsService {
    private eventsRepository: GocardlessWebhookRepository;
    constructor(@InjectRepository(GocardlessWebhookRepository) eventsRepository: GocardlessWebhookRepository) {
         this.eventsRepository = eventsRepository;
    }

    public async getEvents(headers: any, query:any) {
        try{
              return await this.eventsRepository.find(query)
          } catch (e) {
              console.error(e);
          }
    }
}

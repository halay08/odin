import { Controller } from '@nestjs/common';
import { ConsumptionSchedulesService } from "./consumption.schedules.service";


@Controller("/catalog/consumption/schedules")
export class ConsumptionSchedulesController {

    private readonly consumptionSchedulesService: ConsumptionSchedulesService;

    public constructor(consumptionSchedulesService: ConsumptionSchedulesService) {
        this.consumptionSchedulesService = consumptionSchedulesService;
    }


}

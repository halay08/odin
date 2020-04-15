import { Controller } from '@nestjs/common';
import { ConsumptionRatesService } from "./consumption.rates.service";


@Controller("/catalog/consumption/rates")
export class ConsumptionRatesController {

    private readonly consumptionRatesService: ConsumptionRatesService;

    public constructor(consumptionRatesService: ConsumptionRatesService) {
        this.consumptionRatesService = consumptionRatesService;
    }


}

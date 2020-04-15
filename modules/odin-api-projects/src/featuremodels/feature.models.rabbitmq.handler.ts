import { Injectable } from '@nestjs/common';
import { FeatureModelsService } from './feature.models.service';


@Injectable()
export class FeatureModelsRabbitmqHandler {

    constructor(private readonly featuresService: FeatureModelsService) {

        this.featuresService = featuresService;

    }


}

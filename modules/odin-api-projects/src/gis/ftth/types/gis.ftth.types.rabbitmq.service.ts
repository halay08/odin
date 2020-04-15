import { Injectable } from '@nestjs/common';
import { GisFtthTypesService } from './gis.ftth.types.service';

@Injectable()
export class GisFtthTypesRabbitmqService {

    constructor(private readonly gisFtthTypesService: GisFtthTypesService) {

        this.gisFtthTypesService = gisFtthTypesService;
    }


}

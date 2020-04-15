import { Controller, Get } from '@nestjs/common';
import { ApiTags }         from "@nestjs/swagger";


@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {

    @Get()
    public healthCheck() {
        return "all good!"
    }

}

import { Module }               from '@nestjs/common';
import { MonitoringController } from "./MonitoringController";

@Module({
    controllers: [MonitoringController]
})
export class MonitoringHttpModule {}

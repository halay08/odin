import { Module } from '@nestjs/common';
import { ReportingController } from "./reporting.controller";
import { ReportingService } from "./reporting.service";

@Module({
    controllers: [
        ReportingController,
    ],
    providers: [
        ReportingService,
    ],
    exports: [ ReportingService ],

})
export class ReportingModule {

}

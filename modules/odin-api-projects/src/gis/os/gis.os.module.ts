import { Module } from '@nestjs/common';
import { GisOsController } from './gis.os.controller';
import { GisOsService } from './gis.os.service';


@Module({
    providers: [ GisOsService ],
    exports: [ GisOsService ],
    controllers: [ GisOsController ],
})
export class GisOsModule {
}




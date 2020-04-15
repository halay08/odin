import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../../features/features.module';
import { GisFtthTypesController } from './gis.ftth.types.controller';
import { GisFtthTypesService } from './gis.ftth.types.service';

@Module({
    imports: [ FeaturesModule ],
    controllers: [ GisFtthTypesController ],
    providers: [ GisFtthTypesService ],
    exports: [ GisFtthTypesService ],
})
export class GisFtthTypesModule {
}




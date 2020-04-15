import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { schemaManagerModules } from '@d19n/schema-manager/dist/modules';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { MonitoringModule } from './monitoring/monitoring.module';
import { NetworkAdtranOltModule } from './network/adtran/olt/network.adtran.olt.module';
import { NetworkAdtranOnuDataModule } from './network/adtran/onu/data/network.adtran.onu.data.module';
import { NetworkAdtranOnuActivateDto } from './network/adtran/onu/dto/network.adtran.onu.activate.dto';
import { NetworkAdtranOnuModule } from './network/adtran/onu/network.adtran.onu.module';
import { NetworkAdtranOnuVoiceModule } from './network/adtran/onu/voice/network.adtran.onu.voice.module';
import { NetworkEeroEerosModule } from './network/eero/eeros/network.eero.eeros.module';
import { NetworkEeroNetworksModule } from './network/eero/networks/network.eero.networks.module';
import { VoiceMagraOrderModule } from './voice/magrathea/voice.magra.order.module';
import { VoiceSipwiseCustomerContactModule } from './voice/sipwise/customer-contacts/voice.sipwise.customer-contact.module';
import { VoiceSipwiseFlowsModule } from './voice/sipwise/flows/voice.sipwise.flows.module';
import { VoiceSipwiseSubscriberPreferenceModule } from './voice/sipwise/subscriber-preferences/voice.sipwise.subscriber.preference.module';


dotenv.config();

@Module({
    imports: [
        PromModule.forRoot({
            defaultLabels: {
                app: process.env.MODULE_NAME,
                version: '0.0.0',
            },
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'odinDb',
            keepConnectionAlive: true,
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            keepConnectionAlive: true,
            namingStrategy: new SnakeNamingStrategy(),
            subscribers: [],
            entities: schemaManagerEntities,
        }),
        MonitoringModule,
        NetworkAdtranOnuActivateDto,
        NetworkAdtranOltModule,
        NetworkAdtranOnuVoiceModule,
        NetworkAdtranOnuDataModule,
        NetworkAdtranOnuModule,
        NetworkEeroEerosModule,
        NetworkEeroNetworksModule,
        VoiceSipwiseSubscriberPreferenceModule,
        VoiceSipwiseCustomerContactModule,
        VoiceSipwiseFlowsModule,
        VoiceMagraOrderModule,
        ...schemaManagerModules,
    ],
    controllers: [
        InitializeContoller,
    ],
    providers: [
        InitializeService,
        {
            provide: APP_INTERCEPTOR,
            useClass: ControllerInterceptor,
        },
    ],
    exports: [],
})
export class AppModule {
}

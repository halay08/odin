import { Module }        from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv       from 'dotenv';

dotenv.config();

@Module({

    imports: [

        TypeOrmModule.forRoot({

            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: process.env.DB_SYNCHRONIZE === 'true',
            entities: []

        })

    ]

})
export class AppModule {
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { TemplatesEmailController } from './templates.email.controller';
import { TemplatesEmailRepository } from './templates.email.repository';
import { TemplatesEmailService } from './templates.email.service';

dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TemplatesEmailRepository,
        ]),
    ],
    controllers: [ TemplatesEmailController ],
    providers: [ TemplatesEmailService ],
    exports: [ TemplatesEmailService ],
})
export class TemplatesEmailModule {
}

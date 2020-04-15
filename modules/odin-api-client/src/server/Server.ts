import * as helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ServerSwaggerSettings } from './ServerSwaggerSettings';
import { GlobalExceptionsFilter } from "@d19n/common/dist/exceptions/GlobalExceptionsFilter";
import { Utilities } from "../helpers/Utilities";

dotenv.config();

export class Server {

    public static async bootstrap(
        module: any,
        name: string,
        swagger: ServerSwaggerSettings,
    ): Promise<NestExpressApplication> {

        const app = await NestFactory.create<NestExpressApplication>(module, { cors: true });

        //
        // App config
        //
        app.useGlobalPipes(new ValidationPipe({ transform: true })); // required for class-validator
        app.useGlobalFilters(new GlobalExceptionsFilter());
        // Starts listening for shutdown hooks
        app.enableShutdownHooks();
        app.disable('x-powered-by');
        // somewhere in your initialization file
        app.use(helmet());
        // app.use(
        //     rateLimit({
        //         windowMs: 15 * 60 * 1000, // 15 minutes
        //         max: 15000, // limit each IP to 100 requests per windowMs
        //     }),
        // );

        //
        // Swagger documentation
        //
        const documentBuilder = new DocumentBuilder().setTitle(swagger.title)
            .setContact('Odin Support Team', 'https://', '')
            .setDescription(swagger.description)
            .setExternalDoc('Documentation', 'https://')
            .setVersion(swagger.version)
            .addBearerAuth();

        const environment = Utilities.getEnvironment();

        if ( environment.name === 'local' && process.env.LOCAL_PORT ) {
            documentBuilder.addServer(`http://localhost:${process.env.LOCAL_PORT}`);
        } else if ( environment.name === 'docker' ) {
            documentBuilder.addServer(`http://localhost:8080`);
        }
        if ( process.env.K8_BASE_URL ) {
            documentBuilder.addServer(process.env.K8_BASE_URL);
        }
        if ( process.env.API_URL ) {
            documentBuilder.addServer(process.env.API_URL);
        }

        Object.keys(swagger.tags).forEach(key => {
            documentBuilder.addTag(key, swagger.tags[key]);
        });

        SwaggerModule.setup(`/${name}/swagger`, app, SwaggerModule.createDocument(app, documentBuilder.build()));
        await app.listen(process.env.LOCAL_PORT || 80);
        console.log(`${new Date().toISOString()} ${name} server started on port ${process.env.LOCAL_PORT || 80}`);
        return app;
    }

}

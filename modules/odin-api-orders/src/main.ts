import { Server } from '@d19n/client/dist/server/Server';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import { AppModule } from './AppModule';

dotenv.config();

async function bootstrap() {
    const app = await Server.bootstrap(AppModule, process.env.MODULE_NAME, {
        title: process.env.MODULE_NAME + ' API',
        description: 'Order management',
        version: '1.0',
        tags: {},
    });
    // extend the default server configuration
    app.use(compression());
}

bootstrap();




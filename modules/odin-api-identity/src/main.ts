import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Server } from '@d19n/client/dist/server/Server';
import * as compression from 'compression';
import { AppModule } from './AppModule';

async function bootstrap() {
    const app = await Server.bootstrap(AppModule, SERVICE_NAME.IDENTITY_MODULE, {
        title: 'Identity API',
        description: 'Identity Management',
        version: '1.0',
        tags: {},
    });

    app.use(compression());
}

bootstrap();

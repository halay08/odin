import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Server } from '@d19n/client/dist/server/Server';
import compression from 'compression';
import dotenv from 'dotenv';
import { AppModule } from './AppModule';

dotenv.config();

async function bootstrap() {
  const app = await Server.bootstrap(AppModule, SERVICE_NAME.SCHEMA_MODULE, {
    title: 'Schema API',
    description: 'Schema Management',
    version: '1.0',
    tags: {},
  });
  // extend the default server configuration
  app.use(compression());
}

bootstrap();


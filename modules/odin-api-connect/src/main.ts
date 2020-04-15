import { Server } from '@d19n/client/dist/server/Server';
import { AppModule } from './AppModule';

Server.bootstrap(AppModule, process.env.MODULE_NAME, {
    title: 'Connect module API',
    description: 'orchestrator that connects multiple data sources and modules',
    version: '1.0',
    tags: {},
});


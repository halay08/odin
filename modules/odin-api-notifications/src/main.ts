import { AppModule } from './AppModule';
import { Server } from "@d19n/client/dist/server/Server";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";

Server.bootstrap(AppModule, SERVICE_NAME.NOTIFICATION_MODULE, {
    title: 'Notifications API',
    description: 'All app notifications internal / external',
    version: '1.0',
    tags: {},
});


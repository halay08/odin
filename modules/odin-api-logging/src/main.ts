import { AppModule } from './AppModule';
import { Server } from "@d19n/client/dist/server/Server";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";

Server.bootstrap(AppModule, SERVICE_NAME.AUDIT_MODULE, {
    title: 'Audit Module API',
    description: 'Audit module',
    version: '1.0',
    tags: {},
});


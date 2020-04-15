## Using the RabbtitMqMessagingClient

```
@Injectable()
export class LocalRBACMessageBus {
    public constructor(private readonly usersService: UsersService,
                       private readonly rolesService: RolesService,
                       private readonly permissionsService: PermissionsService) {
    }
    @RabbitRPC({
        exchange: 'someexchange',
        routingKey: 'rpc',
        queue: 'rbac'
    })
    public async handleMessage(methodCall: MessagingMethod) {
        console.log(methodCall);
        return new Promise(async (resolve, reject) => {
            if (this[ methodCall.serviceName ][ methodCall.methodName ]) {
                const result = await this[ methodCall.serviceName ][ methodCall.methodName ](...methodCall.args).catch(e => {
                    resolve(e);
                });
                resolve(result || null);
            } else {
                resolve('method not found');
            }
        });
    }
}

```

## Call service methods over RPC

```
  const user = await this.messagingClient.rpc<MessagingMethod, User>(process.env.RABBITMQ_EXCHANGE, 'rbac', {
        serviceName: 'usersService',
        methodName: 'getById',
        args: [ decoded[ 'id' ] ]
    });
```

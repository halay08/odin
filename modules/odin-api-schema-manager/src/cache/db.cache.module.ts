import { Module } from '@nestjs/common';
import redis from 'redis';
import { DbCacheService } from './db.cache.service';


const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {

    const client = await redis.createClient({
      host: process.env.REDIS_ENDPOINT || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    client.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });

    client.on('drain', (e) => {
      client.quit();
    });

    return client;

  },
};

@Module({
  imports: [],
  controllers: [],
  providers: [
    DbCacheService,
    redisProvider,
  ],
  exports: [
    DbCacheService,
  ],
})

export class DbCacheModule {
}

import dotenv from 'dotenv';

dotenv.config();

export class RedisClient {

  public constructor(public readonly client: any) {
    this.client = client;
  }


  /**
   *
   * @param cacheKey
   */
  public getFromCache<T>(cacheKey: string): Promise<T | void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.client.get(cacheKey, async (err, reply) => {
          if(err) {
            console.error('error with getFromCache', err);
            // return reject(new ExceptionType(500, err.message));
          }
          if(reply) {
            const parsed = JSON.parse(reply);
            return resolve(parsed)
          }
          return resolve(reply);
        });
      } catch (e) {
        console.error('catch error getFromCache', e);
        return resolve();
      }
    });
  }

  /**
   *
   * @param cacheKey
   * @param data
   */
  public saveToCache<T>(cacheKey: string, data: T): Promise<T | void> {
    return new Promise(async (resolve, reject) => {
      try {

        // caching for 7 days 604800
        await this.client.set(cacheKey, JSON.stringify(data), 'EX', 604800, (
          err,
          res,
        ) => {
          if(err) {
            console.error('error with getFromCache', err);
            // return reject(new ExceptionType(500, err.message));
          }

          return resolve(data);
        });
      } catch (e) {
        console.error('catch error saveToCache', e);
        return resolve();
      }
    });
  }

  /**
   *
   * @param cacheKey
   * @param data
   */
  public removeFromCache(cacheKey: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.client.del(cacheKey, (
          err,
          res,
        ) => {
          if(err) {
            console.error('error with removeFromCache', err);
            // return reject(new ExceptionType(500, err.message));
          }
          return resolve(res);
        });
      } catch (e) {
        console.error('catch error removeFromCache', e);
        return resolve();
      }
    });
  }
}


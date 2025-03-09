const { promisify } = require('util');
const redis = require('redis');

class RedisClient {
  constructor() {
    const redisConfig = {
      host: 'redis-14650.c262.us-east-1-3.ec2.redns.redis-cloud.com:14650',
      port: 14529,
      password: '2Wld5DdBQhrp6zRwcxA3EYNcX1QiQyDH',
    };
    this.client = redis.createClient(redisConfig);

    this.client.on('error', (err) => {
      console.error('Redis Error:', err);
    });
  }

  isAlive() {
    try {
      this.client.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);

    try {
      return await getAsync(key);
    } catch (error) {
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.setex(key, duration, value);
    } catch (error) {
      console.error('Redis Set Error:', error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis Delete Error:', error);
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;

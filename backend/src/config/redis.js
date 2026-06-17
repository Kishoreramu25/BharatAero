const redis = require('redis');

let client = null;
let useMemoryFallback = false;

// In-memory fallback cache Map
const memoryCache = new Map();

// Initialize redis connection asynchronously
const initRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    });

    client.on('error', (err) => {
      console.warn('[Redis] Client Connection Error. Falling back to in-memory cache:', err.message);
      useMemoryFallback = true;
    });

    await client.connect();
    console.log('[Redis] Connected successfully');
  } catch (err) {
    console.warn('[Redis] Initialization failed. Gracefully falling back to in-memory cache.');
    useMemoryFallback = true;
  }
};

initRedis();

module.exports = {
  setex: async (key, seconds, value) => {
    if (useMemoryFallback || !client) {
      memoryCache.set(key, {
        value: String(value),
        expiry: Date.now() + (seconds * 1000)
      });
      return 'OK';
    }
    try {
      return await client.setEx(key, seconds, String(value));
    } catch (err) {
      console.warn('[Redis] setex failed, falling back to in-memory cache:', err.message);
      memoryCache.set(key, {
        value: String(value),
        expiry: Date.now() + (seconds * 1000)
      });
      return 'OK';
    }
  },

  get: async (key) => {
    if (useMemoryFallback || !client) {
      const item = memoryCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
    try {
      return await client.get(key);
    } catch (err) {
      console.warn('[Redis] get failed, falling back to in-memory cache:', err.message);
      const item = memoryCache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
  },

  del: async (key) => {
    if (useMemoryFallback || !client) {
      const deleted = memoryCache.delete(key);
      return deleted ? 1 : 0;
    }
    try {
      return await client.del(key);
    } catch (err) {
      console.warn('[Redis] del failed, falling back to in-memory cache:', err.message);
      const deleted = memoryCache.delete(key);
      return deleted ? 1 : 0;
    }
  }
};

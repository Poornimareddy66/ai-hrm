const { createClient } = require('redis');
const logger = require('../utils/logger');
let redisClient;
async function connectRedis() {
  redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.on('error', (err) => logger.error('Redis error:', err));
  await redisClient.connect();
  logger.info('Redis connected');
  return redisClient;
}
function getRedisClient() { return redisClient; }
async function setCache(key, value, ttl = 3600) {
  await redisClient.setEx(key, ttl, JSON.stringify(value));
}
async function getCache(key) {
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
}
async function deleteCache(key) { await redisClient.del(key); }
async function deleteCachePattern(pattern) {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) await redisClient.del(keys);
}
module.exports = { connectRedis, getRedisClient, setCache, getCache, deleteCache, deleteCachePattern };

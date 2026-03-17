const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: { timestamps: true, underscored: true },
});
async function connectPostgres() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('PostgreSQL connected');
  } catch (error) {
    logger.error('PostgreSQL connection failed:', error);
    throw error;
  }
}
module.exports = { sequelize, connectPostgres };

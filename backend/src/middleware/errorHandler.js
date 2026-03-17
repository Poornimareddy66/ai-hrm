const logger = require('../utils/logger');
module.exports = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors.map(e => ({ field: e.path, message: e.message })) });
  }
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired' });
  if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
  res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
};

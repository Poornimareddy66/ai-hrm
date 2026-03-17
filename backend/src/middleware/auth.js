const jwt = require('jsonwebtoken');
const { getCache } = require('../config/redis');
const User = require('../models/user.model');
exports.protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cached = await getCache(`user:${decoded.id}`);
    if (cached) { req.user = cached; return next(); }
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'email', 'role', 'isActive', 'employeeId'] });
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive' });
    req.user = user.toJSON();
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: `Role ${req.user.role} is not authorized` });
  next();
};

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { setCache, deleteCache } = require('../config/redis');
const logger = require('../utils/logger');
const generateTokens = (userId, role) => ({
  accessToken: jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' }),
  refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
});
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: email.toLowerCase(), isActive: true } });
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  const { accessToken, refreshToken } = generateTokens(user.id, user.role);
  await user.update({ refreshToken, lastLogin: new Date() });
  await setCache(`user:${user.id}`, { id: user.id, role: user.role, employeeId: user.employeeId }, 86400);
  logger.info(`User logged in: ${user.email}`);
  res.json({ success: true, data: { user: user.toJSON(), accessToken, refreshToken } });
};
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ where: { id: decoded.id, refreshToken, isActive: true } });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });
    const tokens = generateTokens(user.id, user.role);
    await user.update({ refreshToken: tokens.refreshToken });
    res.json({ success: true, data: tokens });
  } catch { res.status(401).json({ message: 'Invalid or expired refresh token' }); }
};
exports.logout = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user) { await user.update({ refreshToken: null }); await deleteCache(`user:${req.user.id}`); }
  res.json({ success: true, message: 'Logged out successfully' });
};
exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ success: true, data: user });
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
  await user.update({ password: newPassword });
  res.json({ success: true, message: 'Password updated successfully' });
};

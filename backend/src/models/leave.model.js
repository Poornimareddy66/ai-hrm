const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const LeaveRequest = sequelize.define('LeaveRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false },
  leaveType: { type: DataTypes.ENUM('annual','sick','maternity','paternity','emergency','unpaid','compensatory','study'), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  totalDays: { type: DataTypes.INTEGER, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','rejected','cancelled'), defaultValue: 'pending' },
  approvedById: { type: DataTypes.UUID },
  approvedAt: { type: DataTypes.DATE },
  rejectionReason: { type: DataTypes.TEXT },
  aiRiskScore: { type: DataTypes.FLOAT },
  aiRecommendation: { type: DataTypes.ENUM('approve','reject','defer') },
  aiReason: { type: DataTypes.TEXT },
}, { tableName: 'leave_requests' });
const LeaveBalance = sequelize.define('LeaveBalance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  annual: { type: DataTypes.FLOAT, defaultValue: 21 },
  sick: { type: DataTypes.FLOAT, defaultValue: 12 },
  emergency: { type: DataTypes.FLOAT, defaultValue: 5 },
  usedAnnual: { type: DataTypes.FLOAT, defaultValue: 0 },
  usedSick: { type: DataTypes.FLOAT, defaultValue: 0 },
}, { tableName: 'leave_balances' });
module.exports = { LeaveRequest, LeaveBalance };

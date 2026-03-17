const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Payroll = sequelize.define('Payroll', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  basicSalary: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  hra: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  transportAllowance: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  grossEarnings: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  providentFund: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  incomeTax: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  totalDeductions: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  netSalary: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
  workingDays: { type: DataTypes.INTEGER },
  presentDays: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('draft','pending_approval','approved','paid','cancelled'), defaultValue: 'draft' },
  paidAt: { type: DataTypes.DATE },
}, { tableName: 'payrolls' });
module.exports = Payroll;

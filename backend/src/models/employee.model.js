const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  firstName: { type: DataTypes.STRING(100), allowNull: false },
  lastName: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say') },
  address: { type: DataTypes.JSONB, defaultValue: {} },
  departmentId: { type: DataTypes.UUID, allowNull: false },
  managerId: { type: DataTypes.UUID },
  employmentType: { type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern'), defaultValue: 'full_time' },
  employmentStatus: { type: DataTypes.ENUM('active', 'on_leave', 'suspended', 'terminated', 'resigned'), defaultValue: 'active' },
  joinDate: { type: DataTypes.DATEONLY, allowNull: false },
  salary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  skills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  profilePhoto: { type: DataTypes.STRING(500) },
  aiAttritionScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  aiPerformanceScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  aiInsights: { type: DataTypes.JSONB, defaultValue: {} },
}, { tableName: 'employees' });
Employee.prototype.getFullName = function() { return `${this.firstName} ${this.lastName}`; };
Employee.prototype.getTenureMonths = function() { return Math.floor((new Date() - new Date(this.joinDate)) / (1000 * 60 * 60 * 24 * 30)); };
module.exports = Employee;

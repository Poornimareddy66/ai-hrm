const { Op } = require('sequelize');
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
const aiService = require('../services/ai.service');
const { setCache, getCache, deleteCachePattern } = require('../config/redis');
exports.getAll = async (req, res) => {
  const { page = 1, limit = 20, search, department, status } = req.query;
  const where = {};
  if (search) where[Op.or] = [{ firstName: { [Op.iLike]: `%${search}%` } }, { lastName: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];
  if (department) where.departmentId = department;
  if (status) where.employmentStatus = status;
  const { count, rows } = await Employee.findAndCountAll({ where, include: [{ model: Department, as: 'department', attributes: ['id', 'name'] }], order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit });
  res.json({ success: true, data: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } });
};
exports.getById = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id, { include: [{ model: Department, as: 'department' }] });
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json({ success: true, data: employee });
};
exports.create = async (req, res) => {
  const count = await Employee.count();
  const employeeId = `EMP${String(count + 1).padStart(5, '0')}`;
  const employee = await Employee.create({ ...req.body, employeeId });
  await deleteCachePattern('employees:*');
  res.status(201).json({ success: true, data: employee });
};
exports.update = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  await employee.update(req.body);
  res.json({ success: true, data: employee });
};
exports.delete = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  await employee.update({ employmentStatus: 'terminated' });
  res.json({ success: true, message: 'Employee deactivated' });
};
exports.getStats = async (req, res) => {
  const [total, active, onLeave, terminated] = await Promise.all([Employee.count(), Employee.count({ where: { employmentStatus: 'active' } }), Employee.count({ where: { employmentStatus: 'on_leave' } }), Employee.count({ where: { employmentStatus: 'terminated' } })]);
  res.json({ success: true, data: { total, active, onLeave, terminated } });
};
exports.getAttritionRisk = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id, { include: [{ model: Department, as: 'department' }] });
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  const risk = await aiService.predictAttrition({ tenureMonths: employee.getTenureMonths(), department: employee.department?.name, performanceScore: employee.aiPerformanceScore, avgOvertimeHours: 5, trainingHours: 20 });
  await employee.update({ aiAttritionScore: risk.riskScore, aiInsights: { ...employee.aiInsights, attrition: risk } });
  res.json({ success: true, data: risk });
};

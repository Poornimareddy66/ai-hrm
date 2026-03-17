const { Op } = require('sequelize');
const { LeaveRequest, LeaveBalance } = require('../models/leave.model');
const Employee = require('../models/employee.model');
const aiService = require('../services/ai.service');
exports.getAll = async (req, res) => {
  const { status, employeeId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;
  if (req.user.role === 'employee') where.employeeId = req.user.employeeId;
  const { count, rows } = await LeaveRequest.findAndCountAll({ where, include: [{ model: Employee, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'employeeId'] }], order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit });
  res.json({ success: true, data: rows, pagination: { total: count } });
};
exports.createRequest = async (req, res) => {
  const { startDate, endDate, leaveType, reason } = req.body;
  const employeeId = req.user.role === 'employee' ? req.user.employeeId : req.body.employeeId;
  const start = new Date(startDate), end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  let aiAnalysis = {};
  try { aiAnalysis = await aiService.analyzeLeaveRisk({ department: 'General', teamSize: 10, overlappingLeaves: 0, days, leaveType }); } catch {}
  const leaveRequest = await LeaveRequest.create({ employeeId, leaveType, startDate, endDate, totalDays: days, reason, aiRiskScore: aiAnalysis.riskScore, aiRecommendation: aiAnalysis.recommendation, aiReason: aiAnalysis.reason });
  res.status(201).json({ success: true, data: leaveRequest });
};
exports.approveLeave = async (req, res) => {
  const l = await LeaveRequest.findByPk(req.params.id);
  if (!l) return res.status(404).json({ message: 'Leave request not found' });
  await l.update({ status: 'approved', approvedById: req.user.employeeId, approvedAt: new Date() });
  res.json({ success: true, data: l });
};
exports.rejectLeave = async (req, res) => {
  const l = await LeaveRequest.findByPk(req.params.id);
  if (!l) return res.status(404).json({ message: 'Leave request not found' });
  await l.update({ status: 'rejected', rejectionReason: req.body.reason });
  res.json({ success: true, data: l });
};
exports.getBalance = async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  let balance = await LeaveBalance.findOne({ where: { employeeId: req.params.employeeId, year } });
  if (!balance) balance = await LeaveBalance.create({ employeeId: req.params.employeeId, year });
  res.json({ success: true, data: balance });
};
exports.getCalendar = async (req, res) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1), end = new Date(year, month, 0);
  const leaves = await LeaveRequest.findAll({ where: { status: 'approved', startDate: { [Op.between]: [start, end] } } });
  res.json({ success: true, data: leaves });
};

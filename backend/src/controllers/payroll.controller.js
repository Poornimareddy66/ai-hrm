const Payroll = require('../models/payroll.model');
const Employee = require('../models/employee.model');
function calcPayroll(emp) {
  const basic = parseFloat(emp.salary) * 0.40;
  const hra = basic * 0.50;
  const transport = 1600;
  const gross = basic + hra + transport;
  const pf = basic * 0.12;
  const pt = gross > 15000 ? 200 : 0;
  const tax = (gross * 12 > 500000) ? ((gross * 12 - 500000) * 0.20 / 12) : 0;
  const totalDed = pf + pt + tax;
  return { basicSalary: basic, hra, transportAllowance: transport, grossEarnings: gross, providentFund: pf, incomeTax: tax, totalDeductions: totalDed, netSalary: Math.max(0, gross - totalDed), workingDays: 26, presentDays: 26 };
}
exports.generatePayroll = async (req, res) => {
  const { month, year } = req.body;
  const employees = await Employee.findAll({ where: { employmentStatus: 'active' } });
  const results = [];
  for (const emp of employees) {
    const existing = await Payroll.findOne({ where: { employeeId: emp.id, month, year } });
    if (existing) { results.push({ employeeId: emp.id, status: 'skipped' }); continue; }
    const components = calcPayroll(emp);
    const payroll = await Payroll.create({ employeeId: emp.id, month, year, ...components, status: 'draft' });
    results.push({ employeeId: emp.id, payrollId: payroll.id, netSalary: payroll.netSalary });
  }
  res.status(201).json({ success: true, data: { generated: results.length, results } });
};
exports.getAll = async (req, res) => {
  const { month, year, page = 1, limit = 20 } = req.query;
  const where = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  const { count, rows } = await Payroll.findAndCountAll({ where, include: [{ model: Employee, as: 'employee', attributes: ['id', 'employeeId', 'firstName', 'lastName'] }], order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit });
  res.json({ success: true, data: rows, pagination: { total: count } });
};
exports.getEmployeePayroll = async (req, res) => {
  const payrolls = await Payroll.findAll({ where: { employeeId: req.params.employeeId }, order: [['year', 'DESC'], ['month', 'DESC']] });
  res.json({ success: true, data: payrolls });
};
exports.approvePayroll = async (req, res) => {
  const p = await Payroll.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Payroll not found' });
  await p.update({ status: 'approved' });
  res.json({ success: true, data: p });
};
exports.disbursePayroll = async (req, res) => {
  const p = await Payroll.findByPk(req.params.id);
  if (!p) return res.status(404).json({ message: 'Payroll not found' });
  await p.update({ status: 'paid', paidAt: new Date() });
  res.json({ success: true, data: p });
};
exports.bulkApprove = async (req, res) => {
  const { month, year } = req.body;
  const [count] = await Payroll.update({ status: 'approved' }, { where: { month, year, status: 'draft' } });
  res.json({ success: true, data: { approved: count } });
};
exports.getSummary = async (req, res) => {
  const { month, year } = req.query;
  const where = {};
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  const payrolls = await Payroll.findAll({ where });
  const summary = payrolls.reduce((acc, p) => ({ totalGross: acc.totalGross + parseFloat(p.grossEarnings), totalDeductions: acc.totalDeductions + parseFloat(p.totalDeductions), totalNet: acc.totalNet + parseFloat(p.netSalary), count: acc.count + 1 }), { totalGross: 0, totalDeductions: 0, totalNet: 0, count: 0 });
  res.json({ success: true, data: summary });
};

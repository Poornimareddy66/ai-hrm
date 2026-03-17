const aiService = require('../services/ai.service');
const Employee = require('../models/employee.model');
const { getCache, setCache } = require('../config/redis');
exports.chatbot = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });
  const reply = await aiService.hrChatbot(message, {});
  res.json({ success: true, data: { reply } });
};
exports.generateJD = async (req, res) => {
  const jd = await aiService.generateJobDescription(req.body);
  res.json({ success: true, data: jd });
};
exports.screenResume = async (req, res) => {
  const { resumeText, jobDetails } = req.body;
  if (!resumeText || !jobDetails) return res.status(400).json({ message: 'resumeText and jobDetails are required' });
  const result = await aiService.screenResume(resumeText, jobDetails);
  res.json({ success: true, data: result });
};
exports.generateFeedback = async (req, res) => {
  const feedback = await aiService.generatePerformanceFeedback(req.body);
  res.json({ success: true, data: feedback });
};
exports.attritionReport = async (req, res) => {
  const cached = await getCache('ai:attrition:report');
  if (cached) return res.json({ success: true, data: cached });
  const employees = await Employee.findAll({ where: { employmentStatus: 'active' }, attributes: ['id', 'firstName', 'lastName', 'aiAttritionScore'], order: [['aiAttritionScore', 'DESC']], limit: 50 });
  const report = { highRisk: employees.filter(e => e.aiAttritionScore >= 70), medRisk: employees.filter(e => e.aiAttritionScore >= 40 && e.aiAttritionScore < 70), lowRisk: employees.filter(e => e.aiAttritionScore < 40), total: employees.length };
  await setCache('ai:attrition:report', report, 3600);
  res.json({ success: true, data: report });
};
exports.workforceInsights = async (req, res) => {
  res.json({ success: true, data: { insights: [{ title: 'Run attrition analysis', description: 'Use employee attrition risk feature to identify at-risk employees.', priority: 'high', action: 'Visit employee profiles and run AI analysis' }] } });
};

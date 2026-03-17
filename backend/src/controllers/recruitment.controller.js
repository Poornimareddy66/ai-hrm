const { Op } = require('sequelize');
const { JobPosting, JobApplication } = require('../models/recruitment.model');
const aiService = require('../services/ai.service');
exports.getJobs = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = status ? { status } : {};
  const { count, rows } = await JobPosting.findAndCountAll({ where, order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit });
  res.json({ success: true, data: rows, pagination: { total: count } });
};
exports.createJob = async (req, res) => {
  const job = await JobPosting.create(req.body);
  res.status(201).json({ success: true, data: job });
};
exports.generateJD = async (req, res) => {
  const jd = await aiService.generateJobDescription(req.body);
  res.json({ success: true, data: jd });
};
exports.updateJob = async (req, res) => {
  const job = await JobPosting.findByPk(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  await job.update(req.body);
  res.json({ success: true, data: job });
};
exports.getApplications = async (req, res) => {
  const { jobId, status, page = 1, limit = 20 } = req.query;
  const where = {};
  if (jobId) where.jobPostingId = jobId;
  if (status) where.status = status;
  const { count, rows } = await JobApplication.findAndCountAll({ where, order: [['aiScreeningScore', 'DESC']], limit: parseInt(limit), offset: (page - 1) * limit });
  res.json({ success: true, data: rows, pagination: { total: count } });
};
exports.submitApplication = async (req, res) => {
  const application = await JobApplication.create(req.body);
  res.status(201).json({ success: true, data: application });
};
exports.screenApplication = async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id, { include: [{ model: JobPosting, as: 'job' }] });
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (!application.resumeText) return res.status(400).json({ message: 'No resume text to screen' });
  const screening = await aiService.screenResume(application.resumeText, application.job);
  await application.update({ aiScreeningScore: screening.score, aiSkillMatch: screening.skillMatch, aiSummary: screening.summary, aiRecommendation: screening.recommendation, status: screening.score >= 70 ? 'shortlisted' : 'screening' });
  res.json({ success: true, data: { application, screening } });
};
exports.bulkScreen = async (req, res) => {
  const { jobId } = req.body;
  const job = await JobPosting.findByPk(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  const apps = await JobApplication.findAll({ where: { jobPostingId: jobId, status: 'applied', resumeText: { [Op.not]: null } } });
  const results = [];
  for (const app of apps) {
    try {
      const s = await aiService.screenResume(app.resumeText, job);
      await app.update({ aiScreeningScore: s.score, aiRecommendation: s.recommendation, status: s.score >= 70 ? 'shortlisted' : 'screening' });
      results.push({ id: app.id, score: s.score });
    } catch (e) { results.push({ id: app.id, error: e.message }); }
  }
  res.json({ success: true, data: { processed: results.length, results } });
};
exports.updateApplicationStatus = async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  await application.update({ status: req.body.status });
  res.json({ success: true, data: application });
};
exports.getStats = async (req, res) => {
  const [totalJobs, openJobs, totalApps, shortlisted, hired] = await Promise.all([JobPosting.count(), JobPosting.count({ where: { status: 'open' } }), JobApplication.count(), JobApplication.count({ where: { status: 'shortlisted' } }), JobApplication.count({ where: { status: 'hired' } })]);
  res.json({ success: true, data: { totalJobs, openJobs, totalApps, shortlisted, hired } });
};

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const JobPosting = sequelize.define('JobPosting', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  departmentId: { type: DataTypes.UUID, allowNull: false },
  description: { type: DataTypes.TEXT },
  requiredSkills: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  experienceMin: { type: DataTypes.INTEGER, defaultValue: 0 },
  experienceMax: { type: DataTypes.INTEGER },
  location: { type: DataTypes.STRING(200) },
  openings: { type: DataTypes.INTEGER, defaultValue: 1 },
  status: { type: DataTypes.ENUM('draft','open','closed','on_hold'), defaultValue: 'draft' },
  employmentType: { type: DataTypes.ENUM('full_time','part_time','contract','intern'), defaultValue: 'full_time' },
}, { tableName: 'job_postings' });
const JobApplication = sequelize.define('JobApplication', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jobPostingId: { type: DataTypes.UUID, allowNull: false },
  candidateName: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  resumeText: { type: DataTypes.TEXT },
  totalExperience: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM('applied','screening','shortlisted','interview_l1','offer','hired','rejected'), defaultValue: 'applied' },
  aiScreeningScore: { type: DataTypes.FLOAT },
  aiSkillMatch: { type: DataTypes.JSONB, defaultValue: {} },
  aiSummary: { type: DataTypes.TEXT },
  aiRecommendation: { type: DataTypes.ENUM('strong_yes','yes','maybe','no') },
}, { tableName: 'job_applications' });
module.exports = { JobPosting, JobApplication };

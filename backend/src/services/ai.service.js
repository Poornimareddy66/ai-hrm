const OpenAI = require('openai');
const logger = require('../utils/logger');
class AIService {
  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.model = 'gpt-4o';
  }
  async screenResume(resumeText, jobPosting) {
    const prompt = `You are an expert HR recruiter. Analyze this resume against the job requirements.
JOB TITLE: ${jobPosting.title}
REQUIRED SKILLS: ${jobPosting.requiredSkills?.join(', ')}
EXPERIENCE REQUIRED: ${jobPosting.experienceMin}-${jobPosting.experienceMax || '+'}  years
RESUME: ${resumeText}
Respond ONLY with valid JSON:
{"score":<0-100>,"recommendation":"<strong_yes|yes|maybe|no>","summary":"<2-3 sentences>","skillMatch":{"matched":[],"missing":[]},"strengths":[],"concerns":[],"interviewQuestions":[]}`;
    try {
      const response = await this.client.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 1000 });
      return JSON.parse(response.choices[0].message.content.trim());
    } catch (error) { logger.error('AI resume screening error:', error); throw new Error('Failed to screen resume'); }
  }
  async generateJobDescription(roleDetails) {
    const prompt = `Generate a professional job description for: ${roleDetails.title} in ${roleDetails.department}.
Experience: ${roleDetails.experienceMin}-${roleDetails.experienceMax} years. Skills: ${roleDetails.skills?.join(', ')}.
Respond ONLY with valid JSON: {"description":"<overview>","responsibilities":[],"requirements":[],"niceToHave":[],"benefits":[]}`;
    const response = await this.client.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 1500 });
    return JSON.parse(response.choices[0].message.content.trim());
  }
  async predictAttrition(employeeData) {
    const prompt = `Analyze employee attrition risk. Data: ${JSON.stringify(employeeData)}.
Respond ONLY with valid JSON: {"riskScore":<0-100>,"riskLevel":"<low|medium|high|critical>","topFactors":[],"recommendations":[],"confidencePercent":<0-100>}`;
    const response = await this.client.chat.completions.create({ model: this.model, messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 600 });
    return JSON.parse(response.choices[0].message.content.trim());
  }
  async hrChatbot(message, context = {}) {
    const systemPrompt = `You are HRBot, a helpful HR assistant for ${process.env.COMPANY_NAME || 'the company'}. Help with leave policies, payroll, benefits, and HR queries. Be concise and professional. Employee context: ${JSON.stringify(context)}`;
    const response = await this.client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }], temperature: 0.7, max_tokens: 500 });
    return response.choices[0].message.content;
  }
  async analyzeLeaveRisk(leaveData) {
    const prompt = `Analyze leave request risk. Department: ${leaveData.department}, Team size: ${leaveData.teamSize}, Overlapping leaves: ${leaveData.overlappingLeaves}, Duration: ${leaveData.days} days, Type: ${leaveData.leaveType}.
Respond ONLY with valid JSON: {"riskScore":<0-100>,"recommendation":"<approve|reject|defer>","reason":"<brief reason>"}`;
    const response = await this.client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.1, max_tokens: 300 });
    return JSON.parse(response.choices[0].message.content.trim());
  }
}
module.exports = new AIService();

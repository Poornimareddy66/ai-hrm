require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { connectPostgres } = require('./config/database');
const { connectMongo } = require('./config/mongodb');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const recruitmentRoutes = require('./routes/recruitment.routes');
const payrollRoutes = require('./routes/payroll.routes');
const leaveRoutes = require('./routes/leave.routes');
const performanceRoutes = require('./routes/performance.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const aiRoutes = require('./routes/ai.routes');
const departmentRoutes = require('./routes/department.routes');
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));
}
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/employees`, employeeRoutes);
app.use(`${API}/recruitment`, recruitmentRoutes);
app.use(`${API}/payroll`, payrollRoutes);
app.use(`${API}/leave`, leaveRoutes);
app.use(`${API}/performance`, performanceRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/departments`, departmentRoutes);
app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await connectPostgres();
    await connectMongo();
    await connectRedis();
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}
startServer();
module.exports = app;

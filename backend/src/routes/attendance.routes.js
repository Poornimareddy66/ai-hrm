const { Router } = require('express');
const { protect } = require('../middleware/auth');
const r = Router();
r.use(protect);
r.get('/', (req, res) => res.json({ success: true, data: [] }));
module.exports = r;

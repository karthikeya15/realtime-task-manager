const router = require('express').Router();
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;

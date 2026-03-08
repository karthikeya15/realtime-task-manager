const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const Joi = require('joi');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post(
  '/refresh',
  validate(Joi.object({ refreshToken: Joi.string().required() })),
  authController.refreshToken
);
router.get('/me', authenticate, authController.getMe);

module.exports = router;

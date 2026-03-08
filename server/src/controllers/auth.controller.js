const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  ApiResponse.created(res, { user: user.toPublicJSON(), accessToken, refreshToken }, 'Registration successful');
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  ApiResponse.success(res, { user: user.toPublicJSON(), accessToken, refreshToken }, 'Login successful');
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const { accessToken } = await authService.refreshAccessToken(token);
  ApiResponse.success(res, { accessToken });
});

const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, { user: req.user.toPublicJSON() });
});

module.exports = { register, login, refreshToken, getMe };

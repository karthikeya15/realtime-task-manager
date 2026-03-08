/**
 * Unit tests for auth.service — critical business logic:
 *  1. register()  — creates user, returns tokens, rejects duplicates
 *  2. login()     — validates credentials, rejects wrong password
 */

require('./setup');
const authService = require('../src/services/auth.service');
const User = require('../src/models/User');
const ApiError = require('../src/utils/ApiError');

const validPayload = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'Password1',
};

describe('authService.register()', () => {
  it('creates a new user and returns accessToken + refreshToken', async () => {
    const result = await authService.register(validPayload);

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(validPayload.email);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('hashes the password — raw password is never stored', async () => {
    await authService.register(validPayload);
    const dbUser = await User.findOne({ email: validPayload.email }).select('+password');
    expect(dbUser.password).not.toBe(validPayload.password);
    expect(dbUser.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt prefix
  });

  it('throws 409 Conflict when email already exists', async () => {
    await authService.register(validPayload);

    await expect(authService.register(validPayload)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Email already registered',
    });
  });
});

describe('authService.login()', () => {
  beforeEach(async () => {
    await authService.register(validPayload);
  });

  it('returns tokens for valid credentials', async () => {
    const result = await authService.login({
      email: validPayload.email,
      password: validPayload.password,
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe(validPayload.email);
  });

  it('throws 401 for wrong password', async () => {
    await expect(
      authService.login({ email: validPayload.email, password: 'WrongPass1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws 401 for non-existent email', async () => {
    await expect(
      authService.login({ email: 'ghost@example.com', password: 'Password1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('authService.refreshAccessToken()', () => {
  it('returns a new accessToken given a valid refresh token', async () => {
    const { refreshToken } = await authService.register(validPayload);
    const result = await authService.refreshAccessToken(refreshToken);
    expect(result.accessToken).toBeTruthy();
  });

  it('throws 401 for an invalid refresh token', async () => {
    await expect(
      authService.refreshAccessToken('invalid.token.here')
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

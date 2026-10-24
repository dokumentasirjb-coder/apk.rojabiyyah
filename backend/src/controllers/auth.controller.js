import { AuthService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { REFRESH_COOKIE_NAME, getRefreshCookieOptions } from '../utils/jwt.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { usernameOrEmail, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login({
        usernameOrEmail,
        password,
        ipAddress,
        userAgent,
      });

      // Set refresh token in httpOnly cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Login berhasil',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { fullName, username, email, password, phone, address, regionId } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.register({
        fullName,
        username,
        email,
        password,
        phone,
        address,
        regionId,
        ipAddress,
        userAgent,
      });

      // Set refresh token in httpOnly cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pendaftaran anggota berhasil! Selamat bergabung.',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const incomingRefreshToken = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;

      const result = await AuthService.refreshToken(incomingRefreshToken);

      // Re-issue cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Token berhasil diperbarui',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      await AuthService.logout(userId, ipAddress, userAgent);

      // Clear cookie
      const { maxAge, ...clearOptions } = getRefreshCookieOptions();
      res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Logout berhasil',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Profil berhasil dimuat',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      await AuthService.changePassword({
        userId,
        currentPassword,
        newPassword,
        ipAddress,
        userAgent,
      });

      // Clear refresh cookie
      res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Kata sandi berhasil diubah, silakan login kembali dengan kata sandi baru',
      });
    } catch (error) {
      next(error);
    }
  }
}


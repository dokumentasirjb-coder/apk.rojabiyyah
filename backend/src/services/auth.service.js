import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

export class AuthService {
  static async login({ usernameOrEmail, password, ipAddress, userAgent }) {
    // 1. Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      },
      include: {
        member: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Username atau kata sandi tidak valid', 401);
    }

    // 2. Check if account is temporarily locked due to brute-force attempts
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      throw new AppError(
        `Akun terkunci sementara demi keamanan karena terlalu banyak percobaan login yang gagal. Silakan coba lagi dalam ${remainingMinutes} menit atau hubungi Super Admin.`,
        429
      );
    }

    // 3. Check if member account is active
    if (user.member && user.member.status === 'INACTIVE') {
      throw new AppError('Akun anggota Anda saat ini berstatus non-aktif. Hubungi Administrator.', 403);
    }

    // 4. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newAttempts = (user.loginAttempts || 0) + 1;
      let lockedUntil = null;

      if (newAttempts >= 5) {
        // Lock for 15 minutes after 5 consecutive failures
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          module: 'AUTH',
          details: `Percobaan login gagal (${newAttempts}x) untuk akun ${user.username}`,
          ipAddress,
          userAgent,
        },
      });

      if (lockedUntil) {
        throw new AppError('Terlalu banyak percobaan gagal. Akun Anda telah dikunci sementara selama 15 menit demi keamanan.', 429);
      }

      const attemptsRemaining = 5 - newAttempts;
      throw new AppError(
        `Username atau kata sandi tidak valid. Sisa percobaan: ${attemptsRemaining} kali sebelum akun dikunci sementara.`,
        401
      );
    }

    // 5. Successful login: reset loginAttempts and lockedUntil
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // 6. Generate tokens
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      memberId: user.member?.id || null,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ id: user.id });

    // 7. Hash & save refresh token in database (12 rounds)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // 8. Record activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        module: 'AUTH',
        details: `Pengguna ${user.username} (${user.role}) berhasil masuk ke sistem`,
        ipAddress,
        userAgent,
      },
    });

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      member: user.member,
    };

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  static async register({ fullName, username, email, password, phone, address, regionId, ipAddress, userAgent }) {
    // 1. Check existing username or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      throw new AppError('Username atau Email sudah terdaftar. Silakan gunakan yang lain.', 409);
    }

    // 2. Validate regionId safely
    let validRegionId = null;
    if (regionId) {
      const parsedRegionId = parseInt(regionId);
      if (!isNaN(parsedRegionId)) {
        const foundRegion = await prisma.region.findUnique({
          where: { id: parsedRegionId },
        });
        if (foundRegion) {
          validRegionId = foundRegion.id;
        }
      }
    }

    // 3. Generate unique Member ID: RJB-XXX
    let candidateNum = (await prisma.member.count()) + 1;
    let memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
    while (await prisma.member.findUnique({ where: { memberId } })) {
      candidateNum++;
      memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
    }

    // 4. Hash password with hardened 12 salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    return await prisma.$transaction(async (tx) => {
      // 5. Create User
      const user = await tx.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'ANGGOTA',
        },
      });

      // 6. Create Member Profile
      const member = await tx.member.create({
        data: {
          userId: user.id,
          memberId,
          fullName,
          phone: phone || null,
          address: address || null,
          regionId: validRegionId,
          status: 'ACTIVE',
        },
        include: {
          region: true,
        },
      });

      // 6. Generate Tokens
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        memberId: member.id,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken({ id: user.id });

      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await tx.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
      });

      // 7. Activity Log & Admin Notification
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          module: 'AUTH',
          details: `Anggota baru ${fullName} (${memberId}) mendaftar akun secara mandiri`,
          ipAddress,
          userAgent,
        },
      });

      const admins = await tx.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: 'Pendaftaran Anggota Baru',
            message: `${fullName} (${memberId}) telah mendaftar sebagai anggota baru`,
            type: 'INFO',
            link: '/admin/members',
          },
        });
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          member,
        },
        accessToken,
        refreshToken,
      };
    });
  }

  static async refreshToken(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new AppError('Refresh token tidak ditemukan', 401);
    }

    // 1. Verify token signature
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new AppError('Refresh token telah kedaluwarsa atau tidak valid', 401);
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        member: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!user || !user.refreshToken) {
      throw new AppError('Sesi tidak ditemukan atau telah keluar', 401);
    }

    // 3. Compare with saved hashed refresh token
    const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isMatch) {
      throw new AppError('Refresh token telah dicabut atau diganti', 401);
    }

    // 4. Issue new tokens
    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      memberId: user.member?.id || null,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken({ id: user.id });

    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newHashedRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        member: user.member,
      },
    };
  }

  static async logout(userId, ipAddress, userAgent) {
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          module: 'AUTH',
          details: 'Pengguna keluar dari sistem',
          ipAddress,
          userAgent,
        },
      });
    }
    return true;
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        member: {
          include: {
            region: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    return user;
  }

  static async changePassword({ userId, currentPassword, newPassword, ipAddress, userAgent }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Kata sandi saat ini salah', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        refreshToken: null, // Revoke current session refreshToken for security
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        module: 'AUTH',
        details: 'Pengguna berhasil mengubah kata sandi',
        ipAddress,
        userAgent,
      },
    });

    return true;
  }
}


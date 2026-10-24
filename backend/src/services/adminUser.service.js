import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export const MAX_ADMIN_USERS = 5;

export class AdminUserService {
  /**
   * List all admin accounts
   */
  static async getAllAdminUsers() {
    const admins = await prisma.user.findMany({
      where: {
        role: 'SUPER_ADMIN',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const totalCount = admins.length;
    const remainingSlots = Math.max(0, MAX_ADMIN_USERS - totalCount);

    return {
      admins,
      meta: {
        total: totalCount,
        maxSlots: MAX_ADMIN_USERS,
        remainingSlots,
        isLimitReached: totalCount >= MAX_ADMIN_USERS,
      },
    };
  }

  /**
   * Create a new Super Admin account
   */
  static async createAdminUser({ username, email, password, fullName, phone, currentUserId, ipAddress, userAgent }) {
    // 1. Enforce max 5 admins limit
    const currentAdminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });

    if (currentAdminCount >= MAX_ADMIN_USERS) {
      throw new AppError(
        `Batas maksimal kuota ${MAX_ADMIN_USERS} pengelola Super Admin telah tercapai. Tidak dapat menambah admin baru.`,
        400
      );
    }

    // 2. Check for unique username and email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existing) {
      if (existing.username.toLowerCase() === username.toLowerCase()) {
        throw new AppError(`Username '${username}' sudah digunakan oleh pengguna lain.`, 409);
      }
      throw new AppError(`Email '${email}' sudah terdaftar pada akun lain.`, 409);
    }

    // 3. Hash password with bcrypt 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    return await prisma.$transaction(async (tx) => {
      // 4. Create user record
      const newUser = await tx.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          loginAttempts: 0,
        },
      });

      // 5. Optionally create a paired member record if fullName is provided
      let memberRecord = null;
      if (fullName) {
        let candidateNum = (await tx.member.count()) + 1;
        let memberId = `ADM-${String(candidateNum).padStart(3, '0')}`;
        while (await tx.member.findUnique({ where: { memberId } })) {
          candidateNum++;
          memberId = `ADM-${String(candidateNum).padStart(3, '0')}`;
        }

        memberRecord = await tx.member.create({
          data: {
            userId: newUser.id,
            memberId,
            fullName,
            phone: phone || null,
            status: 'ACTIVE',
            division: 'Dewan Pengelola / Admin',
          },
        });
      }

      // 6. Audit Activity Log
      await tx.activityLog.create({
        data: {
          userId: currentUserId,
          action: 'CREATE_ADMIN',
          module: 'ADMIN_MANAGEMENT',
          details: `Super Admin baru '${username}' (${email}) berhasil ditambahkan oleh ID ${currentUserId}`,
          ipAddress,
          userAgent,
        },
      });

      return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
        member: memberRecord,
      };
    });
  }

  /**
   * Update an existing admin user's details
   */
  static async updateAdminUser({ targetUserId, username, email, fullName, phone, currentUserId, ipAddress, userAgent }) {
    const admin = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { member: true },
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new AppError('Data pengelola Super Admin tidak ditemukan', 404);
    }

    // Check uniqueness if username or email changes
    if (username && username !== admin.username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        throw new AppError(`Username '${username}' sudah digunakan`, 409);
      }
    }

    if (email && email.toLowerCase() !== admin.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existingEmail) {
        throw new AppError(`Email '${email}' sudah terdaftar`, 409);
      }
    }

    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          ...(username && { username }),
          ...(email && { email: email.toLowerCase() }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          updatedAt: true,
          member: true,
        },
      });

      // Update or create member record
      if (fullName || phone) {
        if (admin.member) {
          await tx.member.update({
            where: { id: admin.member.id },
            data: {
              ...(fullName && { fullName }),
              ...(phone !== undefined && { phone }),
            },
          });
        } else if (fullName) {
          let candidateNum = (await tx.member.count()) + 1;
          const memberId = `ADM-${String(candidateNum).padStart(3, '0')}`;
          await tx.member.create({
            data: {
              userId: targetUserId,
              memberId,
              fullName,
              phone: phone || null,
              status: 'ACTIVE',
              division: 'Dewan Pengelola / Admin',
            },
          });
        }
      }

      await tx.activityLog.create({
        data: {
          userId: currentUserId,
          action: 'UPDATE_ADMIN',
          module: 'ADMIN_MANAGEMENT',
          details: `Data pengelola Super Admin '${updatedUser.username}' diperbarui oleh ID ${currentUserId}`,
          ipAddress,
          userAgent,
        },
      });

      return updatedUser;
    });
  }

  /**
   * Reset an admin user's password and immediately revoke their session
   */
  static async resetAdminPassword({ targetUserId, newPassword, currentUserId, ipAddress, userAgent }) {
    const admin = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new AppError('Data pengelola Super Admin tidak ditemukan', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
        refreshToken: null, // Force re-login
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUserId,
        action: 'RESET_ADMIN_PASSWORD',
        module: 'ADMIN_MANAGEMENT',
        details: `Kata sandi akun pengelola '${admin.username}' direset oleh ID ${currentUserId}. Sesi login aktif telah dicabut.`,
        ipAddress,
        userAgent,
      },
    });

    return {
      message: `Kata sandi untuk pengelola '${admin.username}' berhasil direset. Akun tersebut harus login ulang dengan sandi baru.`,
    };
  }

  /**
   * Unlock an admin account that was locked due to brute-force attempts
   */
  static async unlockAdminAccount({ targetUserId, currentUserId, ipAddress, userAgent }) {
    const admin = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new AppError('Data pengelola Super Admin tidak ditemukan', 404);
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: currentUserId,
        action: 'UNLOCK_ADMIN_ACCOUNT',
        module: 'ADMIN_MANAGEMENT',
        details: `Kunci akun pengelola '${admin.username}' telah dibuka secara manual oleh ID ${currentUserId}`,
        ipAddress,
        userAgent,
      },
    });

    return {
      message: `Akun '${admin.username}' berhasil dibuka kembali. Pengguna sekarang dapat mencoba login kembali.`,
    };
  }

  /**
   * Delete an admin user account
   */
  static async deleteAdminUser({ targetUserId, currentUserId, ipAddress, userAgent }) {
    // 1. Prevent self-deletion
    if (targetUserId === currentUserId) {
      throw new AppError('Demi keamanan, Anda tidak dapat menghapus akun Anda sendiri.', 400);
    }

    const admin = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { member: true },
    });

    if (!admin || admin.role !== 'SUPER_ADMIN') {
      throw new AppError('Data pengelola Super Admin tidak ditemukan', 404);
    }

    // 2. Prevent deleting the last remaining admin
    const adminCount = await prisma.user.count({
      where: { role: 'SUPER_ADMIN' },
    });

    if (adminCount <= 1) {
      throw new AppError('Tidak dapat menghapus akun ini karena merupakan satu-satunya Super Admin yang tersisa.', 400);
    }

    // 3. Delete user in transaction
    await prisma.$transaction(async (tx) => {
      // If user has a linked member record, disconnect userId first
      if (admin.member) {
        await tx.member.update({
          where: { id: admin.member.id },
          data: { userId: null },
        });
      }

      await tx.user.delete({
        where: { id: targetUserId },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUserId,
          action: 'DELETE_ADMIN',
          module: 'ADMIN_MANAGEMENT',
          details: `Akun pengelola Super Admin '${admin.username}' (${admin.email}) berhasil dihapus oleh ID ${currentUserId}`,
          ipAddress,
          userAgent,
        },
      });
    });

    return {
      message: `Akun pengelola '${admin.username}' berhasil dihapus dari sistem.`,
    };
  }
}


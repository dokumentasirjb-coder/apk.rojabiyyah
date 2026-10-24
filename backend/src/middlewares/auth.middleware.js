import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './error.middleware.js';
import prisma from '../config/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      throw new AppError('Akses ditolak: Token autentikasi tidak ditemukan', 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Fetch user from DB
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

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan atau telah dihapus', 401);
    }

    // Attach user to req
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      member: user.member || null,
      memberId: user.member?.id || null,
    };

    next();
  } catch (error) {
    next(error);
  }
};


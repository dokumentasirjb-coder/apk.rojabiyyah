import { AppError } from './error.middleware.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Akses tidak diizinkan: Autentikasi diperlukan', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Akses ditolak: Anda tidak memiliki izin untuk tindakan ini', 403));
    }

    next();
  };
};

export const isSuperAdmin = authorize('SUPER_ADMIN');
export const isAnggota = authorize('ANGGOTA');
export const isAnyUser = authorize('SUPER_ADMIN', 'ANGGOTA');


import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response.js';

export class AppError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, {
      statusCode: 422,
      message: 'Validasi data gagal',
      errors: formattedErrors,
    });
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = err.meta?.target ? ` (${err.meta.target})` : '';
      return sendError(res, {
        statusCode: 409,
        message: `Data dengan nilai unik tersebut sudah terdaftar${target}`,
      });
    }
    if (err.code === 'P2025') {
      return sendError(res, {
        statusCode: 404,
        message: 'Data tidak ditemukan atau sudah dihapus',
      });
    }
    if (err.code === 'P2003') {
      return sendError(res, {
        statusCode: 400,
        message: 'Operasi gagal karena relasi data terkait masih ada',
      });
    }
  }

  // 4. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Token otentikasi tidak valid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: 401,
      message: 'Sesi login telah kedaluwarsa, silakan refresh token atau login kembali',
    });
  }

  // 5. Fallback Default 500
  return sendError(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Terjadi kesalahan internal pada server',
  });
};


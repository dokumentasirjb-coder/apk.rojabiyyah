/**
 * Standard API Response Format:
 * { success: boolean, message: string, data: any, meta?: object }
 */

export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = undefined }) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, { statusCode = 500, message = 'Internal Server Error', errors = null }) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};


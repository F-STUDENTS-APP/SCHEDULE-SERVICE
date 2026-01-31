import { Response } from 'express';

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: unknown = null,
  pagination: unknown = null
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    ...(pagination ? { pagination } : {}),
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors: unknown = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

import { Response } from "express";
import { z, ZodError } from "zod";
import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/app-error";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { MulterError } from "multer";

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  const hasPasswordError = errors.some(
    (err) => err.field === "password" || err.field === "newPassword",
  );

  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: hasPasswordError
      ? "Password must contain at least 8 characters, an uppercase letter, a number, and a special character"
      : "Validation failed",
    errors,
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  });
};

const handleMulterError = (error: MulterError) => {
  const messages = {
    LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
    LIMIT_FILE_SIZE: "File size exceeds the limit",
    LIMIT_FILE_COUNT: "Too many files uploaded",
    default: "File upload error",
  };

  return {
    status: HTTPSTATUS.BAD_REQUEST,
    message: messages[error.code as keyof typeof messages] || messages.default,
    error: error.message,
  };
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next,
): any => {
  const errorInfo =
    error && typeof error === "object"
      ? {
          message: (error as Error).message,
          stack: (error as Error).stack,
        }
      : error;

  console.error("Error occurred on PATH:", req.path, "Error:", errorInfo);

  if (error instanceof ZodError) {
    return formatZodError(res, error);
  }

  if (error instanceof MulterError) {
    const { status, message, error: err } = handleMulterError(error);
    return res.status(status).json({
      message,
      error: err,
      errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknow error occurred",
  });
};

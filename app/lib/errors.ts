// lib/errors.ts
import { NextResponse } from "next/server";
import { logger } from "./logger";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

// Global error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  // Log the error
  logger.error(
    "API Error",
    error instanceof Error ? error : new Error(String(error))
  );

  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A record with this value already exists",
          code: "DUPLICATE_ERROR",
        },
        { status: 409 }
      );
    }

    // Handle foreign key constraint violations
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Related record not found",
          code: "FOREIGN_KEY_ERROR",
        },
        { status: 400 }
      );
    }

    // Handle record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Record not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: "Invalid data provided",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

// Wrapper for API route handlers
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Type definition for validation rules
type ValidationRule = {
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
};

type ValidationSchema<T> = {
  [K in keyof T]: ValidationRule;
};

// Validation helper
export function validate<T extends Record<string, any>>(
  data: any,
  schema: ValidationSchema<T>
): T {
  const errors: string[] = [];

  // Iterate over schema keys with proper typing
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const rules = schema[key];
      const value = data[key];

      // Required check
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${key} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      // Type check
      if (typeof value !== rules.type) {
        errors.push(`${key} must be a ${rules.type}`);
        continue;
      }

      // String validations
      if (rules.type === "string" && typeof value === "string") {
        if (rules.min && value.length < rules.min) {
          errors.push(`${key} must be at least ${rules.min} characters`);
        }
        if (rules.max && value.length > rules.max) {
          errors.push(`${key} must be at most ${rules.max} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} has an invalid format`);
        }
      }

      // Number validations
      if (rules.type === "number" && typeof value === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  return data as T;
}

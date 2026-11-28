// app/lib/errors.ts
import { NextResponse } from "next/server";
import { logger } from "./logger";
import { Prisma } from "@/app/generated/prisma/client";

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

// Strict validation: rejects unknown keys, trims strings and returns only the
// cleaned values. Dependency-free by design.
export type StrictRule = {
  type: "string" | "number" | "boolean" | "date";
  required?: boolean;
  nullable?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  values?: readonly string[];
};

export function validateStrict<T extends Record<string, unknown>>(
  data: unknown,
  schema: Record<string, StrictRule>
): T {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ValidationError("Invalid data: expected an object");
  }

  const input = data as Record<string, unknown>;
  const unknownKeys = Object.keys(input).filter((key) => !(key in schema));
  if (unknownKeys.length > 0) {
    throw new ValidationError(`Unknown field(s): ${unknownKeys.join(", ")}`);
  }

  const cleaned: Record<string, unknown> = {};

  for (const [key, rule] of Object.entries(schema)) {
    const raw = input[key];

    if (raw === undefined) {
      if (rule.required) {
        throw new ValidationError(`${key} is required`);
      }
      continue;
    }

    if (raw === null) {
      if (rule.nullable) {
        cleaned[key] = null;
        continue;
      }
      if (rule.required) {
        throw new ValidationError(`${key} is required`);
      }
      continue;
    }

    if (rule.type === "string") {
      if (typeof raw !== "string") {
        throw new ValidationError(`${key} must be a string`);
      }
      const value = raw.trim();
      if (value.length === 0) {
        if (rule.required) {
          throw new ValidationError(`${key} is required`);
        }
        if ((rule.min ?? 0) > 0) {
          throw new ValidationError(
            `${key} must be at least ${rule.min} characters`
          );
        }
        cleaned[key] = "";
        continue;
      }
      if (rule.min !== undefined && value.length < rule.min) {
        throw new ValidationError(
          `${key} must be at least ${rule.min} characters`
        );
      }
      if (rule.max !== undefined && value.length > rule.max) {
        throw new ValidationError(
          `${key} must be at most ${rule.max} characters`
        );
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        throw new ValidationError(`${key} has an invalid format`);
      }
      if (rule.values && !rule.values.includes(value)) {
        throw new ValidationError(
          `${key} must be one of: ${rule.values.join(", ")}`
        );
      }
      cleaned[key] = value;
      continue;
    }

    if (rule.type === "number") {
      if (typeof raw !== "number" || Number.isNaN(raw)) {
        throw new ValidationError(`${key} must be a number`);
      }
      if (rule.min !== undefined && raw < rule.min) {
        throw new ValidationError(`${key} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && raw > rule.max) {
        throw new ValidationError(`${key} must be at most ${rule.max}`);
      }
      cleaned[key] = raw;
      continue;
    }

    if (rule.type === "boolean") {
      if (typeof raw !== "boolean") {
        throw new ValidationError(`${key} must be a boolean`);
      }
      cleaned[key] = raw;
      continue;
    }

    if (rule.type === "date") {
      if (typeof raw !== "string") {
        throw new ValidationError(`${key} must be an ISO date string`);
      }
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) {
        throw new ValidationError(`${key} must be a valid date`);
      }
      cleaned[key] = parsed;
    }
  }

  return cleaned as T;
}

// Wrapper for API route handlers
// FIXED: Changed 'any' to 'Record<string, unknown>'
export function withErrorHandler(
  handler: (
    req: Request,
    context?: Record<string, unknown>
  ) => Promise<NextResponse>
) {
  return async (req: Request, context?: Record<string, unknown>) => {
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

export function validate<T extends Record<string, unknown>>(
  data: unknown,
  schema: ValidationSchema<T>
): T {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    throw new ValidationError("Invalid data: expected an object");
  }

  const dataObj = data as Record<string, unknown>;

  // Iterate over schema keys with proper typing
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const rules = schema[key];
      const value = dataObj[key];

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

  return dataObj as T;
}

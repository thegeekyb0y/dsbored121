type LogLevel = "info" | "warn" | "error" | "debug";

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // In production, you'd send this to a logging service
    // For now, we'll use console with structured logging
    const logString = JSON.stringify(logData);

    switch (level) {
      case "error":
        console.error(logString);
        break;
      case "warn":
        console.warn(logString);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log("error", message, {
      ...context,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : undefined,
    });
  }

  debug(message: string, context?: Record<string, any>) {
    this.log("debug", message, context);
  }

  // API request logging
  apiRequest(method: string, path: string, userId?: string) {
    this.info("API Request", {
      method,
      path,
      userId,
    });
  }

  apiResponse(method: string, path: string, status: number, duration: number) {
    this.info("API Response", {
      method,
      path,
      status,
      duration: `${duration}ms`,
    });
  }

  // Database query logging
  dbQuery(query: string, duration: number) {
    if (duration > 1000) {
      // Log slow queries
      this.warn("Slow Database Query", {
        query,
        duration: `${duration}ms`,
      });
    } else {
      this.debug("Database Query", {
        query,
        duration: `${duration}ms`,
      });
    }
  }
}

export const logger = new Logger();

// Helper for timing operations
export async function withTiming<T>(
  operation: () => Promise<T>,
  label: string
): Promise<T> {
  const start = Date.now();
  try {
    const result = await operation();
    const duration = Date.now() - start;
    logger.debug(`${label} completed`, { duration: `${duration}ms` });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error(
      `${label} failed`,
      error instanceof Error ? error : new Error(String(error)),
      { duration: `${duration}ms` }
    );
    throw error;
  }
}

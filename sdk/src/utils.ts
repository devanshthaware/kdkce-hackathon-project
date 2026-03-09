/**
 * Sleep/delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const backoffDelay = initialDelay * Math.pow(2, attempt);
        await delay(backoffDelay);
      }
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Create promise that rejects after timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Validate configuration
 */
export function validateConfig(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config) {
    errors.push("Config is required");
    return { valid: false, errors };
  }

  if (!config.apiKey || typeof config.apiKey !== "string") {
    errors.push("apiKey is required and must be a string");
  }

  if (!config.endpoint || typeof config.endpoint !== "string") {
    errors.push("endpoint is required and must be a string");
  }

  if (config.apiKey && config.apiKey.length < 10) {
    errors.push("apiKey seems too short (minimum 10 characters)");
  }

  if (config.endpoint && !config.endpoint.startsWith("http")) {
    errors.push("endpoint must start with http:// or https://");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Create unique request ID for tracking
 */
export function generateRequestId(): string {
  return `aegis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debug logging utility
 */
export function createLogger(debug: boolean = false) {
  return {
    log: (message: string, data?: any) => {
      if (debug) {
        console.log(`[AegisAuth] ${message}`, data || "");
      }
    },
    error: (message: string, error?: any) => {
      if (debug) {
        console.error(`[AegisAuth ERROR] ${message}`, error || "");
      }
    },
  };
}

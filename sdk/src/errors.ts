/**
 * Base error class for all Aegis SDK errors
 */
export class AegisError extends Error {
  public name: string = "AegisError";
  public readonly timestamp = new Date();

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, AegisError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AegisError {
  public name: string = "NetworkError";

  constructor(message: string, public statusCode?: number) {
    super(message);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Invalid API response error
 */
export class InvalidResponseError extends AegisError {
  public name: string = "InvalidResponseError";

  constructor(message: string, public responseData?: any) {
    super(message);
    Object.setPrototypeOf(this, InvalidResponseError.prototype);
  }
}

/**
 * Configuration error
 */
export class ConfigError extends AegisError {
  public name: string = "ConfigError";

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AegisError {
  public name: string = "TimeoutError";

  constructor(message: string, public duration: number) {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

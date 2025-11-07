/**
 * Custom Error Classes für TT-Editor Extension
 */

export class ResourceLoadError extends Error {
  constructor(
    public readonly resourcePath: string,
    public readonly originalError: Error
  ) {
    super(`Failed to load resource: ${resourcePath}. ${originalError.message}`);
    this.name = 'ResourceLoadError';

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceLoadError);
    }
  }
}

export class ValidationError extends Error {
  constructor(
    public readonly data: unknown,
    public readonly validationErrors: string[]
  ) {
    super(`Entity validation failed:\n${validationErrors.join('\n')}`);
    this.name = 'ValidationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

export class GenerationError extends Error {
  constructor(
    public readonly entity: unknown,
    public readonly originalError: Error
  ) {
    super(`HTML generation failed: ${originalError.message}`);
    this.name = 'GenerationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GenerationError);
    }
  }
}

/**
 * Type Guard für Extension Errors
 */
export function isExtensionError(error: unknown): error is ResourceLoadError | ValidationError | GenerationError {
  return error instanceof ResourceLoadError ||
         error instanceof ValidationError ||
         error instanceof GenerationError;
}

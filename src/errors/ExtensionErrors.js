"use strict";
/**
 * Custom Error Classes für ttEditor-LC Extension
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationError = exports.ValidationError = exports.ResourceLoadError = void 0;
exports.isExtensionError = isExtensionError;
class ResourceLoadError extends Error {
    constructor(resourcePath, originalError) {
        super(`Failed to load resource: ${resourcePath}. ${originalError.message}`);
        this.resourcePath = resourcePath;
        this.originalError = originalError;
        this.name = 'ResourceLoadError';
        // Preserve stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ResourceLoadError);
        }
    }
}
exports.ResourceLoadError = ResourceLoadError;
class ValidationError extends Error {
    constructor(data, validationErrors) {
        super(`Entity validation failed:\n${validationErrors.join('\n')}`);
        this.data = data;
        this.validationErrors = validationErrors;
        this.name = 'ValidationError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}
exports.ValidationError = ValidationError;
class GenerationError extends Error {
    constructor(entity, originalError) {
        super(`HTML generation failed: ${originalError.message}`);
        this.entity = entity;
        this.originalError = originalError;
        this.name = 'GenerationError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GenerationError);
        }
    }
}
exports.GenerationError = GenerationError;
/**
 * Type Guard für Extension Errors
 */
function isExtensionError(error) {
    return error instanceof ResourceLoadError ||
        error instanceof ValidationError ||
        error instanceof GenerationError;
}

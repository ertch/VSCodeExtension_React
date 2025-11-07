/**
 * Custom Error Classes für TT-Editor Extension
 */
export declare class ResourceLoadError extends Error {
    readonly resourcePath: string;
    readonly originalError: Error;
    constructor(resourcePath: string, originalError: Error);
}
export declare class ValidationError extends Error {
    readonly data: unknown;
    readonly validationErrors: string[];
    constructor(data: unknown, validationErrors: string[]);
}
export declare class GenerationError extends Error {
    readonly entity: unknown;
    readonly originalError: Error;
    constructor(entity: unknown, originalError: Error);
}
/**
 * Type Guard für Extension Errors
 */
export declare function isExtensionError(error: unknown): error is ResourceLoadError | ValidationError | GenerationError;
//# sourceMappingURL=ExtensionErrors.d.ts.map
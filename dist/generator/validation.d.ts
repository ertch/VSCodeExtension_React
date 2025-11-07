/**
 * Runtime Validation mit Zod
 */
import { z } from 'zod';
import { Entity } from './types';
export declare const EntitySchema: z.ZodType<Entity>;
/**
 * Validate single Entity with conditional validation
 */
export declare function validateEntity(data: unknown, skipValidation?: boolean): Entity;
/**
 * Validate array of Entities
 */
export declare function validateEntities(data: unknown, skipValidation?: boolean): Entity[];
//# sourceMappingURL=validation.d.ts.map
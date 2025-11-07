/**
 * Runtime Validation mit Zod
 */

import { z } from 'zod';
import { Entity, TabPageEntity, StandardEntity } from './types';
import { ValidationError } from '../errors/ExtensionErrors';

// Base Schema
const BaseEntitySchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, 'Entity type cannot be empty'),
});

// TabPage Schema
const TabPageEntitySchema = BaseEntitySchema.extend({
  type: z.literal('TabPage'),
  name: z.string().min(1, 'TabPage name is required'),
  tabIndex: z.number().int().nonnegative('TabIndex must be non-negative'),
});

// Input Value Schema (recursive)
const InputValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(InputValueSchema),
  ])
);

// Entity Inputs Schema
const EntityInputsSchema = z.record(z.string(), InputValueSchema.optional());

// Standard Entity Schema (recursive)
const StandardEntitySchema = z.lazy(() =>
  BaseEntitySchema.extend({
    inputs: EntityInputsSchema,
    children: z.array(EntitySchema).optional(),
  })
);

// Discriminated Union für Entity
export const EntitySchema: z.ZodType<Entity> = z.union([
  TabPageEntitySchema,
  StandardEntitySchema,
]);

/**
 * Validate single Entity with conditional validation
 */
export function validateEntity(data: unknown, skipValidation = false): Entity {
  // Conditional Validation basierend auf Environment
  const shouldValidate = skipValidation
    ? false
    : (process.env.NODE_ENV !== 'production');

  if (!shouldValidate) {
    return data as Entity;
  }

  try {
    return EntitySchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(data, errors);
    }
    throw error;
  }
}

/**
 * Validate array of Entities
 */
export function validateEntities(data: unknown, skipValidation = false): Entity[] {
  const shouldValidate = skipValidation
    ? false
    : (process.env.NODE_ENV !== 'production');

  if (!shouldValidate) {
    return data as Entity[];
  }

  try {
    return z.array(EntitySchema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(data, errors);
    }
    throw error;
  }
}

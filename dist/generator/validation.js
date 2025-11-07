"use strict";
/**
 * Runtime Validation mit Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySchema = void 0;
exports.validateEntity = validateEntity;
exports.validateEntities = validateEntities;
const zod_1 = require("zod");
const ExtensionErrors_1 = require("../errors/ExtensionErrors");
// Base Schema
const BaseEntitySchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    type: zod_1.z.string().min(1, 'Entity type cannot be empty'),
});
// TabPage Schema
const TabPageEntitySchema = BaseEntitySchema.extend({
    type: zod_1.z.literal('TabPage'),
    name: zod_1.z.string().min(1, 'TabPage name is required'),
    tabIndex: zod_1.z.number().int().nonnegative('TabIndex must be non-negative'),
});
// Input Value Schema (recursive)
const InputValueSchema = zod_1.z.lazy(() => zod_1.z.union([
    zod_1.z.string(),
    zod_1.z.number(),
    zod_1.z.boolean(),
    zod_1.z.array(InputValueSchema),
]));
// Entity Inputs Schema
const EntityInputsSchema = zod_1.z.record(zod_1.z.string(), InputValueSchema.optional());
// Standard Entity Schema (recursive)
const StandardEntitySchema = zod_1.z.lazy(() => BaseEntitySchema.extend({
    inputs: EntityInputsSchema,
    children: zod_1.z.array(exports.EntitySchema).optional(),
}));
// Discriminated Union für Entity
exports.EntitySchema = zod_1.z.union([
    TabPageEntitySchema,
    StandardEntitySchema,
]);
/**
 * Validate single Entity with conditional validation
 */
function validateEntity(data, skipValidation = false) {
    // Conditional Validation basierend auf Environment
    const shouldValidate = skipValidation
        ? false
        : (process.env.NODE_ENV !== 'production');
    if (!shouldValidate) {
        return data;
    }
    try {
        return exports.EntitySchema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            throw new ExtensionErrors_1.ValidationError(data, errors);
        }
        throw error;
    }
}
/**
 * Validate array of Entities
 */
function validateEntities(data, skipValidation = false) {
    const shouldValidate = skipValidation
        ? false
        : (process.env.NODE_ENV !== 'production');
    if (!shouldValidate) {
        return data;
    }
    try {
        return zod_1.z.array(exports.EntitySchema).parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            throw new ExtensionErrors_1.ValidationError(data, errors);
        }
        throw error;
    }
}
//# sourceMappingURL=validation.js.map
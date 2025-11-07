"use strict";
/**
 * Validation Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../../src/generator/validation");
const ExtensionErrors_1 = require("../../src/errors/ExtensionErrors");
const entities_1 = require("../fixtures/entities");
describe('Validation', () => {
    describe('validateEntity()', () => {
        it('should validate correct TabPage entity', () => {
            const result = (0, validation_1.validateEntity)(entities_1.TEST_ENTITIES.tabPage);
            expect(result).toEqual(entities_1.TEST_ENTITIES.tabPage);
        });
        it('should validate correct Standard entity', () => {
            const result = (0, validation_1.validateEntity)(entities_1.TEST_ENTITIES.simpleEntity);
            expect(result).toEqual(entities_1.TEST_ENTITIES.simpleEntity);
        });
        it('should throw ValidationError for invalid entity', () => {
            expect(() => {
                (0, validation_1.validateEntity)(entities_1.TEST_ENTITIES.invalidEntity);
            }).toThrow(ExtensionErrors_1.ValidationError);
        });
        it('should throw ValidationError for missing type', () => {
            const invalidEntity = {
                inputs: { name: 'test' }
            };
            expect(() => {
                (0, validation_1.validateEntity)(invalidEntity);
            }).toThrow(ExtensionErrors_1.ValidationError);
        });
        it('should throw ValidationError for TabPage with missing name', () => {
            const invalidTabPage = {
                type: 'TabPage',
                tabIndex: 1
            };
            expect(() => {
                (0, validation_1.validateEntity)(invalidTabPage);
            }).toThrow(ExtensionErrors_1.ValidationError);
        });
        it('should throw ValidationError for TabPage with negative tabIndex', () => {
            const invalidTabPage = {
                type: 'TabPage',
                name: 'Test',
                tabIndex: -1
            };
            expect(() => {
                (0, validation_1.validateEntity)(invalidTabPage);
            }).toThrow(ExtensionErrors_1.ValidationError);
        });
        it('should skip validation when skipValidation=true', () => {
            const result = (0, validation_1.validateEntity)(entities_1.TEST_ENTITIES.invalidEntity, true);
            expect(result).toEqual(entities_1.TEST_ENTITIES.invalidEntity);
        });
    });
    describe('validateEntities()', () => {
        it('should validate array of correct entities', () => {
            const entities = [
                entities_1.TEST_ENTITIES.tabPage,
                entities_1.TEST_ENTITIES.simpleEntity
            ];
            const result = (0, validation_1.validateEntities)(entities);
            expect(result).toHaveLength(2);
            expect(result).toEqual(entities);
        });
        it('should throw ValidationError for array with invalid entity', () => {
            const entities = [
                entities_1.TEST_ENTITIES.simpleEntity,
                entities_1.TEST_ENTITIES.invalidEntity
            ];
            expect(() => {
                (0, validation_1.validateEntities)(entities);
            }).toThrow(ExtensionErrors_1.ValidationError);
        });
        it('should skip validation when skipValidation=true', () => {
            const entities = [entities_1.TEST_ENTITIES.invalidEntity];
            const result = (0, validation_1.validateEntities)(entities, true);
            expect(result).toEqual(entities);
        });
    });
    describe('ValidationError', () => {
        it('should contain validation errors', () => {
            try {
                (0, validation_1.validateEntity)(entities_1.TEST_ENTITIES.invalidEntity);
                fail('Should have thrown ValidationError');
            }
            catch (error) {
                expect(error).toBeInstanceOf(ExtensionErrors_1.ValidationError);
                if (error instanceof ExtensionErrors_1.ValidationError) {
                    expect(error.validationErrors.length).toBeGreaterThan(0);
                    expect(error.data).toEqual(entities_1.TEST_ENTITIES.invalidEntity);
                }
            }
        });
    });
});

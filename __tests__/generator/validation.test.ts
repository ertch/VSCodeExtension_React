/**
 * Validation Tests
 */

import { validateEntity, validateEntities } from '../../src/generator/validation';
import { ValidationError } from '../../src/errors/ExtensionErrors';
import { TEST_ENTITIES } from '../fixtures/entities';

describe('Validation', () => {
  describe('validateEntity()', () => {
    it('should validate correct TabPage entity', () => {
      const result = validateEntity(TEST_ENTITIES.tabPage);

      expect(result).toEqual(TEST_ENTITIES.tabPage);
    });

    it('should validate correct Standard entity', () => {
      const result = validateEntity(TEST_ENTITIES.simpleEntity);

      expect(result).toEqual(TEST_ENTITIES.simpleEntity);
    });

    it('should throw ValidationError for invalid entity', () => {
      expect(() => {
        validateEntity(TEST_ENTITIES.invalidEntity);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing type', () => {
      const invalidEntity = {
        inputs: { name: 'test' }
      };

      expect(() => {
        validateEntity(invalidEntity);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for TabPage with missing name', () => {
      const invalidTabPage = {
        type: 'TabPage',
        tabIndex: 1
      };

      expect(() => {
        validateEntity(invalidTabPage);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for TabPage with negative tabIndex', () => {
      const invalidTabPage = {
        type: 'TabPage',
        name: 'Test',
        tabIndex: -1
      };

      expect(() => {
        validateEntity(invalidTabPage);
      }).toThrow(ValidationError);
    });

    it('should skip validation when skipValidation=true', () => {
      const result = validateEntity(TEST_ENTITIES.invalidEntity, true);

      expect(result).toEqual(TEST_ENTITIES.invalidEntity);
    });
  });

  describe('validateEntities()', () => {
    it('should validate array of correct entities', () => {
      const entities = [
        TEST_ENTITIES.tabPage,
        TEST_ENTITIES.simpleEntity
      ];

      const result = validateEntities(entities);

      expect(result).toHaveLength(2);
      expect(result).toEqual(entities);
    });

    it('should throw ValidationError for array with invalid entity', () => {
      const entities = [
        TEST_ENTITIES.simpleEntity,
        TEST_ENTITIES.invalidEntity
      ];

      expect(() => {
        validateEntities(entities);
      }).toThrow(ValidationError);
    });

    it('should skip validation when skipValidation=true', () => {
      const entities = [TEST_ENTITIES.invalidEntity];

      const result = validateEntities(entities, true);

      expect(result).toEqual(entities);
    });
  });

  describe('ValidationError', () => {
    it('should contain validation errors', () => {
      try {
        validateEntity(TEST_ENTITIES.invalidEntity);
        fail('Should have thrown ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.validationErrors.length).toBeGreaterThan(0);
          expect(error.data).toEqual(TEST_ENTITIES.invalidEntity);
        }
      }
    });
  });
});

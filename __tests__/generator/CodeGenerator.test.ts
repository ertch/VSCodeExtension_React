/**
 * CodeGenerator Tests
 */

import { CodeGenerator } from '../../src/generator/CodeGenerator';
import { TEST_ENTITIES } from '../fixtures/entities';
import { ValidationError, GenerationError } from '../../src/errors/ExtensionErrors';
import { Entity } from '../../src/generator/types';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;

  beforeEach(() => {
    generator = new CodeGenerator();
  });

  describe('generate()', () => {
    it('should generate HTML for simple entity', () => {
      const result = generator.generate(TEST_ENTITIES.simpleEntity, { validate: false });

      expect(result.html).toContain('<Button');
      expect(result.html).toContain('id="btn1"');
      expect(result.html).toContain('class="primary"');
      expect(result.components).toContain('Button');
    });

    it('should generate HTML for nested entities', () => {
      const result = generator.generate(TEST_ENTITIES.nestedEntity, { validate: false });

      expect(result.html).toContain('<Container');
      expect(result.html).toContain('<Button');
      expect(result.html).toContain('<Input');
      expect(result.html).toContain('id="root"');
      expect(result.html).toContain('id="child1"');
      expect(result.html).toContain('id="child2"');
      expect(result.components).toContain('Container');
      expect(result.components).toContain('Button');
      expect(result.components).toContain('Input');
    });

    it('should handle TabPage entities', () => {
      const result = generator.generate(TEST_ENTITIES.tabPage, { validate: false });

      expect(result.html).toContain('<TabPage');
      expect(result.html).toContain('id="TestTab"');
      expect(result.html).toContain('tab="tab1"');
      expect(result.tabs).toHaveLength(1);
      expect(result.tabs[0]).toEqual(['tab1', 'tab_TestTab', 'TestTab']);
    });

    it('should skip Start tab', () => {
      const startTab: Entity = {
        type: 'TabPage',
        name: 'Start',
        tabIndex: 0
      };
      const result = generator.generate(startTab, { validate: false });

      expect(result.tabs).toHaveLength(0);
    });

    it('should handle actions (Triple_List)', () => {
      const result = generator.generate(TEST_ENTITIES.entityWithActions, { validate: false });

      expect(result.html).toContain('actions={[');
      expect(result.html).toContain('["val1", "show", "target1"]');
      expect(result.html).toContain('["val2", "hide", "target2"]');
    });

    it('should handle options (Double_List)', () => {
      const result = generator.generate(TEST_ENTITIES.entityWithActions, { validate: false });

      expect(result.html).toContain('options={[');
      expect(result.html).toContain('["val1", "Label 1"]');
      expect(result.html).toContain('["val2", "Label 2"]');
    });

    it('should handle firstOption (Double_Single)', () => {
      const result = generator.generate(TEST_ENTITIES.complexEntity, { validate: false });

      expect(result.html).toContain('firstOption={["default", "Default Option"]}');
    });

    it('should apply wrapper config', () => {
      const wrapperConfig = {
        before: () => '<!-- Before -->',
        after: () => '<!-- After -->',
        wrapAll: (html: string) => `<wrapper>\n${html}\n</wrapper>`
      };

      const result = generator.generate(TEST_ENTITIES.simpleEntity, {
        wrapperConfig,
        validate: false
      });

      expect(result.html).toContain('<!-- Before -->');
      expect(result.html).toContain('<!-- After -->');
      expect(result.html).toContain('<wrapper>');
      expect(result.html).toContain('</wrapper>');
    });

    it('should throw ValidationError for invalid entity when validate=true', () => {
      expect(() => {
        generator.generate(TEST_ENTITIES.invalidEntity, { validate: true });
      }).toThrow(ValidationError);
    });

    it('should skip validation when validate=false', () => {
      const result = generator.generate(TEST_ENTITIES.invalidEntity, { validate: false });

      expect(result).toBeDefined();
      expect(result.html).toContain('<');
    });

    it('should handle array of entities', () => {
      const entities = [
        TEST_ENTITIES.simpleEntity,
        TEST_ENTITIES.nestedEntity
      ];

      const result = generator.generate(entities, { validate: false });

      expect(result.html).toContain('<Button');
      expect(result.html).toContain('<Container');
      expect(result.components).toContain('Button');
      expect(result.components).toContain('Container');
      expect(result.components).toContain('Input');
    });

    it('should generate proper indentation', () => {
      const result = generator.generate(TEST_ENTITIES.nestedEntity, { validate: false });

      const lines = result.html.split('\n');
      expect(lines[0]).toMatch(/^<Container/); // Root level, no indent
      expect(lines[1]).toMatch(/^  <Button/); // Child level, 2 spaces
      expect(lines[2]).toMatch(/^  <Input/); // Child level, 2 spaces
      expect(lines[3]).toMatch(/^<\/Container>/); // Root level closing
    });

    it('should filter out false boolean attributes', () => {
      const entity = {
        type: 'Button',
        inputs: {
          name: 'btn',
          disabled: false,
          required: true
        }
      };

      const result = generator.generate(entity, { validate: false });

      expect(result.html).not.toContain('disabled');
      expect(result.html).toContain('required');
    });

    it('should filter out empty string attributes', () => {
      const entity = {
        type: 'Button',
        inputs: {
          name: 'btn',
          class: '',
          value: 'test'
        }
      };

      const result = generator.generate(entity, { validate: false });

      expect(result.html).not.toContain('class=""');
      expect(result.html).toContain('value="test"');
    });
  });

  describe('backwards compatibility', () => {
    it('should support deprecated generateHTML function', () => {
      const { generateHTML } = require('../../src/generator/CodeGenerator');

      const result = generateHTML(TEST_ENTITIES.simpleEntity);

      expect(result.html).toContain('<Button');
      expect(result.components).toContain('Button');
    });
  });
});

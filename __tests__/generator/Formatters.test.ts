/**
 * Formatters Tests
 */

import { formatAttribute, buildAttributesString } from '../../src/generator/Formatters';

describe('Formatters', () => {
  describe('formatAttribute()', () => {
    it('should format string attribute', () => {
      const result = formatAttribute('class', 'btn-primary');

      expect(result).toBe('class="btn-primary"');
    });

    it('should format number attribute with curly braces', () => {
      const result = formatAttribute('count', 42);

      expect(result).toBe('count={42}');
    });

    it('should format boolean true as single attribute', () => {
      const result = formatAttribute('required', true);

      expect(result).toBe('required');
    });

    it('should return empty string for boolean false', () => {
      const result = formatAttribute('disabled', false);

      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = formatAttribute('value', '');

      expect(result).toBe('');
    });

    it('should format simple array', () => {
      const result = formatAttribute('values', ['a', 'b', 'c']);

      expect(result).toBe('values={["a", "b", "c"]}');
    });

    it('should format nested array (Double_List)', () => {
      const result = formatAttribute('options', [
        ['val1', 'Label 1'],
        ['val2', 'Label 2']
      ]);

      expect(result).toBe('options={[["val1", "Label 1"], ["val2", "Label 2"]]}');
    });

    it('should format nested array (Triple_List)', () => {
      const result = formatAttribute('actions', [
        ['trigger1', 'action1', 'target1'],
        ['trigger2', 'action2', 'target2']
      ]);

      expect(result).toBe('actions={[["trigger1", "action1", "target1"], ["trigger2", "action2", "target2"]]}');
    });

    it('should format object attribute', () => {
      const result = formatAttribute('config', { key: 'value' });

      expect(result).toBe('config={{\"key\":\"value\"}}');
    });

    it('should escape HTML characters in string', () => {
      const result = formatAttribute('value', '<script>alert("XSS")</script>');

      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&quot;');
      expect(result).not.toContain('<script>');
    });

    it('should escape ampersand', () => {
      const result = formatAttribute('value', 'Tom & Jerry');

      expect(result).toBe('value="Tom &amp; Jerry"');
    });

    it('should escape single quote', () => {
      const result = formatAttribute('value', "It's working");

      expect(result).toBe('value="It&#039;s working"');
    });
  });

  describe('buildAttributesString()', () => {
    it('should build attributes string from record', () => {
      const attributes = {
        id: 'btn1',
        class: 'primary',
        disabled: true
      };

      const result = buildAttributesString(attributes);

      expect(result).toContain('id="btn1"');
      expect(result).toContain('class="primary"');
      expect(result).toContain('disabled');
      expect(result.startsWith(' ')).toBe(true);
    });

    it('should return empty string for empty record', () => {
      const result = buildAttributesString({});

      expect(result).toBe('');
    });

    it('should filter out false booleans', () => {
      const attributes = {
        id: 'btn1',
        disabled: false,
        required: true
      };

      const result = buildAttributesString(attributes);

      expect(result).toContain('required');
      expect(result).not.toContain('disabled');
    });

    it('should filter out empty strings', () => {
      const attributes = {
        id: 'btn1',
        class: '',
        value: 'test'
      };

      const result = buildAttributesString(attributes);

      expect(result).toContain('value="test"');
      expect(result).not.toContain('class=""');
    });

    it('should handle mixed attribute types', () => {
      const attributes = {
        id: 'element',
        count: 5,
        required: true,
        options: [['a', 'A'], ['b', 'B']],
        config: { key: 'value' }
      };

      const result = buildAttributesString(attributes);

      expect(result).toContain('id="element"');
      expect(result).toContain('count={5}');
      expect(result).toContain('required');
      expect(result).toContain('options={[');
      expect(result).toContain('config={');
    });
  });
});

import FieldsConverter from '../util/FieldsConverter';

describe('FieldsConverter', () => {
  describe('getFieldCaption', () => {
    it('returns caption when field exists in fieldsCaptions', () => {
      const fieldsCaptions = { name: 'Name Label', age: 'Age Label' };
      expect(FieldsConverter.getFieldCaption('name', fieldsCaptions)).toBe('Name Label');
    });

    it('returns fieldName when caption does not exist', () => {
      const fieldsCaptions = {};
      expect(FieldsConverter.getFieldCaption('name', fieldsCaptions)).toBe('name');
    });

    it('handles undefined fieldsCaptions', () => {
      expect(FieldsConverter.getFieldCaption('name', undefined)).toBe('name');
    });
  });

  describe('getFieldNameByCaption', () => {
    it('returns fieldName when caption matches', () => {
      const fieldsCaptions = { name: 'Name Label', age: 'Age Label' };
      expect(FieldsConverter.getFieldNameByCaption('Name Label', fieldsCaptions)).toBe('name');
    });

    it('returns original caption when no match found', () => {
      const fieldsCaptions = { name: 'Name Label' };
      expect(FieldsConverter.getFieldNameByCaption('Unknown', fieldsCaptions)).toBe('Unknown');
    });
  });

  describe('convertFieldNameToCaption', () => {
    it('converts field names in template string', () => {
      const fieldsCaptions = { name: 'Name', city: 'City' };
      const result = FieldsConverter.convertFieldNameToCaption('{name} in {city}', fieldsCaptions);
      expect(result).toBe('{Name} in {City}');
    });

    it('keeps unmatched placeholders unchanged', () => {
      const fieldsCaptions = { name: 'Name' };
      const result = FieldsConverter.convertFieldNameToCaption('{name} in {unknown}', fieldsCaptions);
      expect(result).toBe('{Name} in {unknown}');
    });

    it('handles string without placeholders', () => {
      const fieldsCaptions = { name: 'Name' };
      const result = FieldsConverter.convertFieldNameToCaption('Hello World', fieldsCaptions);
      expect(result).toBe('Hello World');
    });
  });

  describe('convertCaptionToFieldName', () => {
    it('converts captions to field names in template string', () => {
      const fieldsCaptions = { name: 'Name', city: 'City' };
      const result = FieldsConverter.convertCaptionToFieldName('{Name} in {City}', fieldsCaptions);
      expect(result).toBe('{name} in {city}');
    });

    it('keeps unmatched placeholders unchanged', () => {
      const fieldsCaptions = { name: 'Name' };
      const result = FieldsConverter.convertCaptionToFieldName('{Name} in {Unknown}', fieldsCaptions);
      expect(result).toBe('{name} in {Unknown}');
    });
  });

  describe('convertTextInfoToFieldName', () => {
    it('converts ops array with field names to captions', () => {
      const fieldsCaptions = { name: 'Name' };
      const ops = [
        { insert: 'Hello {name}' }
      ];
      const result = FieldsConverter.convertTextInfoToFieldName(ops, fieldsCaptions);
      expect(result[0].insert).toBe('Hello {name}');
    });
  });

  describe('convertTextInfoToCaption', () => {
    it('converts ops array with captions to field names', () => {
      const fieldsCaptions = { name: 'Name' };
      const ops = [
        { insert: 'Hello {Name}' }
      ];
      const result = FieldsConverter.convertTextInfoToCaption(ops, fieldsCaptions);
      expect(result[0].insert).toBe('Hello {name}');
    });
  });

  describe('convertFieldNameToCaption with Expression', () => {
    it('converts Expression array field names to captions', () => {
      const fieldsCaptions = { name: 'Name' };
      // Expression 格式: [['get', 'name']]
      const expression = [['get', 'name']];
      const result = FieldsConverter.convertFieldNameToCaption(expression, fieldsCaptions);
      expect(result).toEqual([['get', 'Name']]);
    });

    it('handles nested expression arrays', () => {
      const fieldsCaptions = { value: 'Value' };
      const expression = [['concat', 'prefix', ['get', 'value']]];
      const result = FieldsConverter.convertFieldNameToCaption(expression, fieldsCaptions);
      expect(result).toEqual([['concat', 'prefix', ['get', 'Value']]]);
    });
  });
});

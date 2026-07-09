import ExpressionConverter from '../util/ExpressionConverter';

describe('ExpressionConverter', () => {
  const fields = ['name', 'city', 'url'];

  describe('convertValueToSave', () => {
    it('converts placeholder string to expression', () => {
      const result = ExpressionConverter.convertValueToSave(fields, 'Hello {name}');
      expect(result).toEqual(['concat', 'Hello ', ['get', 'name']]);
    });

    it('returns plain string when no placeholders', () => {
      expect(ExpressionConverter.convertValueToSave(fields, 'Hello World')).toBe('Hello World');
    });

    it('returns falsy value as-is', () => {
      expect(ExpressionConverter.convertValueToSave(fields, '')).toBe('');
      expect(ExpressionConverter.convertValueToSave(fields, null)).toBeNull();
    });
  });

  describe('getStringToExperssion', () => {
    it('converts known field placeholder to get expression', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, '{name}')).toEqual(['concat', ['get', 'name']]);
    });

    it('keeps unknown placeholder as literal string', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, '{unknown}')).toEqual(['concat', '{unknown}']);
    });

    it('handles mixed text and field placeholders', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, 'Hi {name} from {city}')).toEqual([
        'concat',
        'Hi ',
        ['get', 'name'],
        ' from ',
        ['get', 'city']
      ]);
    });

    it('handles placeholder followed by trailing text', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, '{name}!')).toEqual([
        'concat',
        ['get', 'name'],
        '!'
      ]);
    });

    it('handles plain text without placeholders', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, 'plain text')).toEqual(['concat', 'plain text']);
    });

    it('handles unknown placeholder with trailing text', () => {
      expect(ExpressionConverter.getStringToExperssion(fields, '{unknown}!')).toEqual([
        'concat',
        '{unknown}',
        '!'
      ]);
    });
  });

  describe('calcExpressionToString', () => {
    it('converts get expression to placeholder string', () => {
      expect(ExpressionConverter.calcExpressionToString(['get', 'name'])).toBe('{name}');
    });

    it('converts concat expression to joined string', () => {
      expect(
        ExpressionConverter.calcExpressionToString(['concat', 'Hello ', ['get', 'name']])
      ).toBe('Hello {name}');
    });

    it('handles nested expressions', () => {
      expect(
        ExpressionConverter.calcExpressionToString([
          'concat',
          ['concat', ['get', 'name'], ' '],
          ['get', 'city']
        ])
      ).toBe('{name} {city}');
    });

    it('returns subResult when operator is unknown', () => {
      expect(ExpressionConverter.calcExpressionToString(['unknown', 'value'])).toEqual(['value']);
    });
  });

  describe('getUIStringValue', () => {
    it('converts expression array to UI string', () => {
      expect(ExpressionConverter.getUIStringValue(['get', 'name'])).toBe('{name}');
    });

    it('returns plain string as-is', () => {
      expect(ExpressionConverter.getUIStringValue('Hello')).toBe('Hello');
    });
  });

  describe('getTextInfosString', () => {
    it('converts insert and link expressions to UI strings', () => {
      const textInfos = [
        {
          insert: ['concat', 'Visit ', ['get', 'name']],
          attributes: { link: ['get', 'url'], bold: true }
        }
      ];
      const result = ExpressionConverter.getTextInfosString(textInfos);
      expect(result[0].insert).toBe('Visit {name}');
      expect(result[0].attributes.link).toBe('{url}');
    });

    it('keeps plain string insert unchanged', () => {
      const textInfos = [{ insert: 'Hello World' }];
      const result = ExpressionConverter.getTextInfosString(textInfos);
      expect(result[0].insert).toBe('Hello World');
    });
  });

  describe('getTextInfosExpression', () => {
    it('converts insert and link placeholders to expressions when fields provided', () => {
      const textInfos = [
        {
          insert: 'Hello {name}',
          attributes: { link: 'https://example.com/{url}' }
        }
      ];
      const result = ExpressionConverter.getTextInfosExpression(textInfos, fields);
      expect(result[0].insert).toEqual(['concat', 'Hello ', ['get', 'name']]);
      expect(result[0].attributes.link).toEqual([
        'concat',
        'https://example.com/',
        ['get', 'url']
      ]);
    });

    it('returns infos unchanged when fields is empty', () => {
      const textInfos = [{ insert: 'Hello {name}' }];
      const result = ExpressionConverter.getTextInfosExpression(textInfos, []);
      expect(result[0].insert).toBe('Hello {name}');
    });

    it('returns infos unchanged when fields is omitted', () => {
      const textInfos = [{ insert: 'Hello {name}' }];
      const result = ExpressionConverter.getTextInfosExpression(textInfos);
      expect(result[0].insert).toBe('Hello {name}');
    });

    it('skips non-string insert values', () => {
      const insertObj = { type: 'image' };
      const textInfos = [{ insert: insertObj }];
      const result = ExpressionConverter.getTextInfosExpression(textInfos, fields);
      expect(result[0].insert).toBe(insertObj);
    });
  });
});

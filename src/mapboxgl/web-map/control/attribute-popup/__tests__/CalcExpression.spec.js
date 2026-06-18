import calcExpression from '../util/CalcExpression';

describe('CalcExpression', () => {
  describe('basic operations', () => {
    it('handles get operator', () => {
      const attributes = { name: 'test', value: 123 };
      const expression = ['get', 'name'];
      expect(calcExpression(attributes, expression)).toBe('test');
    });

    it('handles get operator with number', () => {
      const attributes = { name: 'test', value: 123 };
      const expression = ['get', 'value'];
      expect(calcExpression(attributes, expression)).toBe(123);
    });

    it('handles concat operator', () => {
      const attributes = { first: 'Hello', last: 'World' };
      const expression = ['concat', ['get', 'first'], ' ', ['get', 'last']];
      expect(calcExpression(attributes, expression)).toBe('Hello World');
    });

    it('handles nested expressions', () => {
      const attributes = { a: '1', b: '2', c: '3' };
      const expression = ['concat', ['get', 'a'], ['get', 'b'], ['get', 'c']];
      expect(calcExpression(attributes, expression)).toBe('123');
    });

    it('handles deeply nested expressions', () => {
      const attributes = { x: 'A', y: 'B', z: 'C' };
      const expression = [
        'concat',
        ['concat', ['get', 'x'], ['get', 'y']],
        ['get', 'z']
      ];
      expect(calcExpression(attributes, expression)).toBe('ABC');
    });
  });

  describe('edge cases', () => {
    it('returns undefined value when attribute not found', () => {
      const attributes = { name: 'test' };
      const expression = ['get', 'nonexistent'];
      expect(calcExpression(attributes, expression)).toBeUndefined();
    });

    it('handles empty attributes object', () => {
      const attributes = {};
      const expression = ['get', 'name'];
      expect(calcExpression(attributes, expression)).toBeUndefined();
    });

    it('handles concat with literal strings', () => {
      const attributes = {};
      const expression = ['concat', 'Hello', 'World'];
      expect(calcExpression(attributes, expression)).toBe('HelloWorld');
    });

    it('handles single value in expression', () => {
      const attributes = {};
      const expression = ['concat', 'Single'];
      expect(calcExpression(attributes, expression)).toBe('Single');
    });
  });
});

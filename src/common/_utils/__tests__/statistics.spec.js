import { statisticsFeatures } from '../statistics';

describe('statisticsFeatures', () => {
  const mockFeatures = [
    { properties: { name: 'Alice', age: 25, city: 'Beijing' } },
    { properties: { name: 'Bob', age: 30, city: 'Shanghai' } },
    { properties: { name: 'Carol', age: 28, city: 'Beijing' } }
  ];

  it('should return correct data structure with provided fields and fieldCaptions', () => {
    const fields = ['name', 'age'];
    const fieldCaptions = ['Name', 'Age'];
    const fieldTypes = ['string', 'number'];

    const result = statisticsFeatures(mockFeatures, fields, fieldCaptions, fieldTypes);

    expect(result.features).toBe(mockFeatures);
    expect(result.fields).toEqual(fields);
    expect(result.fieldCaptions).toEqual(fieldCaptions);
    expect(result.fieldTypes).toBe(fieldTypes);
    expect(result.fieldValues).toEqual([
      ['Alice', 'Bob', 'Carol'],
      [25, 30, 28]
    ]);
  });

  it('should infer fields and fieldCaptions from features when not provided', () => {
    const result = statisticsFeatures(mockFeatures);

    expect(result.fields).toContain('name');
    expect(result.fields).toContain('age');
    expect(result.fields).toContain('city');
    expect(result.fieldCaptions).toEqual(result.fields);
    expect(result.fieldValues.length).toBe(result.fields.length);
    expect(result.fieldValues[0].length).toBe(mockFeatures.length);
  });

  it('should infer fields only when fieldCaptions is provided', () => {
    const fieldCaptions = ['Name', 'Age', 'City'];
    const result = statisticsFeatures(mockFeatures, null, fieldCaptions);

    expect(result.fieldCaptions).toEqual(fieldCaptions);
    expect(result.fields).toContain('name');
    expect(result.fields).toContain('age');
    expect(result.fields).toContain('city');
  });

  it('should handle empty features array', () => {
    const result = statisticsFeatures([], ['name', 'age'], ['Name', 'Age']);

    expect(result.features).toEqual([]);
    expect(result.fieldValues).toEqual([[], []]);
  });

  it('should handle features with missing properties', () => {
    const mixedFeatures = [
      { properties: { name: 'Alice', age: 25 } },
      { properties: { name: 'Bob' } },
      { properties: { age: 28 } }
    ];

    const result = statisticsFeatures(mixedFeatures, ['name', 'age'], ['Name', 'Age']);

    expect(result.fieldValues[0]).toEqual(['Alice', 'Bob', undefined]);
    expect(result.fieldValues[1]).toEqual([25, undefined, 28]);
  });

  it('should preserve originalFields in returned data', () => {
    const originalFields = ['id', 'type'];
    const result = statisticsFeatures(mockFeatures, ['name'], ['Name'], null, originalFields);

    expect(result.originalFields).toEqual(originalFields);
  });

  it('should handle single feature', () => {
    const singleFeature = [{ properties: { name: 'Alice', age: 25 } }];
    const result = statisticsFeatures(singleFeature, ['name', 'age'], ['Name', 'Age']);

    expect(result.fieldValues).toEqual([
      ['Alice'],
      [25]
    ]);
  });

  it('should handle single field', () => {
    const result = statisticsFeatures(mockFeatures, ['name'], ['Name']);

    expect(result.fieldValues).toEqual([['Alice', 'Bob', 'Carol']]);
  });
});
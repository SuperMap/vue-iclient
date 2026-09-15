import {
  buildStructuredDataFieldMap,
  buildStructuredDataInfoUrl
} from '../structured-data-field-map';

describe('buildStructuredDataInfoUrl', () => {
  it('builds the structureddata.json url from a data root', () => {
    expect(buildStructuredDataInfoUrl('https://iportal.example.com/web/datas/123')).toBe(
      'https://iportal.example.com/web/datas/123/structureddata.json'
    );
    expect(buildStructuredDataInfoUrl('https://iportal.example.com/web/datas/123/')).toBe(
      'https://iportal.example.com/web/datas/123/structureddata.json'
    );
  });

  it('drops the query string, which keeps the url aligned with the items url', () => {
    expect(
      buildStructuredDataInfoUrl('https://iportal.example.com/web/datas/123?parentResType=DATA&parentResId=9')
    ).toBe('https://iportal.example.com/web/datas/123/structureddata.json');
  });

  it('keeps an already complete url and returns empty text without a base', () => {
    expect(buildStructuredDataInfoUrl('https://iportal.example.com/web/datas/123/structureddata.json')).toBe(
      'https://iportal.example.com/web/datas/123/structureddata.json'
    );
    expect(buildStructuredDataInfoUrl('https://iportal.example.com/web/datas/123/content.json')).toBe(
      'https://iportal.example.com/web/datas/123/structureddata.json'
    );
    expect(buildStructuredDataInfoUrl('')).toBe('');
    expect(buildStructuredDataInfoUrl(undefined)).toBe('');
  });
});

describe('buildStructuredDataFieldMap', () => {
  it('maps display field names to table field names by index', () => {
    const fieldMap = buildStructuredDataFieldMap({
      fieldNames: ['区站号', '站名', 'geometry'],
      tableFieldNames: ['quzhanhao', 'zhanming', 'geometry']
    });
    expect(fieldMap.toTableField).toEqual({
      区站号: 'quzhanhao',
      站名: 'zhanming',
      geometry: 'geometry'
    });
    expect(fieldMap.toTableFieldLower['区站号']).toBe('quzhanhao');
  });

  it('accepts a response wrapped in data', () => {
    expect(
      buildStructuredDataFieldMap({
        succeed: true,
        data: { fieldNames: ['站名'], tableFieldNames: ['zhanming'] }
      }).toTableField
    ).toEqual({ 站名: 'zhanming' });
  });

  it('ignores incomplete pairs and returns null without usable metadata', () => {
    expect(buildStructuredDataFieldMap({ fieldNames: ['a'], tableFieldNames: [] })).toBeNull();
    expect(buildStructuredDataFieldMap({ fieldNames: [], tableFieldNames: [] })).toBeNull();
    expect(buildStructuredDataFieldMap(null)).toBeNull();
    expect(
      buildStructuredDataFieldMap({ fieldNames: ['a', 'b'], tableFieldNames: ['a1'] }).toTableField
    ).toEqual({ a: 'a1' });
  });
});

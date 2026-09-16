import { mapFilterFieldNames, toAttributeFilter } from '../attribute-filter';

describe('toAttributeFilter', () => {
  it('returns empty text when there is no usable filter', () => {
    expect(toAttributeFilter(undefined)).toBe('');
    expect(toAttributeFilter(null)).toBe('');
    expect(toAttributeFilter('')).toBe('');
    expect(toAttributeFilter([])).toBe('');
    expect(toAttributeFilter(['all'])).toBe('');
    expect(toAttributeFilter(123)).toBe('');
  });

  it('keeps legacy text filters untouched', () => {
    expect(toAttributeFilter("名称 = '北京'")).toBe("名称 = '北京'");
    expect(toAttributeFilter("SMID > 10 AND 名称 = '北京'", 'STRUCTUREDDATA')).toBe(
      "SMID > 10 AND 名称 = '北京'"
    );
  });

  it('converts a mapbox filter expression to SQL', () => {
    expect(toAttributeFilter(['all', ['==', 'NAME', '北京'], ['>', 'SMID', 10]])).toBe(
      "NAME = '北京' AND SMID > 10"
    );
  });

  it('quotes identifiers as CQL for structured data', () => {
    expect(toAttributeFilter(['all', ['==', '名称', '北京']], 'STRUCTUREDDATA')).toBe(
      "\"名称\" = '北京'"
    );
  });

  it('supports in / !in, null checks and any / none relations', () => {
    expect(toAttributeFilter(['any', ['in', 'TYPE', 1, 2]])).toBe('(TYPE IN (1, 2))');
    expect(toAttributeFilter(['all', ['!in', 'TYPE', 'A', 'B']])).toBe("TYPE NOT IN ('A', 'B')");
    expect(toAttributeFilter(['all', ['==', 'NAME', null]])).toBe('NAME IS NULL');
    expect(toAttributeFilter(['all', ['!=', 'NAME', null]])).toBe('NAME IS NOT NULL');
    expect(toAttributeFilter(['none', ['==', 'NAME', 'A'], ['==', 'TYPE', 'B']])).toBe(
      "NOT (NAME = 'A') AND NOT (TYPE = 'B')"
    );
  });

  it('escapes single quotes inside string values', () => {
    expect(toAttributeFilter(['all', ['==', 'NAME', "O'Reilly"]])).toBe("NAME = 'O''Reilly'");
  });
});

describe('mapFilterFieldNames', () => {
  const fieldMap = {
    toTableField: { 区站号: 'quzhanhao', 站名: 'zhanming' },
    toTableFieldLower: { 区站号: 'quzhanhao', 站名: 'zhanming' }
  };

  it('replaces display names with the structured data table field names', () => {
    expect(mapFilterFieldNames(['all', ['==', '区站号', '北京']], fieldMap)).toEqual([
      'all',
      ['==', 'quzhanhao', '北京']
    ]);
  });

  it('keeps names the map does not know and walks logical relations', () => {
    expect(
      mapFilterFieldNames(
        ['any', ['in', '区站号', 'A', 'B'], ['==', '原本就是表字段名', 1], ['!=', '站名', null]],
        fieldMap
      )
    ).toEqual([
      'any',
      ['in', 'quzhanhao', 'A', 'B'],
      ['==', '原本就是表字段名', 1],
      ['!=', 'zhanming', null]
    ]);
  });

  it('returns the expression untouched without a field map', () => {
    const filter = ['all', ['==', '区站号', '北京']];
    expect(mapFilterFieldNames(filter, null)).toBe(filter);
    expect(mapFilterFieldNames('区站号 = 北京', fieldMap)).toBe('区站号 = 北京');
  });

  it('generates CQL with table field names after mapping', () => {
    expect(
      toAttributeFilter(
        mapFilterFieldNames(['all', ['==', '区站号', '北京'], ['>', '站名', 10]], fieldMap),
        'STRUCTUREDDATA'
      )
    ).toBe("\"quzhanhao\" = '北京' AND \"zhanming\" > 10");
  });
});

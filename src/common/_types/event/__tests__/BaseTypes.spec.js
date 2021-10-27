import { StringExt, NumberExt, FunctionExt, ArrayExt } from '../BaseTypes';

describe('BaseTypes', () => {
  it('BaseTypes.StringExt', () => {
    expect(StringExt.startsWith('starts', 'star')).toBeTruthy();
    expect(StringExt.contains('contains', 'tain')).toBeTruthy();
    expect(StringExt.trim(' contains ')).toBe('contains');
    expect(StringExt.camelize('the-base-types')).toBe('theBaseTypes');
    expect(StringExt.format('<span class="test-span">test</span>')).toBe('<span class="test-span">test</span>');
    // expect(StringExt.isNumeric('6.02e23')).toBeTruthy();
    // expect(StringExt.numericIf('157')).toBe('157');
  });
  it('BaseTypes.NumberExt', () => {
    expect(NumberExt.limitSigDigs(3421.564, 4)).toBe(3422);
    expect(NumberExt.format(3421)).toBe('3421');
    expect(NumberExt.format(342.34, 3, 55, '66')).toBe('34266340');
  });

  it('BaseTypes.FunctionExt', () => {
    expect(FunctionExt.False()).toBeFalsy();
    expect(FunctionExt.True()).toBeTruthy();
  });

  it('BaseTypes.ArrayExt', () => {
    expect(
      ArrayExt.filter(
        [1, 2, 3, 4, 5],
        (item) => {
          return item > 2;
        },
        3
      )
    ).toBeTruthy();
  });
});

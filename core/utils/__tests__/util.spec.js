import { formatFontSize } from '../util';

describe('util test', () => {
  it('formatFontSize ', () => {
    expect(formatFontSize(10)).toBe('10px');
    expect(formatFontSize('10px')).toBe('10px');
  });
});

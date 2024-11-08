import { getDateTime, escapeHTML } from '../util';

describe('util test', () => {
  it('getDateTime ', () => {
    expect(getDateTime('date+second+week')).not.toBeNull();
  });
  it('escapeHTML ', () => {
    const data1 = `helfo`
    expect(escapeHTML`helfo`).toBe('helfo');
    const data = `<br>//\helfo`
    expect(escapeHTML`${data}`).toBe('&lt;br&gt;&#x2F;&#x2F;helfo');
    expect(escapeHTML``).toBe('');
  });
});

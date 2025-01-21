import { getDateTime } from '../util';

describe('util test', () => {
  it('getDateTime ', () => {
    expect(getDateTime('date+second+week')).not.toBeNull();
  });
});

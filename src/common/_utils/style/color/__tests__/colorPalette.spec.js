import colorPalette from '../colorPalette';

describe('colorPalette test', () => {
  beforeAll(() => {});

  it('colorPalette', done => {
    const res = colorPalette('#fff', 2);
    expect(res).toBe('#fff2f0');
    done();
  });

  afterAll(() => {});
});

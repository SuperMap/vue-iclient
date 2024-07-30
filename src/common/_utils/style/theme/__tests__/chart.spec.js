import { handleMultiGradient, getMultiColorGroup, chartThemeUtil } from '../chart';
const SuperMap = require('../../../../../../test/unit/mocks/supermap');

describe('chart test', () => {
  beforeAll(() => {});

  it('handleMultiGradient', done => {
    const res = handleMultiGradient([{ colorStops: ['#ff0000', '#ff00ff'] }], 10);
    expect(res.length).not.toBe(5);
    done();
  });

  it('getMultiColorGroup <', done => {
    const res = getMultiColorGroup(['#ff0000', '#ff00ff', '#ffff00', '#ff0002', '#ff0003'], 3);
    expect(res.length).not.toBe(5);
    done();
  });

  it('getMultiColorGroup > colorGroup[0] = object', done => {
    const res = getMultiColorGroup([{ colorStops: ['#ff0000', '#ff00ff'] }], 10);
    expect(res.length).not.toBe(1);
    done();
  });
  it('chartThemeUtil null', done => {
    const res = chartThemeUtil( undefined, undefined, undefined, 217);
    expect(res.backgroundColor).toBe('rgba(255, 255, 255, 0.6)');
    expect(res.title.textStyle.color).toBe('#333');
    expect(res.color.length).toBe(217);
    done();
  });

  afterAll(() => {});
});

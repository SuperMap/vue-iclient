import CompareViewModel from '../CompareViewModel';

jest.mock('mapbox-gl-compare', () => require('@mocks/compare'));

describe('CompareViewModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  })

  it('scroll', () => {
    const viewModel = new CompareViewModel({
      beforeMap: 'beforeMap',
      afterMap: 'afterMap',
      target: 'target'
    });
    expect(viewModel.compare).not.toBeUndefined();
    const originBounds = viewModel.compare._bounds;
    viewModel._onScroll();
    expect(originBounds).not.toEqual(viewModel.compare._bounds);
    expect(originBounds.x).toBe(100);
    expect(viewModel.compare._bounds.x).toBe(300);
  });
});

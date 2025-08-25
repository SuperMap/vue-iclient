let transformCoordinate, transformCoodinates, mockProj4;

beforeEach(() => {
  jest.isolateModules(() => {
    mockProj4 = jest.fn();
    mockProj4.defs = jest.fn(() => 'FAKE_DEF');

    jest.mock('proj4', () => mockProj4);

    ({ transformCoordinate, transformCoodinates } = require('../epsg-define'));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('epsg-define (mock proj4)', () => {
  it('transformCoordinate', () => {
    const coords = [120, 30];

    // same projection
    expect(transformCoordinate('EPSG:4326', 'EPSG:4326', coords)).toEqual(coords);

    // EPSG:4490 <-> EPSG:4326
    expect(transformCoordinate('EPSG:4490', 'EPSG:4326', coords)).toEqual(coords);
    expect(transformCoordinate('EPSG:4326', 'EPSG:4490', coords)).toEqual(coords);

    // EPSG:4214 -> EPSG:4326 with x=180 should keep 180
    mockProj4.mockImplementation(() => [-179, 30]);
    const fixed = transformCoordinate('EPSG:4214', 'EPSG:4326', [180, 30]);
    expect(fixed[0]).toBe(180);

    // normal transform
    mockProj4.mockImplementation(() => [121, 31]);
    const result = transformCoordinate('EPSG:3857', 'EPSG:4326', coords);
    expect(result).toEqual([121, 31]);
  });

  it('transformCoodinates', () => {
    const coords = [120, 30];

    // success
    mockProj4.mockImplementation(() => [121, 31]);
    const result = transformCoodinates({
      coordinates: coords,
      sourceProjection: 'EPSG:3857',
      destProjection: 'EPSG:4326'
    });
    expect(result).toEqual([121, 31]);

    // error
    mockProj4.mockImplementation(() => {
      throw new Error('proj4 error');
    });
    expect(() =>
      transformCoodinates({
        coordinates: coords,
        sourceProjection: 'EPSG:9999',
        destProjection: 'EPSG:4326'
      })
    ).toThrow('Error: proj4 error is not defined');
  });
});
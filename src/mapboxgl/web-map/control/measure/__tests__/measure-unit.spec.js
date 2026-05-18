function loadMeasureUnit() {
  jest.resetModules();
  return require('../measure-unit');
}

const dashboardConfig = {
  measureUnits: {
    distance: ['meters', 'chains'],
    area: ['hectares', 'mu']
  },
  measureUnitConversions: {
    distance: {
      chains: {
        label: 'Chains',
        toMeters: 20.1168
      }
    },
    area: {
      mu: {
        label: 'Mu',
        toSquareMeters: 666.6666667
      }
    }
  }
};

describe('measure-unit', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses built-in registries when dashboard config is missing', () => {
    const measureUnit = loadMeasureUnit();

    expect(measureUnit.getAvailableMeasureUnitKeys({}, 'distance')).toEqual(measureUnit.DISTANCE_UNIT_KEYS);
    expect(measureUnit.getAvailableMeasureUnitKeys({}, 'area')).toEqual(measureUnit.AREA_UNIT_KEYS);
    expect(measureUnit.getMeasureUnitLabel({}, 'distance', 'meters', key => `t:${key}`, 'setting')).toBe(
      't:setting.measure.meters'
    );
    expect(measureUnit.getMeasureUnitLabel({}, 'area', 'meters', key => `t:${key}`)).toBe('t:unit.squaremeters');
  });

  it('builds option maps from configured built-in and custom units', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const measureUnit = loadMeasureUnit();
    const configuredUnits = {
      ...dashboardConfig,
      measureUnits: {
        ...dashboardConfig.measureUnits,
        distance: [...dashboardConfig.measureUnits.distance, 'miles']
      },
      measureUnitConversions: {
        ...dashboardConfig.measureUnitConversions,
        distance: {
          ...dashboardConfig.measureUnitConversions.distance,
          miles: {
            label: 'Miles Override',
            toMeters: 1609.344
          }
        }
      }
    };

    const distanceOptions = measureUnit.getMeasureUnitOptionMap(
      configuredUnits,
      'distance',
      key => `t:${key}`,
      'setting'
    );
    const areaOptions = measureUnit.getMeasureUnitOptionMap(configuredUnits, 'area', key => `t:${key}`);

    expect(distanceOptions).toEqual({
      meters: 't:setting.measure.meters',
      chains: 'Chains',
      miles: 't:setting.measure.miles'
    });
    expect(areaOptions).toEqual({
      hectares: 't:unit.hectares',
      mu: 'Mu'
    });
    expect(measureUnit.getMeasureUnitLabel(configuredUnits, 'area', 'mu', key => `t:${key}`)).toBe('Mu');
    expect(warnSpy).toHaveBeenCalledWith(
      '[measure-units] Ignoring custom distance unit "miles" because built-in units cannot be overridden.'
    );
  });

  it('ignores invalid and duplicate unit entries and warns about them', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const measureUnit = loadMeasureUnit();
    const invalidConfig = {
      measureUnits: {
        distance: ['meters', 'meters', null, 'unknown', 'bad']
      },
      measureUnitConversions: {
        distance: {}
      }
    };

    expect(measureUnit.getAvailableMeasureUnitKeys(invalidConfig, 'distance')).toEqual(['meters']);
    expect(warnSpy.mock.calls.map(args => args[0])).toEqual(
      expect.arrayContaining([
        '[measure-units] Ignoring duplicate distance unit "meters".',
        '[measure-units] Ignoring invalid distance unit entry because units must be configured as strings.',
        '[measure-units] Ignoring distance unit "unknown" because toMeters is missing or invalid.',
        '[measure-units] Ignoring distance unit "bad" because toMeters is missing or invalid.'
      ])
    );
  });

  it('falls back to built-in registries when configured units are all invalid', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const measureUnit = loadMeasureUnit();
    const invalidConfig = {
      measureUnits: {
        distance: ['bad']
      },
      measureUnitConversions: {
        distance: {}
      }
    };

    expect(measureUnit.getAvailableMeasureUnitKeys(invalidConfig, 'distance')).toEqual(measureUnit.DISTANCE_UNIT_KEYS);
    expect(warnSpy).toHaveBeenCalledWith(
      '[measure-units] Ignoring distance unit "bad" because toMeters is missing or invalid.'
    );
  });

  it('falls back to built-in registries for blank configured entries and empty unit keys', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const measureUnit = loadMeasureUnit();
    const invalidConfig = {
      measureUnits: {
        distance: ['', null],
        area: []
      }
    };

    expect(measureUnit.getAvailableMeasureUnitKeys(invalidConfig, 'distance')).toEqual(measureUnit.DISTANCE_UNIT_KEYS);
    expect(measureUnit.getMeasureUnitLabel(invalidConfig, 'distance', '', key => `t:${key}`)).toBe('');
    expect(warnSpy).toHaveBeenCalledWith(
      '[measure-units] Ignoring invalid distance unit entry because units must be configured as strings.'
    );
  });

  it('rejects invalid conversion factors and duplicate custom units', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const measureUnit = loadMeasureUnit();
    const invalidConfig = {
      measureUnits: {
        distance: ['chains', 'chains', 'furlong', 'league']
      },
      measureUnitConversions: {
        distance: {
          chains: {
            label: 'Chains',
            toMeters: 20.1168
          },
          furlong: {
            label: 'Furlong',
            toMeters: ''
          },
          league: {
            label: 'League',
            toMeters: 0
          }
        }
      }
    };

    expect(measureUnit.getAvailableMeasureUnitKeys(invalidConfig, 'distance')).toEqual(['chains']);
    expect(warnSpy.mock.calls.map(args => args[0])).toEqual(
      expect.arrayContaining([
        '[measure-units] Ignoring duplicate distance unit "chains".',
        '[measure-units] Ignoring distance unit "furlong" because toMeters is missing or invalid.',
        '[measure-units] Ignoring distance unit "league" because toMeters is missing or invalid.'
      ])
    );
  });

  it('normalizes default units with current, fallback, and visible unit precedence', () => {
    const measureUnit = loadMeasureUnit();

    expect(measureUnit.ensureMeasureDefaultUnit('feet', ['feet', 'meters'], 'meters')).toBe('feet');
    expect(measureUnit.ensureMeasureDefaultUnit('kilometers', ['meters', 'yards'], 'meters')).toBe('meters');
    expect(measureUnit.ensureMeasureDefaultUnit('kilometers', ['yards', 'feet'], 'meters')).toBe('yards');
    expect(measureUnit.ensureMeasureDefaultUnit('kilometers', [], 'meters')).toBe('meters');
  });

  it('converts native and custom distance and area units', () => {
    const measureUnit = loadMeasureUnit();

    expect(measureUnit.convertMeasureDistance(5, 'meters', 'meters', dashboardConfig)).toBe(5);
    expect(measureUnit.convertMeasureDistance(1, 'kilometers', 'meters', dashboardConfig)).toBeCloseTo(1000, 6);
    expect(measureUnit.convertMeasureDistance(1, 'kilometers', 'chains', dashboardConfig)).toBeCloseTo(49.7097, 4);
    expect(measureUnit.convertMeasureDistance(1, 'chains', 'meters', dashboardConfig)).toBeCloseTo(20.1168, 6);
    expect(measureUnit.convertMeasureDistance('bad', 'meters', 'kilometers', dashboardConfig)).toBe(0);
    expect(measureUnit.convertMeasureArea(1, 'hectares', 'meters', dashboardConfig)).toBeCloseTo(10000, 6);
    expect(measureUnit.convertMeasureArea(2, 'mu', 'meters', dashboardConfig)).toBeCloseTo(1333.3333334, 6);
    expect(measureUnit.convertMeasureArea(10, 'missing', 'meters', dashboardConfig)).toBe(10);
  });
});

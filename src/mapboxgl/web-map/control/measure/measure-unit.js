import { convertArea, convertLength } from '@turf/helpers';

const LEGACY_DISTANCE_UNITS = ['kilometers', 'miles', 'meters', 'feet', 'yards'];
const LEGACY_AREA_UNITS = ['kilometers', 'miles', 'meters', 'feet', 'yards'];

const BUILTIN_UNIT_ORDER = {
  distance: [...LEGACY_DISTANCE_UNITS, 'nauticalmiles'],
  area: [...LEGACY_AREA_UNITS, 'acres', 'hectares']
};

const BUILTIN_TO_BASE_UNIT = {
  distance: {
    kilometers: 1000,
    miles: 1609.344,
    meters: 1,
    feet: 0.3048,
    yards: 0.9144,
    nauticalmiles: 1852
  },
  area: {
    kilometers: 1000000,
    miles: 2589988.110336,
    meters: 1,
    feet: 0.09290304,
    yards: 0.83612736,
    acres: 4046.8564224,
    hectares: 10000
  }
};

const SQUARE_LABEL_UNITS = new Set(LEGACY_AREA_UNITS);

const BUILTIN_REGISTRY_BY_TYPE = {
  distance: BUILTIN_UNIT_ORDER.distance.map(unitKey => createBuiltInUnit('distance', unitKey)),
  area: BUILTIN_UNIT_ORDER.area.map(unitKey => createBuiltInUnit('area', unitKey))
};

const BUILTIN_REGISTRY_MAP_BY_TYPE = Object.keys(BUILTIN_REGISTRY_BY_TYPE).reduce((map, type) => {
  map[type] = createRegistryMap(BUILTIN_REGISTRY_BY_TYPE[type]);
  return map;
}, {});

const warnedMessages = new Set();

export const DISTANCE_UNIT_KEYS = BUILTIN_REGISTRY_BY_TYPE.distance.map(unit => unit.key);
export const AREA_UNIT_KEYS = BUILTIN_REGISTRY_BY_TYPE.area.map(unit => unit.key);

export const DEFAULT_DASHBOARD_MEASURE_UNITS = {
  distance: [...BUILTIN_UNIT_ORDER.distance],
  area: [...BUILTIN_UNIT_ORDER.area]
};

export const DEFAULT_DASHBOARD_MEASURE_CONVERSIONS = {
  distance: {},
  area: {}
};

function createRegistryMap(registry) {
  return registry.reduce((map, unit) => {
    map[unit.key] = unit;
    return map;
  }, {});
}

function createBuiltInUnit(type, key) {
  const labelSuffix = getBuiltInLabelSuffix(type, key);
  return {
    key,
    toBaseUnit: BUILTIN_TO_BASE_UNIT[type][key],
    settingLabelKey: `setting.measure.${labelSuffix}`,
    resultLabelKey: `unit.${labelSuffix}`,
    usesTurfConversion: true
  };
}

function getBuiltInLabelSuffix(type, key) {
  if (type === 'area' && SQUARE_LABEL_UNITS.has(key)) {
    return `square${key}`;
  }
  return key;
}

function cloneUnit(unit) {
  return { ...unit };
}

function getBuiltInRegistry(type) {
  return BUILTIN_REGISTRY_BY_TYPE[type] || [];
}

function getBuiltInRegistryMap(type) {
  return BUILTIN_REGISTRY_MAP_BY_TYPE[type] || {};
}

function getDashboardMeasureUnitsConfig(dashboardConfig = {}) {
  return dashboardConfig.measureUnits || DEFAULT_DASHBOARD_MEASURE_UNITS;
}

function getDashboardMeasureConversionsConfig(dashboardConfig = {}) {
  return dashboardConfig.measureUnitConversions || DEFAULT_DASHBOARD_MEASURE_CONVERSIONS;
}

function warnOnce(message) {
  if (!warnedMessages.has(message)) {
    warnedMessages.add(message);
    console.warn(message);
  }
}

function getCustomConversionField(type) {
  return type === 'distance' ? 'toMeters' : 'toSquareMeters';
}

function getCustomUnitConfig(dashboardConfig, type, unitKey) {
  const conversions = getDashboardMeasureConversionsConfig(dashboardConfig)[type] || {};
  const conversionConfig = conversions[unitKey];
  return conversionConfig && typeof conversionConfig === 'object' ? conversionConfig : null;
}

function normalizeUnitKey(unitKey) {
  return typeof unitKey === 'string' ? unitKey.trim() : '';
}

function getValidConversionFactor(rawValue) {
  if (rawValue === '') {
    return null;
  }
  const factor = Number(rawValue);
  if (!isFinite(factor) || factor <= 0) {
    return null;
  }
  return factor;
}

function getCustomUnitConversionFactor(dashboardConfig, type, unitKey) {
  const conversionConfig = getCustomUnitConfig(dashboardConfig, type, unitKey);
  if (!conversionConfig) {
    return null;
  }
  return getValidConversionFactor(conversionConfig[getCustomConversionField(type)]);
}

function getCustomUnitLabel(dashboardConfig, type, unitKey) {
  const conversionConfig = getCustomUnitConfig(dashboardConfig, type, unitKey);
  const label = typeof conversionConfig?.label === 'string' ? conversionConfig.label.trim() : '';
  return label || null;
}

function createCustomUnit(unitKey, dashboardConfig, type) {
  const key = normalizeUnitKey(unitKey);
  if (!key) {
    return null;
  }
  const factor = getCustomUnitConversionFactor(dashboardConfig, type, key);
  if (!factor) {
    warnOnce(
      `[measure-units] Ignoring ${type} unit "${key}" because ${getCustomConversionField(type)} is missing or invalid.`
    );
    return null;
  }

  return {
    key,
    label: getCustomUnitLabel(dashboardConfig, type, key),
    toBaseUnit: factor,
    isCustom: true,
    settingLabelKey: `setting.measure.${key}`,
    resultLabelKey: `unit.${key}`
  };
}

function getConfiguredRegistryEntries(dashboardConfig, type) {
  const measureUnits = getDashboardMeasureUnitsConfig(dashboardConfig);
  const entries = measureUnits[type];
  return entries instanceof Array ? entries : [];
}

function resolveConfiguredRegistry(dashboardConfig = {}, type) {
  const builtInRegistry = getBuiltInRegistry(type);
  const builtInRegistryMap = getBuiltInRegistryMap(type);
  const configuredEntries = getConfiguredRegistryEntries(dashboardConfig, type);
  if (!configuredEntries.length) {
    return builtInRegistry.map(cloneUnit);
  }

  const seenKeys = new Set();
  const registry = [];

  configuredEntries.forEach(entry => {
    if (typeof entry !== 'string') {
      warnOnce(`[measure-units] Ignoring invalid ${type} unit entry because units must be configured as strings.`);
      return;
    }

    const key = normalizeUnitKey(entry);
    const builtInUnit = builtInRegistryMap[key];
    if (!key) {
      return;
    }
    if (seenKeys.has(key)) {
      warnOnce(`[measure-units] Ignoring duplicate ${type} unit "${key}".`);
      return;
    }
    if (builtInUnit) {
      if (getCustomUnitConfig(dashboardConfig, type, key)) {
        warnOnce(`[measure-units] Ignoring custom ${type} unit "${key}" because built-in units cannot be overridden.`);
      }
      registry.push(cloneUnit(builtInUnit));
      seenKeys.add(key);
      return;
    }

    const customUnit = createCustomUnit(key, dashboardConfig, type);
    if (!customUnit) {
      return;
    }
    registry.push(customUnit);
    seenKeys.add(customUnit.key);
  });

  return registry.length ? registry : builtInRegistry.map(cloneUnit);
}

function resolveRegistryItem(dashboardConfig, type, unitKey) {
  const normalizedUnitKey = normalizeUnitKey(unitKey);
  if (!normalizedUnitKey) {
    return null;
  }
  const configuredUnit = createRegistryMap(getMeasureUnitRegistry(dashboardConfig, type))[normalizedUnitKey];
  return configuredUnit || getBuiltInRegistryMap(type)[normalizedUnitKey] || null;
}

function resolveLabel(unit, translate, labelType) {
  if (!unit) {
    return '';
  }
  if (unit.isCustom && unit.label) {
    return unit.label;
  }
  if (unit.isCustom) {
    return unit.key;
  }
  const labelKey = labelType === 'setting' ? unit.settingLabelKey : unit.resultLabelKey;
  if (typeof translate === 'function' && labelKey) {
    const translatedLabel = translate(labelKey);
    if (translatedLabel && translatedLabel !== labelKey) {
      return translatedLabel;
    }
  }
  return labelKey || unit.key;
}

function toNumber(value) {
  const nextValue = Number(value);
  return isNaN(nextValue) ? 0 : nextValue;
}

function convertByTurfNativeUnit(value, fromUnit, toUnit, type) {
  return type === 'distance' ? convertLength(value, fromUnit, toUnit) : convertArea(value, fromUnit, toUnit);
}

function hasBaseConversion(unit) {
  return typeof unit?.toBaseUnit === 'number' && unit.toBaseUnit > 0;
}

function convertMeasureValue(value, fromUnit, toUnit, dashboardConfig, type) {
  const numericValue = toNumber(value);
  if (fromUnit === toUnit) {
    return numericValue;
  }

  const fromUnitConfig = resolveRegistryItem(dashboardConfig, type, fromUnit);
  const toUnitConfig = resolveRegistryItem(dashboardConfig, type, toUnit);
  if (!fromUnitConfig || !toUnitConfig) {
    return numericValue;
  }

  if (fromUnitConfig.usesTurfConversion && toUnitConfig.usesTurfConversion) {
    return convertByTurfNativeUnit(numericValue, fromUnit, toUnit, type);
  }

  if (!hasBaseConversion(fromUnitConfig) || !hasBaseConversion(toUnitConfig)) {
    return numericValue;
  }

  return (numericValue * fromUnitConfig.toBaseUnit) / toUnitConfig.toBaseUnit;
}

export function getMeasureUnitRegistry(dashboardConfig = {}, type) {
  return resolveConfiguredRegistry(dashboardConfig, type);
}

export function getAvailableMeasureUnitKeys(dashboardConfig = {}, type) {
  return getMeasureUnitRegistry(dashboardConfig, type).map(unit => unit.key);
}

export function getMeasureUnitLabel(dashboardConfig = {}, type, unitKey, translate, labelType = 'result') {
  return resolveLabel(resolveRegistryItem(dashboardConfig, type, unitKey), translate, labelType) || unitKey;
}

export function getMeasureUnitOptionMap(dashboardConfig = {}, type, translate, labelType = 'result') {
  return getMeasureUnitRegistry(dashboardConfig, type).reduce((options, unit) => {
    options[unit.key] = resolveLabel(unit, translate, labelType);
    return options;
  }, {});
}

export function ensureMeasureDefaultUnit(currentUnit, visibleUnits, fallbackUnit) {
  if (!visibleUnits?.length) {
    return fallbackUnit || currentUnit;
  }
  if (visibleUnits.includes(currentUnit)) {
    return currentUnit;
  }
  if (fallbackUnit && visibleUnits.includes(fallbackUnit)) {
    return fallbackUnit;
  }
  return visibleUnits[0];
}

export function convertMeasureDistance(value, fromUnit, toUnit, dashboardConfig = {}) {
  return convertMeasureValue(value, fromUnit, toUnit, dashboardConfig, 'distance');
}

export function convertMeasureArea(value, fromUnit, toUnit, dashboardConfig = {}) {
  return convertMeasureValue(value, fromUnit, toUnit, dashboardConfig, 'area');
}

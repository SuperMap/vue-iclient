import clonedeep from 'lodash.clonedeep';
import { shouldTransformArabicNumbers, toArabicNumber } from './arabic-number';

const HTML_TAG_PATTERN = /(<[^>]*>)/;
const HTML_TAG_ONLY_PATTERN = /^<[^>]*>$/;
const ECHARTS_RICH_TEXT_PATTERN = /\{([^{}|]+)\|([^{}]*)\}/g;
const AXIS_LABEL_PATCH_FLAG = '__iclientArabicDigitsAxisLabelPatch__';
const AXIS_POINTER_LABEL_PATCH_FLAG = '__iclientArabicDigitsAxisPointerLabelPatch__';
const TOOLTIP_CONTENT_PATCH_FLAG = '__iclientArabicDigitsTooltipContentPatch__';

function getDisplayValue(value) {
  return value == null ? '' : String(value);
}

function formatRichText(text) {
  let result = '';
  let lastIndex = 0;
  let matched = false;
  let match;

  // Rich-text style names are option keys (for example, `color_1`) and must
  // remain ASCII. Convert only the visible content in each token.
  ECHARTS_RICH_TEXT_PATTERN.lastIndex = 0;
  while ((match = ECHARTS_RICH_TEXT_PATTERN.exec(text))) {
    matched = true;
    result += toArabicNumber(text.slice(lastIndex, match.index));
    result += `{${match[1]}|${toArabicNumber(match[2])}}`;
    lastIndex = match.index + match[0].length;
  }

  return matched ? result + toArabicNumber(text.slice(lastIndex)) : toArabicNumber(text);
}

function convertArabicDigitsInHtmlText(text) {
  return text
    .split(HTML_TAG_PATTERN)
    .map(part => (HTML_TAG_ONLY_PATTERN.test(part) ? part : formatRichText(part)))
    .join('');
}

function formatDisplayText(value, preserveTooltipMarkup = false) {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return value;
  }
  const text = String(value);
  if (!shouldTransformArabicNumbers()) {
    return text;
  }
  if (!preserveTooltipMarkup) {
    return formatRichText(text);
  }
  return convertArabicDigitsInHtmlText(text);
}

function getSeriesFormatterValue(params) {
  const first = (Array.isArray(params) ? params : [params])[0] || {};
  const rawValue = first.value != null ? first.value : first.data;
  return Array.isArray(rawValue) ? rawValue.join(', ') : rawValue;
}

function getTemplateVariableValue(params, alias, index) {
  const list = Array.isArray(params) ? params : [params];
  const item = list[index] || {};
  const aliases = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const defaultVariables = ['seriesName', 'name', 'value', 'percent', 'dataIndex'];
  const key = (item.$vars || defaultVariables)[aliases.indexOf(alias)];
  return key === 'value' ? getSeriesFormatterValue(item) : item[key];
}

function formatSeriesTemplate(formatter, params) {
  const list = Array.isArray(params) ? params : [params];
  return formatDisplayText(
    formatter.replace(/\{([a-g])(\d*)\}/g, (match, alias, index) => {
      return getDisplayValue(getTemplateVariableValue(list, alias, Number(index) || 0));
    })
  );
}

export function wrapChartFormatter(formatter, options = {}) {
  const {
    axis = false,
    dataZoom = false,
    radarName = false,
    preserveNativeAxis = false
  } = options;
  const formatResult = result => formatDisplayText(result);

  if (typeof formatter === 'function') {
    return function chartArabicDigitsFormatter(...args) {
      return formatResult(formatter.apply(this, args));
    };
  }

  if (typeof formatter === 'string') {
    // ECharts 4 expands axis string templates with scale.getLabel internally.
    // Replacing the template with a function loses native precision and time formatting.
    if (axis && preserveNativeAxis) {
      return formatter;
    }
    if (axis || dataZoom || radarName) {
      return function chartArabicDigitsValueFormatter(value, valueText) {
        const displayValue = dataZoom && valueText != null ? valueText : value;
        return formatResult(formatter.replace(/\{value\}/g, getDisplayValue(displayValue)));
      };
    }
    return function chartArabicDigitsTemplateFormatter(params) {
      return formatSeriesTemplate(formatter, params);
    };
  }

  if (axis || dataZoom || radarName) {
    if (axis && preserveNativeAxis) {
      return formatter;
    }
    const defaultFormatter = function chartArabicDigitsDefaultFormatter(value, valueText) {
      const displayValue = dataZoom && valueText != null ? valueText : value;
      return formatResult(displayValue);
    };
    return defaultFormatter;
  }

  return formatter;
}

/**
 * ECharts 4 creates native value and time axis labels after option formatters
 * run. Convert that final display value so its native precision and date
 * formatting remain intact.
 */
export function installArabicAxisLabelFormatter(Axis) {
  if (!Axis || !Axis.prototype || Axis.prototype[AXIS_LABEL_PATCH_FLAG]) {
    return;
  }

  const getViewLabels = Axis.prototype.getViewLabels;
  if (typeof getViewLabels !== 'function') {
    return;
  }

  Object.defineProperty(Axis.prototype, AXIS_LABEL_PATCH_FLAG, {
    value: true,
    configurable: true
  });

  Axis.prototype.getViewLabels = function chartArabicDigitsViewLabels(...args) {
    const labels = getViewLabels.apply(this, args);
    if (!Array.isArray(labels)) {
      return labels;
    }

    if (!shouldTransformArabicNumbers()) {
      return labels;
    }
    let changed = false;
    const nextLabels = labels.map(label => {
      if (!label || typeof label !== 'object') {
        return label;
      }
      const formattedLabel = formatDisplayText(label.formattedLabel);
      if (formattedLabel === label.formattedLabel) {
        return label;
      }
      changed = true;
      return { ...label, formattedLabel };
    });

    return changed ? nextLabels : labels;
  };
}

function formatAxisPointerLabelOption(option) {
  const style = option && option.label && option.label.style;
  if (!style) {
    return;
  }
  const text = formatDisplayText(style.text);
  if (text !== style.text) {
    style.text = text;
  }
}

/**
 * Axis pointer labels and axis-triggered tooltip headers are formatted on a
 * separate ECharts path, so they do not pass through Axis#getViewLabels.
 */
export function installArabicAxisPointerLabelFormatter(axisPointerViewHelper) {
  if (!axisPointerViewHelper || axisPointerViewHelper[AXIS_POINTER_LABEL_PATCH_FLAG]) {
    return;
  }

  const { getValueLabel, buildLabelElOption, buildCartesianSingleLabelElOption } = axisPointerViewHelper;
  if (
    typeof getValueLabel !== 'function' &&
    typeof buildLabelElOption !== 'function' &&
    typeof buildCartesianSingleLabelElOption !== 'function'
  ) {
    return;
  }

  Object.defineProperty(axisPointerViewHelper, AXIS_POINTER_LABEL_PATCH_FLAG, {
    value: true,
    configurable: true
  });

  if (typeof getValueLabel === 'function') {
    axisPointerViewHelper.getValueLabel = function chartArabicDigitsAxisPointerValueLabel(...args) {
      return formatDisplayText(getValueLabel.apply(this, args));
    };
  }
  if (typeof buildLabelElOption === 'function') {
    axisPointerViewHelper.buildLabelElOption = function chartArabicDigitsAxisPointerLabelOption(...args) {
      const result = buildLabelElOption.apply(this, args);
      formatAxisPointerLabelOption(args[0]);
      return result;
    };
  }
  if (typeof buildCartesianSingleLabelElOption === 'function') {
    axisPointerViewHelper.buildCartesianSingleLabelElOption = function chartArabicDigitsCartesianAxisPointerLabelOption(
      ...args
    ) {
      const result = buildCartesianSingleLabelElOption.apply(this, args);
      formatAxisPointerLabelOption(args[1]);
      return result;
    };
  }
}

/**
 * Tooltip strings are finalized by these content instances, after ECharts has
 * expanded its own template formatter and async formatter callback.
 */
export function installArabicTooltipContentFormatter(...TooltipContents) {
  TooltipContents.forEach(TooltipContent => {
    if (!TooltipContent || !TooltipContent.prototype || TooltipContent.prototype[TOOLTIP_CONTENT_PATCH_FLAG]) {
      return;
    }

    const setContent = TooltipContent.prototype.setContent;
    if (typeof setContent !== 'function') {
      return;
    }

    Object.defineProperty(TooltipContent.prototype, TOOLTIP_CONTENT_PATCH_FLAG, {
      value: true,
      configurable: true
    });

    TooltipContent.prototype.setContent = function chartArabicDigitsTooltipContent(content, ...args) {
      return setContent.call(this, formatDisplayText(content, true), ...args);
    };
  });
}

function forEachOptionItem(option, callback) {
  const items = Array.isArray(option) ? option : [option];
  items.forEach(item => {
    if (item && typeof item === 'object') {
      callback(item);
    }
  });
}

function ensureAxisArabicDigits(axis) {
  if (!axis) {
    return axis;
  }
  forEachOptionItem(axis, item => {
    if (item.axisLabel && item.axisLabel !== false && item.axisLabel.formatter != null) {
      // ECharts uses an axis formatter while measuring `containLabel`.
      // Keep native axes formatter-free so that measurement and rendering
      // both use ECharts' original precision and time-label formatting.
      item.axisLabel.formatter = wrapChartFormatter(item.axisLabel.formatter, {
        axis: true,
        preserveNativeAxis: true
      });
    }
    if (item.name != null) {
      item.name = formatDisplayText(item.name);
    }
  });
  return axis;
}

function wrapSeriesLabel(label) {
  if (label && typeof label === 'object' && label.formatter != null) {
    label.formatter = wrapChartFormatter(label.formatter);
  }
}

function ensureGaugeArabicDigits(series) {
  if (series.axisLabel !== false) {
    series.axisLabel = series.axisLabel || {};
    series.axisLabel.formatter = wrapChartFormatter(series.axisLabel.formatter, { axis: true });
  }
  if (series.detail !== false) {
    series.detail = series.detail || {};
    series.detail.formatter = wrapChartFormatter(series.detail.formatter, { axis: true });
  }
}

function ensureSeriesArabicDigits(series) {
  if (!series) {
    return series;
  }
  forEachOptionItem(series, item => {
    wrapSeriesLabel(item.label && item.label.normal);
    wrapSeriesLabel(item.label);
    wrapSeriesLabel(item.endLabel);
    if (item.type === 'gauge') {
      ensureGaugeArabicDigits(item);
    }
  });
  return series;
}

function wrapLegendPageFormatter(formatter) {
  if (typeof formatter === 'function') {
    return function chartArabicDigitsPageFormatter(...args) {
      return formatDisplayText(formatter.apply(this, args));
    };
  }
  if (typeof formatter === 'string') {
    return function chartArabicDigitsPageTemplateFormatter(params) {
      return formatDisplayText(
        formatter
          .replace(/\{current\}/g, getDisplayValue(params && params.current))
          .replace(/\{total\}/g, getDisplayValue(params && params.total))
      );
    };
  }
  return function chartArabicDigitsDefaultPageFormatter(params) {
    return formatDisplayText(`${getDisplayValue(params && params.current)}/${getDisplayValue(params && params.total)}`);
  };
}

function wrapLegendFormatter(formatter) {
  if (typeof formatter === 'function') {
    return function chartArabicDigitsLegendFormatter(...args) {
      return formatDisplayText(formatter.apply(this, args));
    };
  }
  if (typeof formatter === 'string') {
    return function chartArabicDigitsLegendTemplateFormatter(name) {
      return formatDisplayText(formatter.replace(/\{name\}/g, getDisplayValue(name)));
    };
  }
  return function chartArabicDigitsDefaultLegendFormatter(name) {
    return formatDisplayText(name);
  };
}

function ensureLegendArabicDigits(legend) {
  if (!legend) {
    return legend;
  }
  forEachOptionItem(legend, item => {
    item.formatter = wrapLegendFormatter(item.formatter);
    item.pageFormatter = wrapLegendPageFormatter(item.pageFormatter);
  });
  return legend;
}

function ensureRadarArabicDigits(radar) {
  if (!radar) {
    return radar;
  }
  forEachOptionItem(radar, item => {
    const nameFormatter = item.name && typeof item.name === 'object' && item.name.formatter;

    if (Array.isArray(item.indicator)) {
      item.indicator.forEach(indicator => {
        if (!indicator || typeof indicator !== 'object') {
          return;
        }
        if (indicator.name != null) {
          indicator.name = formatDisplayText(indicator.name);
        }
        if (indicator.text != null) {
          indicator.text = formatDisplayText(indicator.text);
        }
      });
    } else if (item.indicator && typeof item.indicator === 'object') {
      Object.keys(item.indicator).forEach(key => {
        const indicator = item.indicator[key];
        if (!indicator || typeof indicator !== 'object') {
          return;
        }
        if (indicator.name != null) {
          indicator.name = formatDisplayText(indicator.name);
        }
        if (indicator.text != null) {
          indicator.text = formatDisplayText(indicator.text);
        }
      });
    }
    if (item.name && typeof item.name === 'object') {
      item.name.formatter = wrapChartFormatter(nameFormatter, { radarName: true });
    }
  });
  return radar;
}

function ensureDataZoomArabicDigits(dataZoom) {
  if (!dataZoom) {
    return dataZoom;
  }
  forEachOptionItem(dataZoom, item => {
    if (item.labelFormatter != null || item.type === 'slider') {
      item.labelFormatter = wrapChartFormatter(item.labelFormatter, { dataZoom: true });
    }
  });
  return dataZoom;
}

export function applyArabicDigitsToChartOptions(options) {
  if (!options || typeof options !== 'object' || !shouldTransformArabicNumbers()) {
    return options;
  }

  const next = clonedeep(options);
  next.xAxis = ensureAxisArabicDigits(next.xAxis);
  next.yAxis = ensureAxisArabicDigits(next.yAxis);
  next.angleAxis = ensureAxisArabicDigits(next.angleAxis);
  next.radiusAxis = ensureAxisArabicDigits(next.radiusAxis);
  next.singleAxis = ensureAxisArabicDigits(next.singleAxis);
  next.parallelAxis = ensureAxisArabicDigits(next.parallelAxis);
  next.series = ensureSeriesArabicDigits(next.series);
  next.legend = ensureLegendArabicDigits(next.legend);
  next.radar = ensureRadarArabicDigits(next.radar);
  next.dataZoom = ensureDataZoomArabicDigits(next.dataZoom);
  return next;
}

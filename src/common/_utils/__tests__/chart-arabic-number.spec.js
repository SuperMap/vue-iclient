import {
  applyArabicDigitsToChartOptions,
  installArabicAxisLabelFormatter,
  installArabicAxisPointerLabelFormatter,
  installArabicTooltipContentFormatter,
  wrapChartFormatter
} from '../chart-arabic-number';

describe('chart arabic number utility', () => {
  let previousDirection;

  beforeEach(() => {
    previousDirection = document.documentElement.getAttribute('dir');
    document.documentElement.setAttribute('dir', 'ltr');
  });

  afterEach(() => {
    if (previousDirection === null) {
      document.documentElement.removeAttribute('dir');
    } else {
      document.documentElement.setAttribute('dir', previousDirection);
    }
  });

  it('returns the original options in LTR', () => {
    const options = { yAxis: [{ axisLabel: {} }], series: [{ type: 'bar', data: [1, 2] }] };

    expect(applyArabicDigitsToChartOptions(options)).toBe(options);
  });

  it('converts axes and preserves rich-text style keys in RTL', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const options = {
      yAxis: [
        {
          name: 'Value 10',
          axisLabel: {
            formatter: value => `{color_1|${value}} Name 10`,
            rich: { color_1: { color: 'red' } }
          }
        }
      ]
    };

    const next = applyArabicDigitsToChartOptions(options);
    const formatter = next.yAxis[0].axisLabel.formatter;

    expect(next).not.toBe(options);
    expect(next.yAxis[0].name).toBe('Value ١٠');
    expect(formatter(2)).toBe('{color_1|٢} Name ١٠');
    expect(next.yAxis[0].axisLabel.rich.color_1).toBeDefined();
    expect(next.yAxis[0].axisLabel.rich.color_١).toBeUndefined();
  });

  it('does not inject a formatter for a native axis label', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const options = { yAxis: { axisLabel: {} } };
    const next = applyArabicDigitsToChartOptions(options);

    expect(next.yAxis.axisLabel.formatter).toBeUndefined();
  });

  it('preserves native ECharts string axis templates', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const formatter = '{value} km';
    const options = { yAxis: { axisLabel: { formatter } } };
    const next = applyArabicDigitsToChartOptions(options);

    expect(next.yAxis.axisLabel.formatter).toBe(formatter);
  });

  it('converts final native axis labels without replacing the axis formatter', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const sourceLabels = [{ formattedLabel: '1,234.50', rawLabel: '1,234.50', tickValue: 1234.5 }];
    function Axis() {}
    Axis.prototype.getViewLabels = () => sourceLabels;
    Axis.prototype.getLabelModel = () => ({ get: () => undefined });

    installArabicAxisLabelFormatter(Axis);
    const labels = new Axis().getViewLabels();

    expect(labels).toEqual([{ formattedLabel: '١,٢٣٤.٥٠', rawLabel: '1,234.50', tickValue: 1234.5 }]);
    expect(sourceLabels[0].formattedLabel).toBe('1,234.50');
  });

  it('converts final custom axis labels without changing rich-text style keys', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const sourceLabels = [{ formattedLabel: '{color_0|2} km', rawLabel: '2', tickValue: 2 }];
    function Axis() {}
    Axis.prototype.getViewLabels = () => sourceLabels;
    Axis.prototype.getLabelModel = () => ({ get: () => value => value });

    installArabicAxisLabelFormatter(Axis);
    const labels = new Axis().getViewLabels();

    expect(labels).toEqual([{ formattedLabel: '{color_0|٢} km', rawLabel: '2', tickValue: 2 }]);
    expect(sourceLabels[0].formattedLabel).toBe('{color_0|2} km');
  });

  it('converts axis-pointer labels without changing their native formatting', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const axisPointerViewHelper = {
      getValueLabel: () => '1,234.50',
      buildLabelElOption: option => {
        option.label = { style: { text: '1,234.50' } };
      },
      buildCartesianSingleLabelElOption: (value, option) => {
        option.label = { style: { text: `Value ${value}` } };
      }
    };

    installArabicAxisPointerLabelFormatter(axisPointerViewHelper);

    const polarOption = {};
    axisPointerViewHelper.buildLabelElOption(polarOption);
    const cartesianOption = {};
    axisPointerViewHelper.buildCartesianSingleLabelElOption(12, cartesianOption);

    expect(axisPointerViewHelper.getValueLabel()).toBe('١,٢٣٤.٥٠');
    expect(polarOption.label.style.text).toBe('١,٢٣٤.٥٠');
    expect(cartesianOption.label.style.text).toBe('Value ١٢');
  });

  it('converts final tooltip content without changing markup attributes', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    function TooltipContent() {}
    TooltipContent.prototype.setContent = content => content;
    function TooltipRichContent() {}
    TooltipRichContent.prototype.setContent = content => content;

    installArabicTooltipContentFormatter(TooltipContent, TooltipRichContent);

    expect(new TooltipContent().setContent('<span style="margin-right:5px">Value 20</span>')).toBe(
      '<span style="margin-right:5px">Value ٢٠</span>'
    );
    expect(new TooltipRichContent().setContent('{marker1|} Value 20')).toBe('{marker1|} Value ٢٠');
  });

  it('converts gauge axis labels and detail values', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const options = {
      series: [
        {
          type: 'gauge',
          axisLabel: {},
          detail: { formatter: value => Number(value).toFixed(1) }
        }
      ]
    };
    const next = applyArabicDigitsToChartOptions(options);

    expect(next.series[0].axisLabel.formatter(10)).toBe('١٠');
    expect(next.series[0].detail.formatter(2.1)).toBe('٢.١');
  });

  it('converts legend, radar and dataZoom display values', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const options = {
      legend: { formatter: '{name}', pageFormatter: '{current}/{total}' },
      radar: {
        indicator: [{ name: 'Axis 1' }],
        name: { formatter: 'Indicator {value}' }
      },
      dataZoom: [{ type: 'slider' }]
    };
    const next = applyArabicDigitsToChartOptions(options);

    expect(next.legend.formatter('Series 2')).toBe('Series ٢');
    expect(next.legend.pageFormatter({ current: 1, total: 3 })).toBe('١/٣');
    expect(next.radar.indicator[0].name).toBe('Axis ١');
    expect(next.radar.name.formatter('Axis 4')).toBe('Indicator Axis ٤');
    expect(next.dataZoom[0].labelFormatter(5)).toBe('٥');
  });

  it('wraps a formatter without changing non-display return values', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const formatter = wrapChartFormatter(value => ({ value }));

    expect(formatter(2)).toEqual({ value: 2 });
  });
});

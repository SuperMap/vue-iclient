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

  it('formats template values from arrays, custom vars and array data', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const formatter = wrapChartFormatter('{a}: {b}: {c}');
    expect(
      formatter([
        {
          seriesName: 'Series 1',
          name: 'Item 2',
          value: [3, 4]
        }
      ])
    ).toBe('Series ١: Item ٢: ٣, ٤');

    const dataFormatter = wrapChartFormatter('{c}');
    expect(dataFormatter({ data: 8 })).toBe('٨');

    const customFormatter = wrapChartFormatter('{a0}/{a1}');
    expect(
      customFormatter([
        { $vars: ['name'], name: 'First 1' },
        { $vars: ['name'], name: 'Second 2' }
      ])
    ).toBe('First ١/Second ٢');
  });

  it('handles dataZoom templates and native formatter passthrough', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const dataZoomFormatter = wrapChartFormatter('{value}%', { dataZoom: true });
    expect(dataZoomFormatter(2, '1.50')).toBe('١.٥٠%');

    const nativeFormatter = wrapChartFormatter('{value}', { axis: true, preserveNativeAxis: true });
    expect(nativeFormatter).toBe('{value}');
    expect(wrapChartFormatter(undefined, { axis: true, preserveNativeAxis: true })).toBeUndefined();
    expect(wrapChartFormatter(null)).toBeNull();
  });

  it('leaves display text unchanged in ltr', () => {
    const formatter = wrapChartFormatter(value => `Value ${value}`);
    expect(formatter(12)).toBe('Value 12');
  });

  it('returns unsupported options unchanged', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    expect(applyArabicDigitsToChartOptions(null)).toBeNull();
    expect(applyArabicDigitsToChartOptions('options')).toBe('options');
  });

  it('formats series, gauge, legend, radar and dataZoom branches', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    const options = {
      xAxis: [null, { name: 10, axisLabel: false }],
      yAxis: [{ axisLabel: { formatter: null } }],
      series: [
        {
          type: 'line',
          label: {
            formatter: value => `Label ${value}`,
            normal: { formatter: value => `Normal ${value}` }
          },
          endLabel: { formatter: value => `End ${value}` }
        },
        { type: 'gauge', axisLabel: false, detail: false }
      ],
      legend: [
        {},
        {
          formatter: name => `Series ${name}`,
          pageFormatter: params => `${params.current}/${params.total}`
        }
      ],
      radar: [
        {
          indicator: { first: { name: 'Axis 1', text: 'Text 2' }, empty: null },
          name: { formatter: value => `Name ${value}` }
        },
        { indicator: null },
        { indicator: [{ name: 'Array axis 3', text: 'Array text 4' }, null] }
      ],
      dataZoom: [
        { type: 'inside', labelFormatter: '{value}' },
        { type: 'slider', labelFormatter: value => `Zoom ${value}` }
      ]
    };

    const next = applyArabicDigitsToChartOptions(options);
    expect(next.xAxis[1].name).toBe('١٠');
    expect(next.series[0].label.formatter(2)).toBe('Label ٢');
    expect(next.series[0].label.normal.formatter(3)).toBe('Normal ٣');
    expect(next.series[0].endLabel.formatter(4)).toBe('End ٤');
    expect(next.series[1].axisLabel).toBe(false);
    expect(next.series[1].detail).toBe(false);
    expect(next.legend[0].formatter()).toBeUndefined();
    expect(next.legend[0].pageFormatter({})).toBe('/');
    expect(next.legend[1].formatter('2')).toBe('Series ٢');
    expect(next.legend[1].pageFormatter({ current: 1, total: 2 })).toBe('١/٢');
    expect(next.radar[0].indicator.first.name).toBe('Axis ١');
    expect(next.radar[0].indicator.first.text).toBe('Text ٢');
    expect(next.radar[0].name.formatter('Name 3')).toBe('Name Name ٣');
    expect(next.radar[2].indicator[0].name).toBe('Array axis ٣');
    expect(next.radar[2].indicator[0].text).toBe('Array text ٤');
    expect(next.dataZoom[0].labelFormatter(2, 'Value 3')).toBe('Value ٣');
    expect(next.dataZoom[1].labelFormatter(4)).toBe('Zoom ٤');
  });

  it('handles axis label installer guards, ltr and mixed labels', () => {
    expect(installArabicAxisLabelFormatter()).toBeUndefined();
    expect(installArabicAxisLabelFormatter({ prototype: {} })).toBeUndefined();

    function EmptyAxis() {}
    installArabicAxisLabelFormatter(EmptyAxis);

    function Axis() {}
    const sourceLabels = [null, 'raw', { formattedLabel: '1' }, { formattedLabel: '1' }, { formattedLabel: 'plain' }];
    Axis.prototype.getViewLabels = () => sourceLabels;
    installArabicAxisLabelFormatter(Axis);
    const wrapped = Axis.prototype.getViewLabels;
    installArabicAxisLabelFormatter(Axis);
    expect(Axis.prototype.getViewLabels).toBe(wrapped);

    expect(new Axis().getViewLabels()).toBe(sourceLabels);
    document.documentElement.setAttribute('dir', 'rtl');
    const labels = new Axis().getViewLabels();
    expect(labels[0]).toBeNull();
    expect(labels[1]).toBe('raw');
    expect(labels[2].formattedLabel).toBe('١');
    expect(labels[4]).toBe(sourceLabels[4]);
    expect(sourceLabels[2].formattedLabel).toBe('1');

    function NonArrayAxis() {}
    NonArrayAxis.prototype.getViewLabels = () => null;
    installArabicAxisLabelFormatter(NonArrayAxis);
    expect(new NonArrayAxis().getViewLabels()).toBeNull();
  });

  it('handles axis pointer installer guards and missing styles', () => {
    expect(installArabicAxisPointerLabelFormatter()).toBeUndefined();
    expect(installArabicAxisPointerLabelFormatter({})).toBeUndefined();

    const helper = {
      buildLabelElOption: option => {
        option.label = {};
      },
      buildCartesianSingleLabelElOption: (value, option) => {
        option.label = { style: {} };
      }
    };
    installArabicAxisPointerLabelFormatter(helper);
    const buildLabel = helper.buildLabelElOption;
    installArabicAxisPointerLabelFormatter(helper);
    expect(helper.buildLabelElOption).toBe(buildLabel);

    const option = {};
    helper.buildLabelElOption(option);
    expect(option.label).toEqual({});
    const cartesianOption = {};
    helper.buildCartesianSingleLabelElOption(1, cartesianOption);
    expect(cartesianOption.label.style).toEqual({});
  });

  it('handles tooltip installer guards and non-string content', () => {
    expect(installArabicTooltipContentFormatter()).toBeUndefined();
    expect(installArabicTooltipContentFormatter({})).toBeUndefined();

    function NoSetContent() {}
    installArabicTooltipContentFormatter(NoSetContent);

    function TooltipContent() {}
    TooltipContent.prototype.setContent = (content, extra) => [content, extra];
    installArabicTooltipContentFormatter(TooltipContent);
    const setContent = TooltipContent.prototype.setContent;
    installArabicTooltipContentFormatter(TooltipContent);
    expect(TooltipContent.prototype.setContent).toBe(setContent);

    document.documentElement.setAttribute('dir', 'rtl');
    expect(new TooltipContent().setContent(12, 'extra')).toEqual(['١٢', 'extra']);
  });
});

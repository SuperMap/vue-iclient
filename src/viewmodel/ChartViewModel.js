import echarts from "echarts";
import WidgetViewModel from './WidgetViewModel';
import iServerRestService from '../utils/iServerRestService';
import iPortalDataService from '../utils/iPortalDataService';
import clonedeep from 'lodash.clonedeep';
import tonumber from 'lodash.tonumber';

/**
 * @class ChartViewModel
 * @classdesc 图表微件功能类
 * @param {string} chartContainer - 图表 DOM 元素。
 * @param {Object} options - 可选参数。
 * @param {string} options.type - 图表类型。
 * @param {SuperMap.Widgets.Chart.Datasets} options.datasets - 数据来源。
 * @param {Array.<Object>} options.chartOptions - 图表可选参数。
 * @param {Array.<Object>} options.chartOptions.xAxis - 图表X轴。
 * @param {string} options.chartOptions.xAxis.field - 图表X轴字段名。
 * @param {string} options.chartOptions.xAxis.name - 图表X轴名称。
 * @param {Array.<Object>} options.chartOptions.yAxis - 图表Y轴。
 * @param {string} options.chartOptions.yAxis.field - 图表Y轴字段名。
 * @param {string} options.chartOptions.yAxis.name - 图表Y轴名称。
 * @fires ChartViewModel#getdatafailed
 */

export class ChartViewModel extends WidgetViewModel {

  constructor(chartContainer, options) {
    super();
    this.chartOptions = {
      //x轴是否分类统计
      xFieldStatistical: true,
      //x轴字体是否倾斜
      xAxisLabelRotate: false,
      //y轴字体是否倾斜
      yAxisLabelRotate: false,
      legendPosition: "top", //none top bottom (left right topleft topright bottomleft bottomright暂不支持，位置不好算)
      legendOrient: "horizontal", //'horizontal''vertical'暂不支持,
      yAxisLabelRotate: false,
      yAxisLabelRotate: false,
      xAxisName: "",
      yAxisName: "",
      tooltip: {
        formatter: '{b0}: {c0}'
      },
      backgroundColor: "#fff",
      axisColor: "#333",
      colorGradient: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'],
      padding: {
        top: 30,
        bottom: 40,
        left: 60,
        right: 30
      }
    };
    options.datasets.type = options.datasets.type || 'iServer';
    options.datasets.withCredentials = options.datasets.withCredentials || false;
    this.chartContainer = chartContainer;
    this.chartType = options.type || "bar";
    this.datasets = options.datasets;
    this.xField = [];
    this.yField = [];
    this.chartType = options.type || "bar";
    Object.assign(this.chartOptions, options.chartOptions);
    this._initXYField(this.chartOptions);
    this._initChart();
  }
  setChartType(type) {
    if (type !== this.chartType) {
      this.chartType = type;
      let newOptions = this._updateChartOptions(this.chartType);
      this._updateChart(newOptions);
    }
  }
  setDatasets(datasets) {
    this.updateData(datasets, this.chartOptions)
  }
  setChartOptions(chartOptions) {
    Object.assign(this.chartOptions, chartOptions);
    this._initXYField(chartOptions);
    this._updateDataSuccess();
    //this.updateData(this.datasets, chartOptions)
  }
  resize() {
    this.echart && this.echart.resize();
  }
  // 获取当前的echart
  getEchart() {
    return this.echart;
  }

  updateData(datasets, chartOptions) {
    this.xField = [];
    this.yField = [];
    this._initXYField(chartOptions);
    // type的设置默认值
    datasets.type = datasets.type || 'iServer';
    // withCredentials的设置默认值
    datasets.withCredentials = datasets.withCredentials || false;
    this.datasets = datasets;
    this.getDataSucceedCallback = this._updateDataSuccess;
    this._getData();
  }
  /**
   * @function ChartViewModel.prototype.getStyle
   * @description 获取图表样式。
   */
  getStyle() {
    let style = {
      grid: this.chartOptions.padding,
      tooltip: this.chartOptions.tooltip,
      backgroundColor: this.chartOptions.backgroundColor
    }
    return style;
  }

  /**
   * @function ChartViewModel.prototype.getFeatures
   * @description 获取地图服务，数据服务请求返回的数据。
   */
  getFeatures() {
    return this.features;
  }

  /**
   * @function ChartViewModel.prototype.setStyle
   * @description 设置图表样式。
   * @param {Object} style - 图表样式
   */
  setStyle(style) {
    let newOptions = this._updateChartOptions(this.chartType, style);
    this._updateChart(newOptions);
  }

  _initChart() {
    this.getDataSucceedCallback = this._createChart;
    this._getData();
  }

  _getData() {
    if (this.datasets) {
      if (this.datasets.type === 'iServer') {
        const iServerService = new iServerRestService(this.datasets.url, this.datasets.withCredentials);
        iServerService.on("getdatasucceeded", this.getDataSucceedCallback.bind(this));
        iServerService.getData(this.datasets.queryInfo);
      } else if (this.datasets.type === 'iPortal') {
        const iPortalService = new iPortalDataService(this.datasets.url, this.datasets.withCredentials);
        iPortalService.on("getdatasucceeded", this.getDataSucceedCallback.bind(this));
        iPortalService.getData(this.datasets.queryInfo);
      }
    }
  }

  _updateChartOptions(type, style) {
    if (this.calculatedData) {
      let grid = clonedeep(this.chartOptions.padding);
      let series = this._createChartSeries(this.calculatedData, type);
      let datas = [];
      for (let i in this.calculatedData.XData) {
        datas.push({
          value: this.calculatedData.XData[i]
        });
      }
      let xAxis = {
        type: "category",
        name: this.chartOptions.xAxisName,
        data: datas,
        nameTextStyle: {
          color: this.chartOptions.axisColor,
          fontSize: 14
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          rotate: this.chartOptions.xAxisLabelRotate ? -45 : 0,
          interval: "auto"
        },
        axisLine: {
          lineStyle: {
            color: this.chartOptions.axisColor
          }
        }
      }
      let yAxis = {
        type: "value",
        name: this.chartOptions.yAxisName,
        data: {},
        nameTextStyle: {
          color: this.chartOptions.axisColor,
          fontSize: 14
        },
        splitArea: {
          show: true
        }, //保留网格区域
        splitLine: {
          show: false
        },
        axisLabel: {
          rotate: this.chartOptions.yAxisLabelRotate ? 45 : 0,
          interval: "auto"
        },
        axisLine: {
          lineStyle: {
            color: this.chartOptions.axisColor
          }
        }
      }
      if (this.chartOptions.xAxisLabelRotate) {
        grid['bottom'] += 20;
      }
      if (this.chartOptions.yAxisLabelRotate) {
        grid['left'] -= 10;
      }
      let legend = null;
      let bottom = "auto";
      let top = "auto"
      if (this.chartOptions.legendPosition != "none") {
        if (this.chartOptions.legendPosition === "bottom") {
          grid['bottom'] += 15
          bottom = 10;
        } else {
          grid['top'] += 15
          top = 10;
        }

        legend = {
          orient: this.chartOptions.legendOrient,
          top,
          bottom,
          left: "center",
          data: this.fieldNames,
          textStyle: {
            color: this.chartOptions.axisColor
          }
        }
      }
      if (this.chartOptions.xAxisName) {
        grid['top'] += 10;
      }
      if (this.chartOptions.yAxisName) {
        //todo 乘以字体大小
        grid['right'] += this.chartOptions.xAxisName.length * 8;
      }

      return {
        backgroundColor: this.chartOptions.backgroundColor,
        grid: {
          top: grid.top + "px",
          bottom: grid.bottom + "px",
          left: grid.left + "px",
          right: grid.right + "px"
        },
        legend: legend,
        series: series,
        xAxis: xAxis,
        yAxis: yAxis,
        tooltip: this.chartOptions.tooltip
      }
    }
  }
  _updateDataSuccess(data) {
    //仅仅更新chartoptions时 调用该方法不传入data，直接使用前一次的this.calculatedData
    if (data) {
      this.data = data;
    }
    this.calculatedData = this._createChartDatas(this.data);
    let options = this._updateChartOptions(this.chartType);
    this._updateChart(options);
  }

  _createChart(data) {
    this.dataCache = data;
    this.echart = echarts && echarts.init(this.chartContainer, null, {
      renderer: "canvas"
    })
    if (data) {
      this.data = data;
    }
    this.calculatedData = this._createChartDatas(this.data);
    let options = this._updateChartOptions(this.chartType);
    this.echart.setOption(options);
    this.fire('chartinitsucceeded', {
      chart: this.echart
    });
  }
  _updateChart(options) {
    if (this.echart) {
      this.echart.clear();
      this.echart.setOption(options);
      this.fire('updatechartsucceeded', {
        chart: this.echart
      });
    }
  }
  _initXYField(option) {
    this.xField = [];
    this.yField = []
    //chartOptions==>this.xField this.yField
    if (option.xAxis) {
      this.xField.push({
        field: option.xAxis
      });
    }
    if (option.yAxis) {
      option.yAxis.forEach(y => {
        this.yField.push({
          field: y
        })
      });
    }
  }
  _createChartDatas(data) {
    let fieldIndex = 0,
      yfieldIndexs = [];
    let fieldCaptions = data.fieldCaptions;
    let me = this;
    //X
    if (me.xField[0]) {
      fieldIndex = fieldCaptions.indexOf(me.xField[0].field)
    }
    if (fieldIndex < 0) {
      fieldIndex = 0;
    }
    //Y
    const fieldNames = [];
    this.yField.forEach((value, index) => {
      fieldNames.push(value.field);
      yfieldIndexs.push(fieldCaptions.indexOf(value.field));
    })
    this.fieldNames = fieldNames;
    //获取x轴字段对应的所有属性值
    let uniqFieldValues = this._getUniqFieldDatas(data, fieldIndex);
    let fieldDatas = this._getFieldDatas(data, fieldIndex);
    let yDatas = [];
    if (!this.chartOptions.xFieldStatistical && yfieldIndexs.length > 0) {
      yfieldIndexs.forEach((yfieldIndex) => {
        let yData = [];
        for (let i in data.fieldValues[yfieldIndex]) {
          yData.push({
            value: data.fieldValues[yfieldIndex][i]
          });
        }
        yDatas.push(yData);
      });
    } else if (this.chartOptions.xFieldStatistical) {
      yfieldIndexs.forEach((yfieldIndex) => {
        const yData = [];
        if (yfieldIndex === -1) {
          yfieldIndex = 0;
        }
        const fieldValues = data.fieldValues[yfieldIndex];
        for (const key in uniqFieldValues) {
          const v = 0;
          uniqFieldValues[key].forEach(index => {
            let num = fieldValues[index];
            if (num.replace) {
              num = num.replace(/,/g, "");
            }
            v += tonumber(num);
          });
          yData.push({
            value: v
          })
        }
        yDatas.push(yData);
        fieldDatas = Object.keys(uniqFieldValues);
      })
    } else { //未指定Y字段时，y轴计数
      const yData = [];
      for (const key in uniqFieldValues) {
        yData.push({
          value: uniqFieldValues[key].length
        })
      }
      fieldDatas = Object.keys(uniqFieldValues);
      yDatas = [YData];
    }
    return {
      XData: fieldDatas,
      YData: yDatas
    }
  }
  _getUniqFieldDatas(datacontent, index) {
    const fieldValues = datacontent.fieldValues[index];
    const uniqFieldValues = {};
    fieldValues.forEach((value, index) => {
      if (!uniqFieldValues[value]) {
        uniqFieldValues[value] = [index];
      } else {
        uniqFieldValues[value].push(index)
      }
    });
    return uniqFieldValues;
  }
  _getFieldDatas(datacontent, index) {
    return datacontent.fieldValues[index];
  }
  _createChartSeries(calculatedData, chartType) {
    let series = [];
    let yDatas = calculatedData.YData;
    yDatas.forEach((yData, index) => {
      let value = 0;
      let serieData = [];
      for (let data of yData) {
        value = data.value;
        serieData.push({
          value: value
        });
      }
      let serie = {
        type: chartType,
        stack: '0',
        color: this.chartOptions.colorGradient[index % this.chartOptions.colorGradient.length],
        data: serieData,
        name: this.fieldNames[index] || 'y'
      };
      series.push(serie);
    });
    return series;
  }
}

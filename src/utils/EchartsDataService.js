import iServerRestService from './iServerRestService';
import iPortalDataService from './iPortalDataService';
import tonumber from 'lodash.tonumber';
import isEqual from 'lodash.isequal';
import max from 'lodash.max';
import formatterUtil from './formatter';
/**
 * @class EchartsDataService
 * @classdesc 图表微件功能类
 */

export default class EchartsDataService {
  constructor() {
    this.dataCache = null; // 缓存的是请求后的数据
    this.axisDatas = []; // 坐标data
    this.serieDatas = []; // series data
    this.gridAxis = {}; // 直角坐标系
    this.radarAxis = {}; // 雷达图坐标系
    this.radarMax = 0; // 雷达图坐标最大值
  }

  /**
   * @function EchartsDataService.prototype.getDataOption
   * @description 获取符合echart data数据格式的数据, 入口函数。
   * @param {SmChart-datasets} datasets - 请求的参数
   * @param {Array.<SmChart-dataOption>} dataOptions - 数据解析的配置。
   * @returns {Object}  promise
   */
  /**
   * @typedef {Object} SmChart-datasets  - 数据来源
   * @property {string} [type = 'iServer'] - 服务类型 iServer, iPortal。
   * @property {string} url - 服务url地址。
   * @property {boolean} [withCredentials = false] - 设置请求是否带cookie
   * @property {SuperMap.FilterParameter} queryInfo - 查询条件
   */
  /**
   * @typedef {Object} SmChart-dataOption  - 解析数据的配置
   * @property {string} seriesType - 图表类型line, bar, scatter, pie, radar, gauge。
   * @property {boolean} [isStastic = false] - 是否统计数据。
   * @property {boolean} [isStack = false] - 图表（line, bar, scatter）是否堆叠
   * @property {string} xField - 数据的字段，坐标值
   * @property {string} yField - 数据的字段，数据值
   */
  getDataOption(datasets, dataOptions) {
    // 设置datasets的默认配置type，withCredentials
    let promise = new Promise((resolve, reject) => {
      // 将datasets的缓存为当前datasets
      datasets = this._setDatasets(datasets);
      // 请求数据，请求成功后，解析数据
      this._requestData(datasets)
        .then(data => {
          // 设置this.data
          this._setData(data);
          // 解析数据，生成dataOption
          let options = this.formatChartData(dataOptions, data);
          resolve(options);
        })
        .catch(e => {
          reject(e);
        });
    });
    return promise;
  }

  /**
   * @function EchartsDataService.prototype.formatChartData
   * @description _requestData方法中返回的数据: 设置数据，转换数据格式。
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据
   * @param {Object} dataOptions - 数据解析的配置参数
   * @returns {Object}  配置好的option
   */
  formatChartData(dataOptions, data = this.dataCache) {
    // 清除数据缓存
    this._clearChartCache();
    // 设置series Data
    dataOptions.forEach(dataOption => {
      // 生成YData, XData
      let fieldData = this._fieldsData(data, dataOption);
      // 解析YData, XData，生成EchartsOption的data
      let serieData = this._createDataOption(fieldData, dataOption);
      // 设置坐标
      this._createAxisData(fieldData, dataOption);
      this.serieDatas.push(serieData);
    });
    let gridAxis = this.gridAxis;
    let radarAxis = this.radarAxis;
    let series = this.serieDatas;
    return {
      ...gridAxis,
      ...radarAxis,
      series
    };
  }

  /**
   * @function EchartsDataService.prototype._setDatasets
   * @private
   * @description 设置datasets的默认参数，type, withCredentials
   * @param {datasets} datasets - 请求的参数。
   * @returns {Object}  默认值的datasets
   */

  _setDatasets(datasets) {
    // 设置默认值
    datasets.type = datasets.type || 'iServer'; // 服务类型
    datasets.withCredentials = datasets.withCredentials || false; // 请求认证
    return datasets;
  }

  /**
   * @function EchartsDataService.prototype._setData
   * @private
   * @description 给实例绑定data。
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据
   */
  _setData(data) {
    if (data) {
      this.dataCache = data;
    }
  }

  /**
   * @function EchartsDataService.prototype._clearChartCache
   * @private
   * @description 清除已经生成的chart数据的缓存。
   */
  _clearChartCache() {
    this.axisDatas = []; // 坐标data
    this.serieDatas = []; // series data
    this.gridAxis = {}; // 直角坐标系
  }

  /**
   * @function EchartsDataService.prototype._requestData
   * @private
   * @description 从superMap的iserver,iportal中请求数据(datasets)。
   * @param {datasets}
   * @returns {Object}  data的promise
   */
  _requestData(datasets) {
    let promise = new Promise((resolve, reject) => {
      if (datasets) {
        let superMapService;
        if (datasets.type === 'iServer') {
          superMapService = new iServerRestService(datasets.url, datasets.withCredentials);
        } else if (datasets.type === 'iPortal') {
          superMapService = new iPortalDataService(datasets.url, datasets.withCredentials);
        }
        superMapService.getData(datasets.queryInfo);
        superMapService.on('getdatafailed', function(e) {
          reject(e);
        });
        superMapService.on('getdatasucceeded', function(data) {
          resolve(data);
        });
      }
    });
    return promise;
  }

  /**
   * @function EchartsDataService.prototype._createSeriesData
   * @private
   * @description 生成chart的serie。
   * @param {Object} fieldData - 解析后的数据{xData,yData}
   * @param {Object} dataOption - 数据解析的配置
   * @returns {Object}  配置好的serieData
   */
  _createDataOption(fieldData, dataOption) {
    let chartType = dataOption.seriesType;
    let XData = fieldData.xData;
    let YData = fieldData.yData;
    let serieData = {
      type: chartType,
      name: dataOption.yField,
      data: []
    };
    if (chartType === 'pie') {
      YData.forEach((value, index) => {
        serieData.data.push({
          value,
          name: XData[index]
        });
      });
    } else if (chartType === 'radar') {
      let yData = [...YData];
      serieData.data.push({
        value: [...YData],
        name: dataOption.yField
      });
      // 获取雷达图的max最大值
      let maxValue = max(yData);
      this.radarMax = Math.max(maxValue, this.radarMax);
    } else {
      // line bar scatter gauge
      serieData.data = [...YData];
      // 是否堆叠数据（line,bar,scatter）
      if (dataOption.isStack) {
        serieData.stack = '0';
      }
    }
    return serieData;
  }

  /**
   * @function EchartsDataService.prototype._createSeriesData
   * @private
   * @description 生成chart的serie。
   * @param {Object} fieldData - 解析后的数据{xData,yData}
   * @param {Object} dataOptions - 数据解析的配置
   * @returns {Object}  配置好的坐标data
   */
  _createAxisData(fieldData, dataOption) {
    let chartType = dataOption.seriesType;
    let XData = fieldData.xData;
    let radarData = [];
    let axisData;
    if (chartType === 'radar') {
      let radarMax = this.radarMax;
      XData.forEach(text => {
        radarData.push({
          text,
          max: radarMax
        });
      });
      this.radarAxis = {
        radar: {
          indicator: radarData
        }
      };
      axisData = this.radarAxis;
    } else if (chartType === 'bar' || chartType === 'line' || chartType === 'scatter') {
      let data = [...XData];
      if (!this.gridAxis.xAxis) {
        this.gridAxis.xAxis = [];
        this.gridAxis.yAxis = {};
      }
      if (this.gridAxis.xAxis.length === 0 || !isEqual(data, this.gridAxis.xAxis[0].data)) {
        this.gridAxis.xAxis.push({
          data
        });
      }

      axisData = this.gridAxis;
    } else {
      axisData = {};
    }
    return axisData;
  }

  /**
   * @function EchartsDataService.prototype._fieldsData
   * @private
   * @description 将请求回来的数据，转换成适用于chart配置的数据。
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据
   * @param {Object} dataOption - 数据解析的配置
   * @returns {Object}  解析好的Ydata，xdata
   */
  _fieldsData(data, dataOption) {
    let fieldCaptions, fieldValues, xFieldIndex, yFieldIndex, fieldValueIndex, xData, yData, result;
    fieldCaptions = data.fieldCaptions; // 所有x字段
    xFieldIndex = fieldCaptions.indexOf(dataOption.xField); // x字段的下标
    yFieldIndex = fieldCaptions.indexOf(dataOption.yField); // y字段的下标
    fieldValues = data.fieldValues[yFieldIndex]; // y字段的所有feature值
    // 该数据是否需要统计,统计的是数组下标
    if (dataOption.isStastic) {
      fieldValueIndex = this._getUniqFieldDatas(data, xFieldIndex);
      // 生成统计后的数据
      xData = this._stasticXData(fieldValueIndex);
      yData = this._stasticYData(fieldValues, fieldValueIndex);
    } else {
      // 如果不是统计图表
      xData = this._getFieldDatas(data, xFieldIndex);
      yData = [...fieldValues];
    }
    result = {
      xData,
      yData
    };
    return result;
  }

  /**
   * @function EchartsDataService.prototype._stasticXData
   * @private
   * @description 统计X字段数据，生成xData。
   * @param {Object} fieldValueIndex - x字段的统计索引
   * @returns {Array}  统计后的Xdata、
   */
  _stasticXData(fieldValueIndex) {
    let xData = Object.keys(fieldValueIndex);
    return xData;
  }

  /**
   * @function EchartsDataService.prototype._stasticYData
   * @private
   * @description 统计数据，生成yData。
   * @param {Object} fieldValues - y字段的所有feature值
   * @param {Object} fieldValueIndex - x字段的统计索引
   * @returns {Array}  统计后的Ydata、
   */
  _stasticYData(fieldValues, fieldValueIndex) {
    let yData = [];
    // 统计Y字段
    for (const key in fieldValueIndex) {
      let total = 0;
      fieldValueIndex[key].forEach(index => {
        // 清除字符串型的数字的逗号
        let num = formatterUtil.clearNumberComma(fieldValues[index]);
        total += tonumber(num);
      });
      yData.push(total);
    }
    return yData;
  }

  /**
   * @function EchartsDataService.prototype._getUniqFieldDatas
   * @private
   * @description 获取x轴字段要统计的属性值
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据的fieldValue
   * @param {String} fieldIndexs - x字段索引值数组
   * @returns {Object}  返回x轴字段要统计的属性值，返回值为eg:[fieldIndex：1, statiscIndex:{浇水地：[5,2,5,4], 林地：[5,2,5,4]...}]。
   */
  _getUniqFieldDatas(data, fieldIndex) {
    const fieldValues = this._getFieldDatas(data, fieldIndex);
    const uniqFieldValues = {};
    if (fieldValues) {
      fieldValues.forEach((value, index) => {
        if (!uniqFieldValues[value]) {
          uniqFieldValues[value] = [index];
        } else {
          uniqFieldValues[value].push(index);
        }
      });
    }
    return uniqFieldValues;
  }

  /**
   * @function EchartsDataService.prototype._getFieldDatas
   * @private
   * @description 。
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据的fieldValue
   * @param {String} fieldIndex - x字段索引值
   * @returns {Array}  返回的是一个数组[林地， 旱地， 林地，沼泽，旱地...]
   */
  _getFieldDatas(data, fieldIndex) {
    // 获取x字段所有值，
    return data.fieldValues[fieldIndex];
  }
}

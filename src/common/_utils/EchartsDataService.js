import getFeatures from './get-features';
import tonumber from 'lodash.tonumber';
import max from 'lodash.max';
import orderBy from 'lodash.orderby';
import { clearNumberComma, filterInvalidData } from './util';
import { statisticsFeatures } from './statistics';

// 三方服务请求的结果为单对象的时候，是否要转成多个features
export function tranformSingleToMulti(data) {
  const dataInfo = (data.features[0] || {}).properties;
  if (dataInfo) {
    data.features = Object.entries(dataInfo).map(([key, value]) => ({ properties: { label: key, value } }));
    return Object.assign(data, statisticsFeatures(data.features));
  }
  return data;
}

export function sortData(features, datasetOptions, maxFeatures, xBar) {
  const matchItem = datasetOptions.find(item => item.sort && item.sort !== 'unsort');
  let nextFeatures = [].concat(features);
  if (matchItem) {
    nextFeatures = orderBy(
      features,
      feature => isNaN(+feature.properties[matchItem.yField]) ? -Number.MAX_VALUE : +feature.properties[matchItem.yField],
      matchItem.sort === 'ascending' ? 'asc' : 'desc'
    );
  }
  const maxLen = +maxFeatures;
  if (maxLen && nextFeatures.length > maxLen) {
    nextFeatures.length = maxLen;
  }
  matchItem && xBar && nextFeatures.reverse();
  return nextFeatures;
}

/**
 * @class EchartsDataService
 * @classdesc 图表组件功能类
 * @param {Chart-dataset} dataset - 请求的参数
 * @param {Array.<Chart-datasetOption>} datasetOptions - 数据解析的配置。
 */

/**
 * @typedef {Object} Chart-dataset  - 数据来源
 * @property {string} [type = 'iServer'] - 服务类型 iServer, iPortal。
 * @property {string} url - 服务url地址。
 * @property {boolean} [withCredentials = false] - 设置请求是否带cookie
 * @property {SuperMap.FilterParameter} queryInfo - 查询条件
 */
/**
 * @typedef {Object} Chart-datasetOption  - 解析数据的配置
 * @property {string} seriesType - 图表类型line, bar, scatter, pie, radar, gauge。
 * @property {boolean} [isStastic = false] - 是否统计数据。
 * @property {boolean} [isStack = false] - 图表（line, bar, scatter）是否堆叠
 * @property {string} xField - 数据的字段，坐标值
 * @property {string} yField - 数据的字段，数据值
 */

export default class EchartsDataService {
  constructor(dataset, datasetOptions) {
    // 设置默认值
    dataset.withCredentials = dataset.withCredentials || false; // 请求认证
    this.dataset = dataset;
    this.datasetOptions = datasetOptions;
    this.dataCache = null; // 缓存的是请求后的数据
    this.sortDataCache = null;
    this.axisDatas = []; // 坐标data
    this.serieDatas = []; // series data
    this.gridAxis = { xAxis: [], yAxis: {} }; // 直角坐标系
    this.radarAxis = {}; // 雷达图坐标系
    this.radarMax = 0; // 雷达图坐标最大值
  }

  /**
   * @function EchartsDataService.prototype.getDataOption
   * @description 获取符合echart data数据格式的数据, 入口函数。
   * @returns {Object}  带有请求的数据的promise对象
   */
  getDataOption(dataset, xBar = false) {
    // 设置datasets的默认配置type，withCredentials
    let promise = new Promise((resolve, reject) => {
      // 请求数据，请求成功后，解析数据
      const matchItem = this.datasetOptions.find(item => item.sort !== 'unsort');
      const maxFeatures = matchItem ? '' : dataset.maxFeatures;
      getFeatures({ ...dataset, maxFeatures })
        .then(data => {
          // 兼容三方服务接口返回的一个普通的对象
          if (data.transformed && !!data.features.length) {
            data = tranformSingleToMulti(data);
          }
          // 解析数据，生成dataOption
          let options;
          if (
            this.dataset.type === 'iPortal' ||
            this.dataset.type === 'iServer' ||
            this.dataset.type === 'rest' ||
            this.dataset.type === 'geoJSON'
          ) {
            options = this.formatChartData(this.datasetOptions, xBar, data);
          }

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
   * @param {Object} datasetOptions - 数据解析的配置参数
   * @returns {Object}  符合echart格式的数据
   */
  formatChartData(datasetOptions, xBar = false, data = this.dataCache) {
    // 清除数据缓存
    this._clearChartCache();
    // 设置datasetOptions
    this.setDatasetOptions(datasetOptions);
    // 设置this.data
    data = this._setData(data, xBar);
    // 生成seriedata
    datasetOptions.forEach(item => {
      // 生成YData, XData
      let fieldData = this._fieldsData(data, item, xBar);
      // 解析YData, XData，生成EchartsOption的data
      let serieData = this._createDataOption(fieldData, item);
      // 设置坐标
      this._createAxisData(fieldData, item);
      if (!serieData.tooltip) {
        serieData.tooltip = this._fixToolTip(data, item);
      }
      this.serieDatas.push(serieData);
    });
    let gridAxis = (this.gridAxis.xAxis.length > 0 || JSON.stringify(this.gridAxis.yAxis) !== '{}') && this.gridAxis;
    let radarAxis = this.radarAxis;
    let series = this.serieDatas;
    return {
      ...gridAxis,
      ...radarAxis,
      series
    };
  }

  /**
   * @function EchartsDataService.prototype.setDatasetOptions
   * @private
   * @description 设置datasetOptions
   * @param {Array.<Chart-datasetOption>} datasetOptions - 数据解析的配置
   */

  setDatasetOptions(datasetOptions) {
    this.datasetOptions = datasetOptions;
  }

  /**
   * @function EchartsDataService.prototype._setData
   * @private
   * @description 给实例绑定data。
   * @param {Object} data - 从superMap的iserver,iportal中请求返回的数据
   */
  _setData(data, xBar) {
    let nextData = data;
    if (data) {
      let nextFeatures = filterInvalidData(this.datasetOptions, data.features);
      // 只过滤空数据但不排序的原数据
      this.dataCache = statisticsFeatures(nextFeatures);
      nextFeatures = sortData(nextFeatures, this.datasetOptions, this.dataset.maxFeatures, xBar);
      nextData = statisticsFeatures(nextFeatures);
      this.sortDataCache = nextData;
    }
    return nextData;
  }

  /**
   * @function EchartsDataService.prototype._clearChartCache
   * @private
   * @description 清除已经生成的chart数据的缓存。
   */
  _clearChartCache() {
    this.axisDatas = []; // 坐标data
    this.serieDatas = []; // series data
    this.gridAxis = { xAxis: [], yAxis: {} }; // 直角坐标系
  }

  /**
   * @function EchartsDataService.prototype._createSeriesData
   * @private
   * @description 生成chart的serie。
   * @param {Object} fieldData - 解析后的数据{xData,yData}
   * @param {Chart-datasetOption} datasetOption - 数据解析的配置
   * @returns {Object}  配置好的serieData
   */
  _createDataOption(fieldData, datasetOption) {
    let chartType = datasetOption.seriesType;
    let XData = fieldData.xData;
    let YData = fieldData.yData;
    let serieData = {
      type: chartType,
      name: datasetOption.yField,
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
        name: datasetOption.yField
      });
      // 获取雷达图的max最大值
      let maxValue = max(yData);
      this.radarMax = Math.max(maxValue, this.radarMax);
    } else {
      // line bar scatter gauge
      serieData.data = [...YData];
      // 是否堆叠数据（line,bar,scatter）
      if (datasetOption.isStack) {
        serieData.stack = 1;
      } else {
        serieData.stack = 0;
      }
    }
    return serieData;
  }

  /**
   * @function EchartsDataService.prototype._fixToolTip
   * @private
   * @description 调整tooltip显示，Todo 考虑支持用户自定义tooltip内容
   * @param {Object} data - 数据
   * @param {Chart-datasetOption} datasetOption - 数据解析的配置
   * @returns {Object}  tooltip
   */
  _fixToolTip(data, datasetOption) {
    if (data.transformed) {
      if (datasetOption.seriesType === 'pie') {
        return {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)'
        };
      }
      return {
        trigger: 'item',
        formatter: '{b} : {c}'
      };
    }
    return null;
  }

  /**
   * @function EchartsDataService.prototype._createSeriesData
   * @private
   * @description 生成chart的serie。
   * @param {Object} fieldData - 解析后的数据{xData,yData}
   * @param {Chart-datasetOption} datasetOption - 数据解析的配置
   * @returns {Object}  配置好的坐标data
   */
  _createAxisData(fieldData, datasetOption) {
    let chartType = datasetOption.seriesType;
    let XData = fieldData.xData;
    let radarData = [];
    let axisData;
    if (chartType === 'radar' && XData) {
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
    } else if (['bar', 'line', 'scatter', '2.5Bar'].find(item => item === chartType)) {
      let data = XData && [...XData];
      if (!this.gridAxis.xAxis) {
        this.gridAxis.xAxis = [];
        this.gridAxis.yAxis = {};
      }
      if (this.gridAxis.xAxis.length === 0) {
        this.gridAxis.xAxis.push({
          data
        });
      } else {
        this.gridAxis.xAxis[0] = { data };
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
   * @param {Chart-datasetOption} datasetOption - 数据解析的配置
   * @returns {Object}  解析好的Ydata，xdata
   */
  _fieldsData(data, datasetOption, xBar = false) {
    let fieldCaptions, fieldValues, xFieldIndex, yFieldIndex, fieldValueIndex, xData, yData, result;
    let { sort, yField, xField, isStastic } = datasetOption;
    fieldCaptions = data.fieldCaptions; // 所有x字段
    xFieldIndex = fieldCaptions.indexOf(xField); // x字段的下标
    yFieldIndex = fieldCaptions.indexOf(yField); // y字段的下标
    fieldValues = yFieldIndex < 0 ? [] : data.fieldValues[yFieldIndex]; // y字段的所有feature值
    // 该数据是否需要统计,统计的是数组下标
    if (isStastic) {
      fieldValueIndex = this._getUniqFieldDatas(data, xFieldIndex, sort);
      // 生成统计后的数据
      xData = this._stasticXData(fieldValueIndex, sort);
      yData = this._stasticYData(fieldValues, fieldValueIndex, sort);
    } else {
      // 如果不是统计图表
      xData = this._getFieldDatas(data, xFieldIndex);
      yData = [...fieldValues];
    }
    result = { xData, yData };
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
        let num = fieldValues[index] && clearNumberComma(fieldValues[index]);
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

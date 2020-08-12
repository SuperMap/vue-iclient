import { Events } from '../_types/event/Events';
import { getDataType } from './util';
import { statisticsFeatures } from './statistics';

export default class RestService extends Events {
  constructor(options) {
    super();
    this.eventTypes = ['getdatafailed', 'getdatasucceeded'];
    this.options = options || {};
  }

  setProxy(proxy) {
    this.options.proxy = proxy;
  }

  /**
   * @function RestService.prototype.getData
   * @description 请求数据。
   */
  getData(data, queryInfo) {
    if (!data) {
      return;
    }
    // 如果是geojson
    if (typeof data === 'object') {
      this.transfromGeoJSON({ ...data }, queryInfo);
      return;
    }
    // 如果是url， 就发送请求
    let url = data;
    SuperMap.FetchRequest.get(url, null, { withoutFormatSuffix: true, proxy: this.options.proxy })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (!data) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
        } else {
          const resData = data.hasOwnProperty('data') ? data.data : data;
          this.transfromGeoJSON(resData, queryInfo);
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }

  transfromGeoJSON(resData, queryInfo) {
    let generateData = {
      type: 'FeatureCollection',
      features: []
    };
    const dataType = getDataType(resData);
    const limitLen = (queryInfo || {}).maxFeatures;
    if (
      dataType !== '[object Object]' ||
      !resData.type ||
      resData.type !== 'FeatureCollection' ||
      getDataType(resData.features) !== '[object Array]'
    ) {
      generateData.features = this._generateData(resData, limitLen);
    } else {
      generateData = resData;
      generateData.features = this._generateData(resData.features, limitLen, false);
    }
    if (this.transformed) {
      generateData.transformed = this.transformed;
    }
    const triggerData = Object.assign({}, generateData, statisticsFeatures(generateData.features));
    this.triggerEvent('getdatasucceeded', triggerData);
  }

  _generateData(data, limitLen, generateTransformed = true) {
    const dataType = getDataType(data);
    let features = [];
    let subData;
    switch (dataType) {
      case '[object Number]':
      case '[object String]':
        let feature = {
          properties: {
            value: data
          }
        };
        features.push(feature);
        break;
      case '[object Array]':
        subData = limitLen && !isNaN(+limitLen) && limitLen < data.length ? data.slice(0, limitLen) : data;
        features = subData.map(item => {
          if (
            getDataType(item) === '[object Object]' &&
            item.hasOwnProperty('properties') &&
            getDataType(item.properties) === '[object Object]'
          ) {
            return item;
          } else {
            let feature = {
              properties: getDataType(item) === '[object Object]' ? item : { value: item }
            };
            return feature;
          }
        });
        break;
      case '[object Object]':
        subData = data;
        if (limitLen && !isNaN(+limitLen) && limitLen < Object.keys(data).length) {
          subData = Object.fromEntries(Object.entries(data).slice(0, limitLen));
        }
        if (!subData.hasOwnProperty('properties') || getDataType(subData.properties) !== '[object Object]') {
          if (generateTransformed) {
            this.transformed = true;
          }
          subData = {
            properties: subData
          };
        }
        features.push(subData);
        break;
    }
    return features;
  }
}

import iServerRestService, { vertifyEpsgCode, transformFeatures } from './iServerRestService';
import { isXField, isYField, handleWithCredentials, handleDataParentRes } from './util';
import { Events } from '../_types/event/Events';

/**
 * @class iPortalDataService
 * @classdesc iPortal 数据请求类。
 * @category  BaseTypes Util
 * @param {string} url - iPortal 数据地址。
 * @param {Boolean} [withCredentials=false] - 请求是否携带 cookie。
 * @fires iPortalDataService#getdatasucceeded
 * @fires iPortalDataService#getdatafailed
 * @fires iPortalDataService#featureisempty
 */
export default class iPortalDataService extends Events {
  constructor(url, withCredentials, options = {}) {
    super();
    this.url = url;
    this.withCredentials = withCredentials || false;
    this.epsgCode = options.epsgCode;
    this.iportalServiceProxyUrl = options.iportalServiceProxyUrl;
    this.eventTypes = ['getdatasucceeded', 'getdatafailed', 'featureisempty'];
    this.resourceId = options.resourceId;
    if (this.resourceId) {
      this.url = handleDataParentRes(url, this.resourceId, 'DATA');
    }
    this.initSerivce(this.url);
  }

  initSerivce(url) {
    this.iserverService = new iServerRestService(url, { epsgCode: this.epsgCode });
    this.iserverService.on({
      getdatasucceeded: e => {
        /**
         * @event iPortalDataService#getdatasucceeded
         * @description 请求数据成功后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('getdatasucceeded', e);
      },
      getdatafailed: e => {
        /**
         * @event iPortalDataService#getdatafailed
         * @description 请求数据失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('getdatafailed', e);
      },
      featureisempty: e => {
        /**
         * @event iPortalDataService#featureisempty
         * @description 请求数据为空后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('featureisempty', e);
      }
    });
  }

  /**
   * @function iPortalDataService.prototype.getData
   * @description 请求数据。
   * @param {Object} queryInfo - 可选参数。
   * @param {Object} [queryInfo.maxFeatures] - 最多可返回的要素数量。
   * @param {Object} [queryInfo.attributeFilter] - 属性过滤条件。
   * @param {Object} [queryInfo.keyWord] - 筛选关键字。
   */
  getData(queryInfo, preferContent = false) {
    if (!this.url) {
      return;
    }
    let datasetUrl = this.url;
    if (preferContent) {
      this._getDatafromContent(datasetUrl, queryInfo);
      return;
    }
    SuperMap.FetchRequest.get(datasetUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.succeed === false) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
          return;
        }
        // 是否有rest服务
        if (data.dataItemServices && data.dataItemServices.length > 0) {
          let dataItemServices = data.dataItemServices;
          let resultData = dataItemServices.find(
            item =>
              (item.serviceType === 'RESTDATA' || item.serviceType === 'RESTMAP') && item.serviceStatus === 'PUBLISHED'
          );
          // 有rest服务并且address不为空（online的address服务为''）
          if (resultData && resultData.address) {
            // 如果有服务，获取数据源和数据集, 然后请求rest服务
            let serviceUrl = resultData.address;
            if (this.resourceId) {
              serviceUrl = handleDataParentRes(serviceUrl, this.resourceId, 'DATA');
            }
            this._getDatafromRest(resultData.serviceType, serviceUrl, queryInfo);
          } else {
            this._getDatafromContent(datasetUrl, queryInfo);
          }
        } else {
          this._getDatafromContent(datasetUrl, queryInfo);
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }
  _getDatafromRest(serviceType, address, queryInfo) {
    if (serviceType === 'RESTDATA') {
      let url = SuperMap.Util.urlPathAppend(address, 'data/datasources');
      let dataSourceName;
      let datasetName; // 请求获取数据源名
      SuperMap.FetchRequest.get(url, null, {
        withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          dataSourceName = data.datasourceNames && data.datasourceNames[0];
          url = SuperMap.Util.urlPathAppend(address, `data/datasources/${dataSourceName}/datasets`);
          // 请求获取数据集名
          SuperMap.FetchRequest.get(url, null, {
            withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              datasetName = data.datasetNames[0];
              // 请求restdata服务
              this.iserverService.getDataFeatures(
                {
                  datasetName,
                  dataSourceName,
                  dataUrl: SuperMap.Util.urlPathAppend(address, 'data')
                },
                Object.assign({}, queryInfo, {
                  withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
                })
              );
            })
            .catch(error => {
              console.log(error);
              this.triggerEvent('getdatafailed', {
                error
              });
            });
        });
    } else {
      // 如果是地图服务
      let url = SuperMap.Util.urlPathAppend(address, 'maps');
      let mapName;
      let layerName;
      let path; // 请求获取地图名
      SuperMap.FetchRequest.get(url, null, {
        withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
      })
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (data[0]) {
            mapName = data[0].name;
            path = data[0].path;
            if (this.resourceId) {
              path = handleDataParentRes(path, this.resourceId, 'DATA');
            }
          }
          url = SuperMap.Util.urlPathAppend(address, `maps/${mapName}/layers`);
          // 请求获取图层名
          SuperMap.FetchRequest.get(url, null, {
            withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
          })
            .then(response => {
              return response.json();
            })
            .then(data => {
              layerName = data[0].subLayers.layers[0].caption;
              // 请求restmap服务
              this.iserverService.getMapFeatures(
                {
                  mapName: layerName,
                  dataUrl: path
                },
                Object.assign({}, queryInfo, {
                  withCredentials: handleWithCredentials(url, this.iportalServiceProxyUrl, this.withCredentials)
                })
              );
              return layerName;
            })
            .catch(error => {
              console.log(error);
              this.triggerEvent('getdatafailed', {
                error
              });
            });
        })
        .catch(error => {
          console.log(error);
          this.triggerEvent('getdatafailed', {
            error
          });
        });
    }
  }

  _getDatafromContent(datasetUrl, queryInfo) {
    let result = {};
    datasetUrl = SuperMap.Util.urlPathAppend(datasetUrl, 'content.json');
    datasetUrl = SuperMap.Util.urlAppend(datasetUrl, 'pageSize=9999999&currentPage=1');
    // 获取图层数据
    SuperMap.FetchRequest.get(datasetUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.succeed === false) {
          // 请求失败
          this.triggerEvent('getdatafailed', {
            data
          });
          return;
        }
        if (data.type) {
          let features;
          let type = 'FeatureCollection';
          if (data.type === 'JSON' || data.type === 'GEOJSON') {
            data.content = JSON.parse(data.content.trim());
            // 如果是json文件 data.content = {type:'fco', features},格式不固定
            if (!data.content.features) {
              features = this._json2Feature(data.content, queryInfo);
            }
            features = this._formatGeoJSON(features || data.content, queryInfo);
            type = data.content.type;
          } else if (data.type === 'EXCEL' || data.type === 'CSV') {
            features = this._excelData2Feature(data.content, queryInfo);
          }
          features = this._transformContentFeatures(features);
          result.features = {
            type,
            features
          };
          this.vertified && (result.vertified = this.vertified);
          this.iserverService._getFeaturesSucceed({ result });
        }
      })
      .catch(error => {
        console.log(error);
        this.triggerEvent('getdatafailed', {
          error
        });
      });
  }
  _formatGeoJSON(data, queryInfo) {
    let features = data.features;
    if (queryInfo && queryInfo.maxFeatures > 0) {
      features = features.slice(0, queryInfo.maxFeatures);
    }
    features.forEach((row, index) => {
      row.properties['index'] = index;
    });
    return features;
  }
  _excelData2Feature(dataContent, queryInfo) {
    let fieldCaptions = dataContent.colTitles;
    // 位置属性处理
    let xfieldIndex = -1;
    let yfieldIndex = -1;
    for (let i = 0, len = fieldCaptions.length; i < len; i++) {
      if (isXField(fieldCaptions[i])) {
        xfieldIndex = i;
      }
      if (isYField(fieldCaptions[i])) {
        yfieldIndex = i;
      }
    }

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    let len = dataContent.rows.length;
    if (queryInfo && queryInfo.maxFeatures > 0 && len > queryInfo.maxFeatures) {
      len = queryInfo.maxFeatures;
    }
    for (let i = 0; i < len; i++) {
      let row = dataContent.rows[i];

      let x = xfieldIndex !== -1 && Number(row[xfieldIndex]);
      let y = yfieldIndex !== -1 && Number(row[yfieldIndex]);
      // 属性信息
      let attributes = {};
      for (let index in dataContent.colTitles) {
        let key = dataContent.colTitles[index];
        attributes[key] = dataContent.rows[i][index];
      }
      let feature = {
        type: 'Feature',
        properties: attributes
      };
      if (x && y) {
        attributes['index'] = i + '';
        feature.geometry = {
          type: 'Point',
          coordinates: [x, y]
        };
      }
      // 目前csv 只支持处理点，所以先生成点类型的 geojson
      features.push(feature);
    }
    return features;
  }

  _json2Feature(dataContent) {
    let content = typeof dataContent === 'string' ? JSON.parse(dataContent) : dataContent;
    let features = [];
    if (content instanceof Array) {
      content.map(val => {
        if (val.hasOwnProperty('geometry')) {
          features.push({ properties: val.properties || val, geometry: val.geometry });
        } else {
          features.push({ properties: val });
        }
      });
    } else if (content) {
      features = [{ properties: content }];
    }
    return { features };
  }
  // 转坐标系
  _transformContentFeatures(features) {
    let transformedFeatures = features;
    if (features && !!features.length) {
      const epsgCode = vertifyEpsgCode(features[0]);
      transformedFeatures = transformFeatures(epsgCode, features);
      this.vertified = true;
    }
    return transformedFeatures;
  }
}

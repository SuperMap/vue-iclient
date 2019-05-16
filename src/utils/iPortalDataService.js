import iServerRestService from './iServerRestService';
import mapboxgl from '../../static/libs/mapboxgl/mapbox-gl-enhance';

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
export default class iPortalDataService extends mapboxgl.Evented {
  constructor(url, withCredentials) {
    super();
    this.url = url;
    this.withCredentials = withCredentials || false;
    this.iserverService = new iServerRestService(url, withCredentials);
    this.iserverService.on('getdatasucceeded', e => {
      /**
       * @event iPortalDataService#getdatasucceeded
       * @description 请求数据成功后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('getdatasucceeded', e);
    });
    this.iserverService.on('getdatafailed', e => {
      /**
       * @event iPortalDataService#getdatafailed
       * @description 请求数据失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('getdatafailed', e);
    });
    this.iserverService.on('featureisempty', e => {
      /**
       * @event iPortalDataService#featureisempty
       * @description 请求数据为空后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('featureisempty', e);
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
  getData(queryInfo) {
    let datasetUrl = this.url;
    SuperMap.FetchRequest.get(datasetUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.succeed === false) {
          // 请求失败
          this.fire('getdatafailed', {
            data
          });
          return;
        }
        // 是否有rest服务
        if (data.dataItemServices && data.dataItemServices.length > 0) {
          let dataItemServices = data.dataItemServices;
          let resultData;
          dataItemServices.forEach(item => {
            if (item.serviceType === 'RESTDATA' && item.serviceStatus === 'PUBLISHED') {
              resultData = item;
            } else if (item.serviceType === 'RESTMAP' && item.serviceStatus === 'PUBLISHED') {
              resultData = item;
            } else {
              this._getDatafromContent(datasetUrl, queryInfo);
            }
          }, this);
          // 如果有服务，获取数据源和数据集, 然后请求rest服务
          this._getDatafromRest(resultData.serviceType, resultData.address, queryInfo);
        } else {
          this._getDatafromContent(datasetUrl, queryInfo);
        }
      })
      .catch(error => {
        console.log(error);
        this.fire('getdatafailed', {
          error
        });
      });
  }
  _getDatafromRest(serviceType, address, queryInfo) {
    let withCredentials = this.withCredentials;
    if (serviceType === 'RESTDATA') {
      let url = `${address}/data/datasources`;
      let dataSourceName;
      let datasetName; // 请求获取数据源名
      SuperMap.FetchRequest.get(url, null, { withCredentials })
        .then(response => {
          return response.json();
        })
        .then(data => {
          dataSourceName = data.datasourceNames[0];
          url = `${address}/data/datasources/${dataSourceName}/datasets`;
          // 请求获取数据集名
          SuperMap.FetchRequest.get(url, null, { withCredentials })
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
                  dataUrl: url.split('/datasources')[0]
                },
                queryInfo
              );
            })
            .catch(error => {
              console.log(error);
              this.fire('getdatafailed', {
                error
              });
            });
        });
    } else {
      // 如果是地图服务
      let url = `${address}/maps`;
      let mapName;
      let layerName;
      let path; // 请求获取地图名
      SuperMap.FetchRequest.get(url, null)
        .then(response => {
          return response.json();
        })
        .then(data => {
          mapName = data[0].name;
          path = data[0].path;
          url = url = `${address}/maps/${mapName}/layers`;
          // 请求获取图层名
          SuperMap.FetchRequest.get(url, null)
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
                queryInfo
              );
              return layerName;
            })
            .catch(error => {
              console.log(error);
              this.fire('getdatafailed', {
                error
              });
            });
        })
        .catch(error => {
          console.log(error);
          this.fire('getdatafailed', {
            error
          });
        });
    }
  }

  _getDatafromContent(datasetUrl, queryInfo) {
    let result = {};
    datasetUrl += '/content.json?pageSize=9999999&currentPage=1';
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
          this.fire('getdatafailed', {
            data
          });
          return;
        }
        if (data.type) {
          if (data.type === 'JSON' || data.type === 'GEOJSON') {
            data.content = JSON.parse(data.content.trim());
            // 如果是json文件 data.content = {type:'fco', features},格式不固定
            if (!data.content.features) {
              // json格式解析失败
              console.log('JSON 格式解析失败！');
              return;
            }
            let features = this._formatGeoJSON(data.content, queryInfo);
            result.features = {
              type: data.content.type,
              features
            };
          } else if (data.type === 'EXCEL' || data.type === 'CSV') {
            let features = this._excelData2Feature(data.content, queryInfo);
            result.features = {
              type: 'FeatureCollection',
              features
            };
          }
          this.iserverService.getFeaturesSucceed({
            result: result
          });
        }
      })
      .catch(error => {
        console.log(error);
        this.fire('getdatafailed', {
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
      if (SuperMap.Widgets.FileReaderUtil.isXField(fieldCaptions[i])) {
        xfieldIndex = i;
      }
      if (SuperMap.Widgets.FileReaderUtil.isYField(fieldCaptions[i])) {
        yfieldIndex = i;
      }
    }

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    let len = dataContent.rows.length;
    if (queryInfo && queryInfo.maxFeatures > 0) {
      len = queryInfo.maxFeatures;
    }
    for (let i = 0; i < len; i++) {
      let row = dataContent.rows[i];

      let x = Number(row[xfieldIndex]);
      let y = Number(row[yfieldIndex]);
      // 属性信息
      let attributes = {};
      for (let index in dataContent.colTitles) {
        let key = dataContent.colTitles[index];
        attributes[key] = dataContent.rows[i][index];
      }
      attributes['index'] = i + '';
      // 目前csv 只支持处理点，所以先生成点类型的 geojson
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [x, y]
        },
        properties: attributes
      };
      features.push(feature);
    }
    return features;
  }
}

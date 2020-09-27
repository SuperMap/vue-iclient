import { Events } from '../_types/event/Events';
import { getProjection } from './epsg-define';
import proj4 from 'proj4';
import { isMatchUrl } from './util';
import { statisticsFeatures } from './statistics';
import cloneDeep from 'lodash.clonedeep';

export function _getValueOfEpsgCode(epsgCode) {
  const defName = `EPSG:${epsgCode}`;
  const defValue = getProjection(defName);
  if (!defValue) {
    console.error(`${defName} not define`);
  } else {
    !proj4.defs(defName) && proj4.defs(defName, defValue);
  }
  return {
    name: defName,
    value: defValue
  };
}

function _transformCoordinates(coordinates, projName) {
  if (coordinates[0] instanceof Array) {
    coordinates.forEach((item, index) => {
      if (item instanceof Array) {
        coordinates[index] = _transformCoordinates(item, projName);
      }
    });
  } else if (coordinates.length > 0) {
    return projName !== 'EPSG:4326' ? proj4(projName, 'EPSG:4326', coordinates) : coordinates;
  }
  return coordinates;
}

export function vertifyEpsgCode(firstFeature) {
  let epsgCode = 4326;
  let firstCoord = (firstFeature.geometry || {}).coordinates || [];
  if (firstCoord[0] instanceof Array) {
    if (firstCoord[0][0] instanceof Array) {
      // type: Polygon
      firstCoord = firstCoord[0][0];
      if (firstCoord[0] instanceof Array) {
        // type: MultiPolygon
        firstCoord = firstCoord[0];
      }
    } else {
      // type: LineString
      firstCoord = firstCoord[0];
    }
  }
  // 以防经纬度交换，判断错误的问题，都改成180
  const acceptRange = firstCoord[0] > -180 && firstCoord[0] < 180 && firstCoord[1] > -180 && firstCoord[1] < 180;
  if (!acceptRange) {
    epsgCode = 3857;
  }
  return epsgCode;
}

export function transformFeatures(epsgCode, features) {
  const projName = _getValueOfEpsgCode(epsgCode).name;
  const transformedFeatures = features.map(feature => {
    if (proj4.defs(projName) && feature.geometry && feature.geometry.coordinates) {
      const coordinates = feature.geometry.coordinates;
      feature.geometry.coordinates = _transformCoordinates(coordinates, projName);
    }
    return feature;
  });
  return transformedFeatures;
}

// 获取iServer restdata restmap 的 epsgcode
export function getServerEpsgCode(projectionUrl, options) {
  if (!projectionUrl) {
    return;
  }
  return SuperMap.FetchRequest.get(projectionUrl, null, options)
    .then(response => {
      return response.json();
    })
    .then(results => {
      let epsgCode = results.epsgCode;
      if (results.datasetInfo) {
        const { prjCoordSys } = results.datasetInfo;
        epsgCode = prjCoordSys ? prjCoordSys.epsgCode : null;
      }
      return epsgCode;
    })
    .catch(error => {
      console.log(error);
    });
}

// 关系型存储发布成服务后坐标一定是4326，但真实数据可能不是4326，判断一下暂时按照3857处理
export async function checkAndRectifyFeatures({ features, epsgCode, projectionUrl, options }) {
  let currentEpsgCode = epsgCode;
  let copyFeatures = features;
  if (!epsgCode) {
    currentEpsgCode = await getServerEpsgCode(projectionUrl, options);
  }
  const epsgValue = getProjection(`EPSG:${currentEpsgCode}`);
  if (epsgValue === void 0) {
    currentEpsgCode = 4326;
  }
  if (currentEpsgCode && features && !!features.length) {
    if (currentEpsgCode === 4326) {
      const vertifyCode = vertifyEpsgCode(features[0]);
      currentEpsgCode = vertifyCode;
    }
    copyFeatures = transformFeatures(currentEpsgCode, cloneDeep(features));
  }
  return copyFeatures;
}

/**
 * @class iServerRestService
 * @classdesc iServer 数据请求类。
 * @category  BaseTypes Util
 * @param {string} url - iServer 数据服务或地图服务地址。
 * @fires iServerRestService#getdatasucceeded
 * @fires iServerRestService#getdatafailed
 * @fires iServerRestService#featureisempty
 */
export default class iServerRestService extends Events {
  constructor(url, options) {
    super();
    this.url = url;
    this.options = options || {};
    this.eventTypes = ['getdatasucceeded', 'getdatafailed', 'featureisempty'];
  }

  getData(datasetInfo, queryInfo) {
    if (!this._checkUrl(this.url)) {
      return null;
    }
    this._getDatasetInfoSucceed(datasetInfo, queryInfo);
  }
  /**
   * @function iServerRestService.prototype.getData
   * @description 请求数据。
   * @param {Object} queryInfo - 可选参数。
   * @param {Object} [queryInfo.maxFeatures] - 最多可返回的要素数量。
   * @param {Object} [queryInfo.attributeFilter] - 属性过滤条件。
   * @param {Object} [queryInfo.keyWord] - 筛选关键字。
   */
  _getDatasetInfoSucceed(datasetInfo, queryInfo) {
    datasetInfo.dataUrl = this.url;
    // 判断服务为地图服务 或者 数据服务
    this.url.indexOf('/rest/maps') > -1 && this.getMapFeatures(datasetInfo, queryInfo);
    this.url.indexOf('/rest/data') > -1 && this.getDataFeatures(datasetInfo, queryInfo);
  }

  /**
   * @function iServerRestService.prototype.getMapFeatures
   * @description 请求地图服务数据。
   * @param {Object} datasetInfo - 数据集参数。
   * @param {Object} datasetInfo.dataUrl - 地图服务地址。
   * @param {Object} datasetInfo.mapName - 图层名。
   * @param {Object} queryInfo - 可选参数。
   * @param {Object} [queryInfo.maxFeatures] - 最多可返回的要素数量。
   * @param {Object} [queryInfo.attributeFilter] - 属性过滤条件。
   * @param {Object} [queryInfo.keyWord] - 筛选关键字。
   */
  getMapFeatures(datasetInfo, queryInfo) {
    let { dataUrl, mapName } = datasetInfo;
    queryInfo.name = mapName;
    this.projectionUrl = `${dataUrl}/prjCoordSys`;
    if (queryInfo.keyWord) {
      this._getRestMapFields(
        dataUrl,
        mapName,
        fields => {
          queryInfo.attributeFilter = this._getAttributeFilterByKeywords(fields, queryInfo.keyWord);
          this._getMapFeatureBySql(dataUrl, queryInfo);
        },
        queryInfo.withCredentials
      );
    } else {
      this._getMapFeatureBySql(dataUrl, queryInfo);
    }
  }
  /**
   * @function iServerRestService.prototype.getDataFeatures
   * @description 请求数据服务数据。
   * @param {Object} datasetInfo - 数据集参数。
   * @param {Object} datasetInfo.datasetName - 数据集名。
   * @param {Object} datasetInfo.dataSourceName - 数据源名。
   * @param {Object} datasetInfo.dataUrl - 数据服务地址。
   * @param {Object} queryInfo - 可选参数。
   * @param {Object} [queryInfo.maxFeatures] - 最多可返回的要素数量。
   * @param {Object} [queryInfo.attributeFilter] - 属性过滤条件。
   * @param {Object} [queryInfo.keyWord] - 筛选关键字。
   */
  getDataFeatures(datasetInfo, queryInfo) {
    let { datasetName, dataSourceName, dataUrl } = datasetInfo;
    queryInfo.name = datasetName + '@' + dataSourceName;
    queryInfo.datasetNames = [dataSourceName + ':' + datasetName];
    this.projectionUrl = `${dataUrl}/datasources/${dataSourceName}/datasets/${datasetName}`;
    if (queryInfo.keyWord) {
      let fieldsUrl = dataUrl + `/datasources/${dataSourceName}/datasets/${datasetName}/fields.rjson?returnAll=true`;
      this._getRestDataFields(fieldsUrl, queryInfo, fields => {
        queryInfo.attributeFilter = this._getAttributeFilterByKeywords(fields, queryInfo.keyWord);
        this._getDataFeaturesBySql(dataUrl, queryInfo);
      });
    } else {
      this._getDataFeaturesBySql(dataUrl, queryInfo);
    }
  }
  _getMapFeatureBySql(url, queryInfo) {
    let queryBySQLParams, queryBySQLService;
    queryBySQLParams = new SuperMap.QueryBySQLParameters({
      queryParams: [
        {
          name: queryInfo.name,
          attributeFilter: queryInfo.attributeFilter
        }
      ],
      expectCount: queryInfo.maxFeatures
    });
    queryBySQLService = new SuperMap.QueryBySQLService(url, {
      proxy: this.options.proxy,
      withCredentials: queryInfo.withCredentials,
      eventListeners: {
        processCompleted: this._getFeaturesSucceed.bind(this),
        processFailed: serviceResult => {
          console.error(serviceResult.error);
          this.fetchFailed(serviceResult.error);
        }
      }
    });
    queryBySQLService.processAsync(queryBySQLParams);
  }
  _getDataFeaturesBySql(url, queryInfo) {
    let getFeatureBySQLParams, getFeatureBySQLService;
    getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
      queryParameter: {
        name: queryInfo.name,
        attributeFilter: queryInfo.attributeFilter
      },
      datasetNames: queryInfo.datasetNames,
      fromIndex: 0,
      toIndex: queryInfo.maxFeatures >= 1000 ? -1 : queryInfo.maxFeatures - 1,
      maxFeatures: -1
    });
    getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(url, {
      proxy: this.options.proxy,
      withCredentials: queryInfo.withCredentials,
      eventListeners: {
        processCompleted: this._getFeaturesSucceed.bind(this),
        processFailed: serviceResult => {
          console.error(serviceResult.error);
          this.fetchFailed(serviceResult.error);
        }
      }
    });
    getFeatureBySQLService.processAsync(getFeatureBySQLParams);
  }

  async _getFeaturesSucceed(results) {
    let features;
    let data;

    if (results.result && results.result.recordsets) {
      // 数据来自restmap
      const recordsets = results.result.recordsets[0] || {};
      this.features = recordsets.features || {};
      features = this.features.features;
      if (features && features.length > 0) {
        data = statisticsFeatures(features, recordsets.fields, recordsets.fieldCaptions, recordsets.fieldTypes);
      } else {
        /**
         * @event iServerRestService#featureisempty
         * @description 请求数据为空后触发。
         * @property {Object} e  - 事件对象。
         */
        this.triggerEvent('featureisempty', {
          results
        });
        return;
      }
    } else if (results.result && results.result.features) {
      // 数据来自restdata---results.result.features
      this.features = results.result.features;
      features = this.features.features;
      if (features && features.length > 0) {
        data = statisticsFeatures(features);
      } else {
        this.triggerEvent('featureisempty', {
          results
        });
        return;
      }
    } else {
      this.triggerEvent('getdatafailed', {
        results
      });
      return;
    }
    // vertified 表示已经验证过 epsgCode且转化了features 比如iportalData从content.json获取的features
    if (!results.result.vertified) {
      // 关系型存储发布成服务后坐标一定是4326，但真实数据可能不是4326，判断一下暂时按照3857处理
      data.features = await checkAndRectifyFeatures({
        features: data.features,
        epsgCode: this.options.epsgCode,
        projectionUrl: this.projectionUrl,
        options: { proxy: this.options.proxy }
      });
    }

    /**
     * @event iServerRestService#getdatasucceeded
     * @description 请求数据成功后触发。
     * @property {Object} e  - 事件对象。
     */
    this.triggerEvent('getdatasucceeded', data);
  }

  _getRestDataFields(fieldsUrl, queryInfo, callBack) {
    SuperMap.FetchRequest.get(fieldsUrl, null, {
      proxy: this.options.proxy,
      withCredentials: queryInfo.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(results => {
        let fields = this._getFiledsByType(['CHAR', 'TEXT', 'WTEXT'], results);
        callBack(fields, results);
      })
      .catch(error => {
        console.log(error);
        this.fetchFailed(error);
      });
  }
  _getRestMapFields(url, layerName, callBack, withCredentials = false) {
    let param = new SuperMap.QueryBySQLParameters({
      queryParams: [
        new SuperMap.FilterParameter({
          name: layerName,
          attributeFilter: 'SMID=0'
        })
      ]
    });
    const queryBySQLSerice = new SuperMap.QueryBySQLService(url, {
      proxy: this.options.proxy,
      withCredentials,
      eventListeners: {
        processCompleted: serviceResult => {
          let fields;
          if (serviceResult.result) {
            let result = serviceResult.result.recordsets[0];
            fields = this._getFiledsByType(['CHAR', 'TEXT', 'WTEXT'], result.fieldCaptions, result.fieldTypes);
          }
          fields && callBack(fields, serviceResult.result.recordsets[0]);
        },
        processFailed: serviceResult => {
          console.error(serviceResult.error);
          this.fetchFailed(serviceResult.error);
        }
      }
    });
    queryBySQLSerice.processAsync(param);
  }
  _getAttributeFilterByKeywords(fields, keyWord) {
    let attributeFilter = '';
    fields &&
      fields.forEach((field, index) => {
        attributeFilter +=
          index !== fields.length - 1 ? `${field} LIKE '%${keyWord}%' ` + 'OR ' : `${field} LIKE '%${keyWord}%'`;
      }, this);
    return attributeFilter;
  }
  /**
   * @function iServerRestService.prototype._checkUrl
   * @description 检查url是否符合要求
   * @private
   * @param {string} url
   */
  _checkUrl(url) {
    let match;
    if (url === '' || !isMatchUrl(url)) {
      match = false;
    } else {
      match = true;
    }
    // else if (/^http[s]?:\/\/localhost/.test(url) || /^http[s]?:\/\/127.0.0.1/.test(url)) {
    //     //不是实际域名
    //     match = false;
    // }
    return match;
  }

  // types => []string
  _getFiledsByType(types, fields, fieldTypes) {
    let resultFileds = [];
    fields.forEach((field, index) => {
      types.includes((fieldTypes && fieldTypes[index]) || field.type) &&
        resultFileds.push(fieldTypes ? field : field.name);
    });
    return resultFileds;
  }

  fetchFailed(error) {
    this.triggerEvent('getdatafailed', {
      error
    });
  }
}

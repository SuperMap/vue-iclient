import {
  QueryBySQLParameters,
  QueryByGeometryParameters,
  FilterParameter,
  QueryBySQLService,
  FetchRequest,
  FeatureService,
  QueryService,
  GetFeaturesBySQLParameters,
  GetFeaturesByBoundsParameters,
  Util,
  GeometryPolygon,
  GeometryLinearRing,
  GeometryPoint
} from 'vue-iclient-static/libs/iclient-common/iclient-common';
import { Events } from 'vue-iclient/src/common/_types/event/Events';
import { getProjection } from 'vue-iclient/src/common/_utils/epsg-define';
import proj4 from 'proj4';
import { isMatchUrl } from 'vue-iclient/src/common/_utils/util';
import { statisticsFeatures } from 'vue-iclient/src/common/_utils/statistics';
import cloneDeep from 'lodash.clonedeep';

export function _getValueOfEpsgCode(epsgCode) {
  const defName = `EPSG:${epsgCode}`;
  const defValue = getProjection(defName);
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
  const { name: projName, value: projValue } = _getValueOfEpsgCode(epsgCode);
  const transformedFeatures = features.map(feature => {
    if (projValue && feature.geometry && feature.geometry.coordinates) {
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
  return FetchRequest.get(projectionUrl, null, options)
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
    this.options.fromIndex = this.options.fromIndex ?? 0;
    this.eventTypes = ['getdatasucceeded', 'getdatafailed', 'featureisempty'];
    this._defaultMaxFeatures = 1000;
    this._queryResultHandler = this._queryResultHandler.bind(this);
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
    this.projectionUrl = Util.urlPathAppend(dataUrl, 'prjCoordSys');
    if (queryInfo.keyWord) {
      this._getRestMapFields(
        dataUrl,
        mapName,
        fields => {
          const attributeFilter = this._getAttributeFilterByKeywords(fields, queryInfo.keyWord);
          this._queryMapFeatures(dataUrl, { ...queryInfo, attributeFilter });
        },
        queryInfo.withCredentials
      );
    } else {
      this._queryMapFeatures(dataUrl, queryInfo);
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
    this.projectionUrl = Util.urlPathAppend(dataUrl, `datasources/${dataSourceName}/datasets/${datasetName}`);
    if (queryInfo.keyWord) {
      let fieldsUrl = Util.urlAppend(Util.urlPathAppend(dataUrl, `datasources/${dataSourceName}/datasets/${datasetName}/fields`), 'returnAll=true');
      this._getRestDataFields(fieldsUrl, queryInfo, fields => {
        const attributeFilter = this._getAttributeFilterByKeywords(fields, queryInfo.keyWord);
        this._queryDataFeatures(dataUrl, { ...queryInfo, attributeFilter });
      });
    } else {
      this._queryDataFeatures(dataUrl, queryInfo);
    }
  }

  /**
   * @function iServerRestService.prototype.getDataFeaturesCount
   * @description 获取要素总数。
   * @param {Object} datasetInfo - 数据集参数。
   * @param {Object} datasetInfo.datasetName - 数据集名。
   * @param {Object} datasetInfo.dataSourceName - 数据源名。
   * @param {Object} datasetInfo.dataUrl - 数据服务地址。
   */
  getDataFeaturesCount(datasetInfo) {
    let { datasetName, dataSourceName, dataUrl } = datasetInfo;
    var sqlParam = new GetFeaturesBySQLParameters({
      queryParameter: {
        name: datasetName + '@' + dataSourceName
      },
      datasetNames: [dataSourceName + ':' + datasetName]
    });

    return new FeatureService(dataUrl).getFeaturesCount(sqlParam).then(function (serviceResult) {
      return serviceResult.result.totalCount;
    });
  }

  /**
   * @function iServerRestService.prototype.getFeaturesDatasetInfo
   * @description 获取要素的数据集信息。
   * @param {Object} datasetInfo - 数据集参数。
   * @param {Object} datasetInfo.datasetName - 数据集名。
   * @param {Object} datasetInfo.dataSourceName - 数据源名。
   * @param {Object} datasetInfo.dataUrl - 数据服务地址。
   */
  getFeaturesDatasetInfo(datasetInfo) {
    let { datasetName, dataSourceName, dataUrl } = datasetInfo;
    var sqlParam = new GetFeaturesBySQLParameters({
      queryParameter: {
        name: datasetName + '@' + dataSourceName
      },
      datasetNames: [dataSourceName + ':' + datasetName]
    });

    return new FeatureService(dataUrl).getFeaturesDatasetInfo(sqlParam).then(function (serviceResult) {
      return serviceResult.result[0].fieldInfos;
    });
  }

  _queryMapFeatures(url, queryInfo) {
    const queryService = new QueryService(url, {
      proxy: this.options.proxy,
      withCredentials: queryInfo.withCredentials
    });
    const expectCountOptions = this._calcFeaturesExpectCountOptions(queryInfo);
    const pickedCommonParams = {
      startRecord: expectCountOptions.fromIndex,
      expectCount: expectCountOptions.maxFeatures,
      prjCoordSys: {
        epsgCode: 4326
      },
      queryParams: [
        {
          name: queryInfo.name,
          attributeFilter: queryInfo.attributeFilter,
          orderBy: queryInfo.orderBy
        }
      ]
    };
    if (queryInfo.bounds) {
      const params = this._getMapFeaturesParamsByGeometry(queryInfo, pickedCommonParams);
      queryService.queryByGeometry(params, this._queryResultHandler);
      return;
    }
    const params = this._getMapFeaturesParamsBySql(queryInfo, pickedCommonParams);
    queryService.queryBySQL(params, this._queryResultHandler);
  }

  _queryDataFeatures(url, queryInfo) {
    const featureService = new FeatureService(url, {
      proxy: this.options.proxy,
      withCredentials: queryInfo.withCredentials
    });
    const expectCountOptions = this._calcFeaturesExpectCountOptions(queryInfo);
    const pickedCommonParams = {
      ...expectCountOptions,
      targetPrj: {
        epsgCode: 4326
      },
      returnFeaturesOnly: this.options.returnFeaturesOnly
    };
    if (queryInfo.bounds) {
      const params = this._getDataFeaturesParamsByGeometry(queryInfo, pickedCommonParams);
      featureService.getFeaturesByGeometry(params, this._queryResultHandler);
      return;
    }
    const params = this._getDataFeaturesParamsBySql(queryInfo, pickedCommonParams);
    featureService.getFeaturesBySQL(params, this._queryResultHandler);
  }

  _getMapFeaturesParamsBySql(queryInfo, commonParams) {
    return new QueryBySQLParameters({
      ...commonParams,
      queryOption: this.options.hasGeometry === false ? 'ATTRIBUTE' : 'ATTRIBUTEANDGEOMETRY'
    });
  }

  _getMapFeaturesParamsByGeometry(queryInfo, commonParams) {
    return new QueryByGeometryParameters({
      ...commonParams,
      spatialQueryMode: 'INTERSECT',
      geometry: this._transBoundsToGeometry(queryInfo)
    });
  }

  _getDataFeaturesParamsBySql(queryInfo, commonParams) {
    return new GetFeaturesBySQLParameters({
      ...commonParams,
      queryParameter: {
        name: queryInfo.name,
        attributeFilter: queryInfo.attributeFilter,
        orderBy: queryInfo.orderBy
      },
      hasGeometry: this.options.hasGeometry,
      datasetNames: queryInfo.datasetNames
    });
  }

  _getDataFeaturesParamsByGeometry(queryInfo, commonParams) {
    return new GetFeaturesByBoundsParameters({
      ...commonParams,
      attributeFilter: queryInfo.attributeFilter,
      datasetNames: queryInfo.datasetNames,
      spatialQueryMode: 'INTERSECT',
      geometry: this._transBoundsToGeometry(queryInfo)
    });
  }

  _transBoundsToGeometry(queryInfo) {
    const lnglatBounds = queryInfo.bounds;
    const west = lnglatBounds.getWest();
    const east = lnglatBounds.getEast();
    const sourth = lnglatBounds.getSouth();
    const north = lnglatBounds.getNorth();
    const geometry = new GeometryPolygon([
      new GeometryLinearRing([
        new GeometryPoint(west, sourth),
        new GeometryPoint(east, sourth),
        new GeometryPoint(east, north),
        new GeometryPoint(west, north)
      ])
    ]);
    geometry.SRID = 4326;
    return geometry;
  }

  _calcFeaturesExpectCountOptions(queryInfo) {
    const maxFeatures = queryInfo.maxFeatures ?? this._defaultMaxFeatures;
    const toIndex = this.options.toIndex ?? maxFeatures - 1;
    return {
      fromIndex: this.options.fromIndex,
      toIndex,
      maxFeatures: toIndex - this.options.fromIndex + 1
    };
  }

  _queryResultHandler(serviceResult) {
    if (serviceResult.type === 'processCompleted') {
      this._getFeaturesSucceed(serviceResult);
      return;
    }
    this._getFeaturesFailed(serviceResult);
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
        data.totalCount = results.result.totalCount;
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
      features = this.features.features || this.features;
      if (results.result.totalCount === 0) {
        this.triggerEvent('featureisempty', {
          results
        });
        return;
      }
      let fields, fieldCaptions, fieldTypes;
      if (results.result.datasetInfos) {
        fields = [];
        fieldCaptions = [];
        fieldTypes = [];
        const fieldInfos = results.result.datasetInfos[0].fieldInfos;
        fieldInfos.forEach(fieldInfo => {
          if (fieldInfo.name) {
            fields.push(fieldInfo.name.toUpperCase());
            fieldCaptions.push(fieldInfo.caption.toUpperCase());
            fieldTypes.push(fieldInfo.type);
          }
        });
      }
      data = statisticsFeatures(features, fields, fieldCaptions, fieldTypes);
      data.totalCount = results.result.totalCount;
    } else {
      this.triggerEvent('getdatafailed', {
        results
      });
      return;
    }

    /**
     * @event iServerRestService#getdatasucceeded
     * @description 请求数据成功后触发。
     * @property {Object} e  - 事件对象。
     */
    this.triggerEvent('getdatasucceeded', data);
  }

  _getFeaturesFailed(serviceResult) {
    this.fetchFailed(serviceResult.error);
  }

  _getRestDataFields(fieldsUrl, queryInfo, callBack) {
    FetchRequest.get(fieldsUrl, null, {
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
    let param = new QueryBySQLParameters({
      queryParams: [
        new FilterParameter({
          name: layerName,
          attributeFilter: 'SMID=0'
        })
      ]
    });
    const queryBySQLSerice = new QueryBySQLService(url, {
      proxy: this.options.proxy,
      withCredentials,
      eventListeners: {
        processCompleted: serviceResult => {
          let fields;
          if (serviceResult.result) {
            let result = serviceResult.result.recordsets[0];
            fields = this._getFiledsByType(['CHAR', 'TEXT', 'WTEXT'], result.fields, result.fieldTypes);
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

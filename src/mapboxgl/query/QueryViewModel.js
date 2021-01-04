import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
// import iPortalDataParameter from '../../common/_types/iPortalDataParameter';
// import RestDataParameter from '../../common/_types/RestDataParameter';
// import RestMapParameter from '../../common/_types/RestMapParameter';
import { geti18n } from '../../common/_lang';
import '../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { getFeatureCenter, getValueCaseInsensitive } from '../../common/_utils/util';
import { checkAndRectifyFeatures } from '../../common/_utils/iServerRestService';
import bbox from '@turf/bbox';
import envelope from '@turf/envelope';
import transformScale from '@turf/transform-scale';

/**
 * @class QueryViewModel
 * @classdesc 查询组件功能类。
 * @category ViewModel
 * @param {Object} map - map 对象。
 * @param {Object} options - 可选参数。
 * @param {Object} [options.maxFeatures=200] - 查询最大返回要素个数。
 * @param {Object} [options.layerStyle] - 查询结果图层样式配置。
 * @param {Object} [options.layerStyle.line] - 线图层样式配置。
 * @param {Object} [options.layerStyle.circle] - 点图层样式配置。
 * @param {Object} [options.layerStyle.fill] - 面图层样式配置。
 * @param {Object} [options.layerStyle.stokeLine] - 面图层样式配置。
 * @extends mapboxgl.Evented
 * @fires QueryViewModel#querysucceeded
 * @fires QueryViewModel#queryfailed
 * @fires QueryViewModel#getfeatureinfosucceeded
 */
export default class QueryViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.options = options || {};
    this.maxFeatures = this.options.maxFeatures || 200;
    this.layerStyle = options.layerStyle || {};
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  clearResultLayer() {
    if (this.map) {
      this.strokeLayerID && this.map.getLayer(this.strokeLayerID) && this.map.removeLayer(this.strokeLayerID);
      this.layerID && this.map.getLayer(this.layerID) && this.map.removeLayer(this.layerID);
    }
  }

  removed() {
    this.bounds = null;
    this.clearResultLayer();
  }
  /**
   * @function QueryViewModel.prototype.query
   * @desc 开始查询。
   * @param {iPortalDataParameter|RestDataParameter|RestMapParameter} parameter - 查询配置参数。
   * @param {String} [queryBounds='mapBounds'] - 查询范围，可选值为 mapBounds（地图全图范围），currentMapBounds（当前地图范围）。
   */
  query(queryParameter, queryBounds) {
    if (!this.map) {
      return;
    }
    this.queryParameter = queryParameter;
    this.removed();
    this.queryBounds = queryBounds;
    if (queryBounds === 'currentMapBounds') {
      this.bounds = this.map.getBounds();
    }
    this.queryResult = null;
    if (queryParameter) {
      if (queryParameter.dataName) {
        this._queryByRestData(queryParameter);
      } else if (queryParameter.layerName) {
        this._queryByRestMap(queryParameter);
      } else {
        this._queryByIportalData(queryParameter);
      }
    }
    // if (queryParameter instanceof iPortalDataParameter) {
    //   this._queryByIportalData(queryParameter);
    // } else if (queryParameter instanceof RestDataParameter) {
    //   this._queryByRestData(queryParameter);
    // } else if (queryParameter instanceof RestMapParameter) {
    //   this._queryByRestMap(queryParameter);
    // }
  }

  _queryByRestMap(restMapParameter) {
    const options = { withCredentials: restMapParameter.withCredentials || false };
    if (restMapParameter.proxy) {
      options.proxy = restMapParameter.proxy;
    }
    if (this.bounds) {
      let param = new SuperMap.QueryByGeometryParameters({
        queryParams: {
          name: restMapParameter.layerName,
          attributeFilter: restMapParameter.attributeFilter
        },
        spatialQueryMode: SuperMap.SpatialQueryMode.INTERSECT,
        geometry: this.bounds,
        startRecord: 0,
        expectCount: restMapParameter.maxFeatures || this.maxFeatures
      });
      new mapboxgl.supermap.QueryService(restMapParameter.url, options).queryByGeometry(param, serviceResult => {
        this._mapQuerySucceed(serviceResult, restMapParameter, options);
      });
    } else {
      let param = new SuperMap.QueryBySQLParameters({
        queryParams: {
          name: restMapParameter.layerName,
          attributeFilter: restMapParameter.attributeFilter
        },
        startRecord: 0,
        expectCount: restMapParameter.maxFeatures || this.maxFeatures
      });
      new mapboxgl.supermap.QueryService(restMapParameter.url, options).queryBySQL(param, serviceResult => {
        this._mapQuerySucceed(serviceResult, restMapParameter, options);
      });
    }
  }
  _queryByRestData(restDataParameter) {
    let maxFeatures = restDataParameter.maxFeatures || this.maxFeatures;
    let toIndex = maxFeatures === 1 ? 0 : maxFeatures - 1;
    const options = { withCredentials: restDataParameter.withCredentials || false };
    if (restDataParameter.proxy) {
      options.proxy = restDataParameter.proxy;
    }
    if (this.bounds) {
      var boundsParam = new SuperMap.GetFeaturesByBoundsParameters({
        attributeFilter: restDataParameter.attributeFilter,
        datasetNames: restDataParameter.dataName,
        spatialQueryMode: 'INTERSECT',
        geometry: this.bounds,
        fromIndex: 0,
        toIndex
      });
      new mapboxgl.supermap.FeatureService(restDataParameter.url, options).getFeaturesByGeometry(
        boundsParam,
        serviceResult => {
          this._dataQuerySucceed(serviceResult, restDataParameter, options);
        }
      );
    } else {
      let param = new SuperMap.GetFeaturesBySQLParameters({
        queryParameter: {
          attributeFilter: restDataParameter.attributeFilter
        },
        datasetNames: restDataParameter.dataName,
        fromIndex: 0,
        toIndex
      });
      new mapboxgl.supermap.FeatureService(restDataParameter.url, options).getFeaturesBySQL(param, serviceResult => {
        this._dataQuerySucceed(serviceResult, restDataParameter, options);
      });
    }
  }
  async _mapQuerySucceed(serviceResult, restMapParameter, options) {
    let result = serviceResult.result;
    if (result && result.totalCount !== 0) {
      let resultFeatures = result.recordsets[0].features.features;
      const projectionUrl = `${restMapParameter.url}/prjCoordSys`;
      resultFeatures = await checkAndRectifyFeatures({ features: resultFeatures, epsgCode: restMapParameter.epsgCode, projectionUrl, options }).catch(
        error => {
          console.error(error);
          return resultFeatures;
        }
      );
      resultFeatures.length > 0 && (this.queryResult = { name: restMapParameter.name, result: resultFeatures });
      this._addResultLayer(this.queryResult);
      /**
       * @event QueryViewModel#querysucceeded
       * @description 查询成功后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('querysucceeded', { result: this.queryResult });
    } else if (result && result.totalCount === 0) {
      /**
       * @event QueryViewModel#queryfailed
       * @description 查询失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('queryfailed', { message: geti18n().t('query.noResults') });
    } else {
      this.fire('queryfailed', { message: geti18n().t('query.queryFailed') });
    }
  }

  async _dataQuerySucceed(serviceResult, restDataParameter, options) {
    let result = serviceResult.result;
    if (result && result.totalCount !== 0) {
      const { url, dataName, epsgCode } = restDataParameter;
      const dataSourceName = dataName[0].split(':')[0];
      const datasetName = dataName[0].split(':')[1];
      const projectionUrl = `${url}/datasources/${dataSourceName}/datasets/${datasetName}`;
      let resultFeatures = result.features.features;
      resultFeatures = await checkAndRectifyFeatures({ features: resultFeatures, epsgCode, projectionUrl, options }).catch(
        error => {
          console.error(error);
          return resultFeatures;
        }
      );
      resultFeatures.length > 0 && (this.queryResult = { name: restDataParameter.name, result: resultFeatures });
      this._addResultLayer(this.queryResult);
      this.fire('querysucceeded', { result: this.queryResult });
    } else if (result && result.totalCount === 0) {
      this.fire('queryfailed', { message: geti18n().t('query.noResults') });
    } else {
      this.fire('queryfailed', { message: geti18n().t('query.queryFailed') });
    }
  }

  _queryByIportalData(iportalDataParameter) {
    let url = iportalDataParameter.url;
    let withCredentials = iportalDataParameter.withCredentials || false;
    SuperMap.FetchRequest.get(url, null, { withCredentials })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data.succeed === false) {
          this.queryCount--;
          // 请求失败
          return;
        }
        // 是否有rest服务
        if (data.dataItemServices && data.dataItemServices.length > 0) {
          let dataItemServices = data.dataItemServices;
          let resultData = dataItemServices.find(
            item =>
              (item.serviceType === 'RESTDATA' || item.serviceType === 'RESTMAP') && item.serviceStatus === 'PUBLISHED'
          );
          if (resultData) {
            // 如果有服务，获取数据源和数据集, 然后请求rest服务
            this._getDatafromRest(resultData.serviceType, resultData.address, iportalDataParameter);
          } else {
            this.fire('queryfailed', { message: geti18n().t('query.seviceNotSupport') });
          }
        } else {
          this.fire('queryfailed', { message: geti18n().t('query.seviceNotSupport') });
        }
      })
      .catch(error => {
        this.fire('queryfailed', { message: error });
        console.log(error);
      });
  }

  _getDatafromRest(serviceType, address, iportalDataParameter) {
    if (serviceType === 'RESTDATA') {
      let url = `${address}/data/datasources`;

      let sourceName, datasetName; // 请求获取数据源名
      SuperMap.FetchRequest.get(url, null, { withCredentials: iportalDataParameter.withCredentials })
        .then(response => {
          return response.json();
        })
        .then(data => {
          sourceName = data.datasourceNames[0];
          url = `${address}/data/datasources/${sourceName}/datasets`;
          // 请求获取数据集名
          SuperMap.FetchRequest.get(url, null, { withCredentials: iportalDataParameter.withCredentials })
            .then(response => {
              return response.json();
            })
            .then(data => {
              datasetName = data.datasetNames[0];
              // 请求restdata服务
              this._queryByRestData({
                dataName: [sourceName + ':' + datasetName],
                url: `${address}/data`,
                name: iportalDataParameter.name,
                attributeFilter: iportalDataParameter.attributeFilter,
                maxFeatures: iportalDataParameter.maxFeatures,
                epsgCode: iportalDataParameter.epsgCode,
                withCredentials: iportalDataParameter.withCredentials
              });
            })
            .catch(error => {
              this.fire('queryfailed', { message: error });
              console.log(error);
            });
        })
        .catch(error => {
          this.fire('queryfailed', { message: error });
          console.log(error);
        });
    } else {
      // 如果是地图服务
      let url = `${address}/maps`;
      let mapName, layerName, path; // 请求获取地图名
      SuperMap.FetchRequest.get(url, null, { withCredentials: iportalDataParameter.withCredentials })
        .then(response => {
          return response.json();
        })
        .then(data => {
          mapName = data[0].name;
          path = data[0].path;
          url = url = `${address}/maps/${mapName}/layers`;
          // 请求获取图层名
          SuperMap.FetchRequest.get(url, null, { withCredentials: iportalDataParameter.withCredentials })
            .then(response => {
              return response.json();
            })
            .then(data => {
              layerName = data[0].subLayers.layers[0].caption;
              // 请求restmap服务
              this._queryByRestMap({
                layerName,
                url: path,
                name: iportalDataParameter.name,
                attributeFilter: iportalDataParameter.attributeFilter,
                maxFeatures: iportalDataParameter.maxFeatures,
                epsgCode: iportalDataParameter.epsgCode,
                withCredentials: iportalDataParameter.withCredentials
              });
              return layerName;
            })
            .catch(error => {
              this.fire('queryfailed', { message: error });
              console.log(error);
            });
        })
        .catch(error => {
          this.fire('queryfailed', { message: error });
          console.log(error);
        });
    }
  }

  _addResultLayer() {
    this.layerID = this.queryParameter.name + new Date().getTime();
    let type = this.queryResult.result[0].geometry.type;
    let source = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.queryResult.result
      }
    };
    this._addOverlayToMap(type, source, this.layerID);
    const bounds = bbox(transformScale(envelope(source.data), 1.7));
    this.map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      { maxZoom: 17 }
    );
    this.getPopupFeature();
  }

  /**
   * @function QueryViewModel.prototype.getFilterFeature
   * @desc 获取过滤后的要素。
   * @param {String|Number} filter - 过滤条件，值应为要素的 properties 中的某个值。
   * @returns {Object} 要素信息。
   */
  getFilterFeature(filter) {
    let features = this.queryResult.result;
    let feature;
    for (let i = 0; i < features.length; i++) {
      let propertiesValue = getValueCaseInsensitive(features[i].properties, 'smid');
      if (filter === propertiesValue) {
        feature = this._getFeatrueInfo(features[i]);
        break;
      }
    }
    this.map.flyTo({ center: feature.coordinates });
    return feature;
  }

  _getFeatrueInfo(feature) {
    let featureInfo = {};
    let coordinates;
    let geometry = feature.geometry;
    if (
      geometry.type === 'MultiPolygon' ||
      geometry.type === 'Polygon' ||
      geometry.type === 'LineString' ||
      geometry.type === 'MultiLineString'
    ) {
      coordinates = getFeatureCenter(feature);
    } else {
      coordinates = geometry.coordinates;
    }
    featureInfo.coordinates = coordinates;
    featureInfo.info = [];
    for (let key in feature.properties) {
      feature.properties[key] && featureInfo.info.push({ attribute: key, attributeValue: feature.properties[key] });
    }
    return featureInfo;
  }

  /**
   * @function QueryViewModel.prototype.getPopupFeature
   * @desc 获得地图点击位置的要素信息。调用此方法后，需要监听 'getfeatureinfosucceeded' 事件获得要素。
   */
  getPopupFeature() {
    this.map.on('click', this.layerID, e => {
      let feature = e.features[0];
      let featureInfo = this._getFeatrueInfo(feature);
      /**
       * @event QueryViewModel#getfeatureinfosucceeded
       * @description 获取要素信息成功后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('getfeatureinfosucceeded', { featureInfo });
    });
  }

  /**
   * @function QueryViewModel.prototype.addPopup
   * @desc 添加弹窗。
   * @param {Array} coordinates - 弹窗坐标。
   * @param {HTMLElement} popupContainer - 弹窗 DOM 对象。
   */
  addPopup(coordinates, popupContainer) {
    popupContainer.style.display = 'block';
    this.map.flyTo({ center: coordinates });
    return new mapboxgl.Popup({
      className: 'sm-mapboxgl-tabel-popup',
      closeOnClick: true,
      closeButton: false,
      maxWidth: 'none',
      anchor: 'bottom'
    })
      .setLngLat(coordinates)
      .setDOMContent(popupContainer)
      .addTo(this.map);
  }
  _addOverlayToMap(type, source, layerID) {
    let mbglStyle = {
      circle: {
        'circle-color': '#409eff',
        'circle-opacity': 0.6,
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#409eff',
        'circle-stroke-opacity': 1
      },
      line: {
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      },
      fill: {
        'fill-color': '#409eff',
        'fill-opacity': 0.6,
        'fill-outline-color': '#409eff'
      }
    };
    let mbglTypeMap = {
      Point: 'circle',
      LineString: 'line',
      MultiLineString: 'line',
      Polygon: 'fill',
      MultiPolygon: 'fill'
    };
    type = mbglTypeMap[type];
    if (type === 'circle' || type === 'line' || type === 'fill') {
      let layerStyle = this.layerStyle[type];
      this.map.addLayer({
        id: layerID,
        type: type,
        source: source,
        paint: (layerStyle && layerStyle.paint) || mbglStyle[type],
        layout: (layerStyle && layerStyle.layout) || {}
      });
    }
    if (type === 'fill') {
      this.strokeLayerID = layerID + '-StrokeLine';
      let stokeLineStyle = this.layerStyle.stokeLine || {};
      let lineStyle = (stokeLineStyle && stokeLineStyle.paint) || {
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      };
      this.map.addLayer({
        id: this.strokeLayerID,
        type: 'line',
        source: source,
        paint: lineStyle
      });
    }
  }
}

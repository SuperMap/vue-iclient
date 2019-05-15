import WidgetViewModel from './WidgetViewModel';
import cloneDeep from 'lodash.clonedeep';
/**
 * @class DataFlowLayerViewModel
 * @category ViewModel
 * @classdesc 数据流图层功能类。
 * @param {mapboxgl.Map} map - mapboxgl map 对象。
 * @param {String} dataFlowUrl - 数据流服务地址。
 * @param {Object} [options] - 可选参数。
 * @param {String} [options.layerId] - 图层 ID。
 * @param {GeoJSONObject} [options.geometry] - 指定几何范围，该范围内的要素才能被订阅。
 * @param {Object} [options.excludeField] - 排除字段。
 * @param {Object} [options.styleOptions] - style OPtion
 * @fires DataFlowLayerViewModel#subscribesucceeded
 * @fires DataFlowLayerViewModel#subscribefailed
 * @fires DataFlowLayerViewModel#dataUpdated
 * @extends {WidgetViewModel}
 */

export default class DataFlowLayerViewModel extends WidgetViewModel {
  constructor(map, dataFlowUrl, options) {
    super();
    if (!dataFlowUrl) {
      throw new Error('dataFlowUrl is requierd');
    }
    if (!map) {
      throw new Error('map is requierd');
    }
    
    this.options = options || {};
    this.map = map;
    this.dataFlowUrl = dataFlowUrl;
    this.sourceID = options.layerId || 'dataFlow' + new Date().getTime();

    if (this.options.registerToken) {
      SuperMap.SecurityManager.registerToken(this.dataFlowUrl, this.options.registerToken);
    }

    this._initializeDataFlow();
  }

  /**
   * @function DataFlowLayerViewModel.prototype.setExcludeField
   * @description 设置唯一字段。
   * @param {string} excludeField - 唯一字段。
   */
  setExcludeField(excludeField) {
    this.dataService.setExcludeField(excludeField);
    this.options.excludeField = excludeField;
    return this;
  }

  /**
   * @function DataFlowLayerViewModel.prototype.setGeometry
   * @description 设置集合要素。
   * @param {GeoJSONObject} geometry - 待设置的 GeoJSON 几何要素对象。
   */
  setGeometry(geometry) {
    this.dataService.setGeometry(geometry);
    this.options.geometry = geometry;
    return this;
  }

  _initializeDataFlow() {
    let dataService = new mapboxgl.supermap.DataFlowService(this.dataFlowUrl, {
      geometry: this.options.geometry,
      excludeField: this.options.excludeField
    }).initSubscribe();

    dataService.on('subscribeSocketConnected', e => {
      /**
       * @event DataFlowLayerViewModel#subscribesucceeded
       * @description 数据订阅成功后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('subscribesucceeded', e);
    });

    dataService.on('subscribeSocketError', e => {
      /**
       * @event DataFlowLayerViewModel#subscribefailed
       * @description 数据订阅失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.fire('subscribefailed', e);
    });

    dataService.on('messageSucceeded', msg => {
      this._addLayer(msg);
    });

    this.dataService = dataService;
  }

  _addLayer(msg) {
    if (!msg.featureResult) {
      return;
    }
    let feature = msg.featureResult;
    let type = feature.geometry.type;
    if (!this.map.getSource(this.sourceID)) {
      this.map.addSource(this.sourceID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [feature]
        }
      });
      if (type === 'Point') {
        this.map.addLayer({
          id: this.sourceID,
          type: 'circle',
          paint: {
            'circle-radius': 6,
            'circle-color': 'red'
          },
          source: this.sourceID
        });
      } else if (type === 'MultiPolygon' || type === 'Polygon') {
        this.map.addLayer({
          id: this.sourceID,
          type: 'fill',
          paint: {
            'fill-color': 'red',
            'fill-opacity': 1
          },
          source: this.sourceID
        });
      } else if (type === 'LineString' || type === 'Line' || type === 'MultiLineString') {
        this.map.addLayer({
          id: this.sourceID,
          type: 'line',
          paint: {
            'line-width': 5,
            'line-color': 'red',
            'line-opacity': 1
          },
          source: this.sourceID
        });
      }
    } else {
      // update layer
      let features = cloneDeep(this.map.getSource(this.sourceID)._data.features);
      let has = false;
      features.map((item, index) => {
        if (item.properties.id === feature.properties.id) {
          has = true;
          features[index] = feature;
          return;
        }
      });
      if (!has) {
        features.push(feature);
      }
      this.map.getSource(this.sourceID).setData({ type: 'FeatureCollection', features });

      /**
         * @event DataFlowLayerViewModel#dataUpdated
         * @description 数据更新成功后触发。
         * @property {GeoJSONObject} data - 更新的数据。
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
      this.fire('dataupdated', { data: feature, map: this.map });
    }
  }
}

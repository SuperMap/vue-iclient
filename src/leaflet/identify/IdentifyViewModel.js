import L from '../leaflet-wrapper';
import '../../../static/libs/iclient-leaflet/iclient-leaflet.min.js';
import cloneDeep from 'lodash.clonedeep';
/**
 * @class IdentifyViewModel
 * @description 点选 viewModel.
 * @param {Object} map - map 对象。
 * @param {String} [options.layerName] - 图层名。
 * @param {Object} [options.layerStyle] - 查询结果图层样式配置。
 * @extends L.Evented
 */

export default class IdentifyViewModel extends L.Evented {
  constructor(map, options) {
    super();
    this.map = map;
    this.layerNames = options.layerNames;
    this.layerStyle = options.layerStyle || {};
    this.popup = null;
    this.lastLayerName = '';
  }
  /**
   * @function IdentifyViewModel.prototype.getLayerByName
   * @desc 获取。
   * @param {Array} name - 图层名。
   */
  getLayerByName(name) {
    return this.map.getLayerByName(name);
  }

  /**
   * @function IdentifyViewModel.prototype.getLayerById
   * @desc 获取。
   * @param {Array} id - 图层名。
   */
  getLayerById(id) {
    return this.map.getLayerById(id);
  }

  /**
   * @function IdentifyViewModel.prototype.getLayerType
   * @desc 判断是否是geojson
   * @param {Array} layer - 图层名。
   */
  getLayerType(layer) {
    return layer instanceof L.GeoJSON;
  }

  /**
   * @function IdentifyViewModel.prototype.addOverlayToMap
   * @desc 添加高亮图层。
   * @param {Object} layer - layer。
   * @param {Object} feature - geojson
   * @param {Object} customStyle - 用户自定义样式
   */
  addOverlayToMap(layer, feature, customStyle = this.layerStyle) {
    // 高亮前，清除之前的高亮
    this.lastLayerName && this.removed(this.lastLayerName);
    // 默认样式
    let defaultStyle = {
      color: '#409eff',
      fillColor: '#409eff',
      fillOpacity: 1,
      opacity: 0.6,
      renderer: L.svg()
    };

    // new layer
    let styleOptions = Object.assign(cloneDeep(layer.options), defaultStyle, customStyle);
    let overlayer;
    let type = feature.geometry.type;
    if (type === 'Point' || type === 'MultiPoint') {
      let geoCoordinates = cloneDeep(feature.geometry.coordinates);
      overlayer = L.circleMarker(geoCoordinates.reverse(), styleOptions);
    } else {
      overlayer = L.geoJSON(feature, {
        style: function() {
          return styleOptions;
        }
      });
    }

    // 上图，记录图层名
    this.map.addLayer(overlayer, layer.name + '-SM-highlighted');
    this.lastLayerName = layer.name;
  }

  /**
   * @function IdentifyViewModel.prototype.removed
   * @desc 将客户端专题图的矢量要素转换成geojson。
   * @param {Object} themeFeature - themeFeature。
   */
  formatGeoJSON(themeFeature) {
    let formatObj = new SuperMap.Format.GeoJSON();
    let serverGeometry = SuperMap.ServerGeometry.fromGeometry(themeFeature.geometry);
    let geojson = formatObj.toGeoJSON(serverGeometry);
    geojson.properties = themeFeature.attributes;
    return geojson;
  }
  /**
   * @function IdentifyViewModel.prototype.removed
   * @desc 清除高亮图层。
   * @param {String} lastLayerName - 图层名。
   */
  removed(lastLayerName = this.lastLayerName) {
    // 移除高亮图层
    if (lastLayerName && this.getLayerByName(lastLayerName + '-SM-highlighted')) {
      this.map.removeLayer(this.getLayerByName(lastLayerName + '-SM-highlighted'));
      this.lastLayerName = '';
    }
  }
}

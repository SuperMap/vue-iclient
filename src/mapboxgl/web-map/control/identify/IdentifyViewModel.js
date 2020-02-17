import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class IdentifyViewModel
 * @description 点选 viewModel.
 * @param {Object} map - map 对象。
 * @param {Object} [options.layerStyle] - 查询结果图层样式配置。
 * @param {Object} [options.layerStyle.line] - 线图层样式配置。
 * @param {Object} [options.layerStyle.circle] - 点图层样式配置。
 * @param {Object} [options.layerStyle.fill] - 面图层样式配置。
 * @param {Object} [options.layerStyle.stokeLine] - 面图层样式配置。
 * @extends mapboxgl.Evented
 */

export default class IdentifyViewModel extends mapboxgl.Evented {
  constructor(map, options) {
    super();
    this.map = map;
    this.source = options.source;
    this.layerStyle = options.layerStyle || {};
    this.popup = null;
  }
  /**
   * @function IdentifyViewModel.prototype.addPopup
   * @desc 添加弹窗。
   * @param {Array} coordinates - 弹窗坐标。
   * @param {HTMLElement} popupContainer - 弹窗 DOM 对象。
   */
  addPopup(coordinates, popupContainer) {
    if (popupContainer) {
      popupContainer.style.display = 'block';
      this.popup = new mapboxgl.Popup({
        maxWidth: 'none',
        className: 'sm-mapboxgl-identify-popup'
      })
        .setLngLat(coordinates)
        .setDOMContent(popupContainer)
        .addTo(this.map);
    }
    return this.popup;
  }
  /**
   * @function IdentifyViewModel.prototype.addOverlayToMap
   * @desc 添加高亮图层。
   * @param {Object} layer - layer。
   */
  addOverlayToMap(layer, filter) {
    let mbglStyle = {
      circle: {
        'circle-color': '#409eff',
        'circle-opacity': 0.6,
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
      },
      symbol: {
        layout: {
          'icon-size': 5
        }
      }
    };
    let { type, id, paint } = layer;
    // 如果是面的strokline,处理成面
    if (id.includes('-strokeLine') && type === 'line') {
      type = 'fill';
      paint = {};
      id = id.substring(0, id.indexOf('-strokeLine'));
    }
    if (type === 'circle' || type === 'line' || type === 'fill') {
      let layerStyle = this.layerStyle[type];
      let highlightLayer = Object.assign({}, layer, {
        id: id + '-SM-highlighted',
        type,
        paint: (layerStyle && layerStyle.paint) || Object.assign({}, paint, mbglStyle[type]),
        layout: (layerStyle && layerStyle.layout) || {},
        filter
      });
      this.map.addLayer(highlightLayer);
    }
    if (type === 'fill') {
      let strokeLayerID = id + '-SM-StrokeLine';
      let stokeLineStyle = this.layerStyle.stokeLine || {};
      let lineStyle = (stokeLineStyle && stokeLineStyle.paint) || {
        'line-width': 3,
        'line-color': '#409eff',
        'line-opacity': 1
      };
      let highlightLayer = Object.assign({}, layer, {
        id: strokeLayerID,
        type: 'line',
        paint: lineStyle,
        filter
      });
      this.map.addLayer(highlightLayer);
    }
    // if(type === 'symbol') {
    //   let layout = Object.assign({}, layer.layout, {'icon-size': layer.layout['icon-size'] + 2})
    //   let highlightLayer = Object.assign({}, layer, {
    //     id: layerID + '-highlighted',
    //     layout,
    //     filter
    //   });
    //   this.map.addLayer(highlightLayer);
    // }
  }
  /**
   * @function IdentifyViewModel.prototype.removed
   * @desc 清除popup和高亮图层。
   */
  removed(source = this.source) {
    // 移除高亮图层
    this.removePopup();
    this.removeOverlayer(source);
  }
  removePopup() {
    if (this.popup) {
      this.popup.remove() && (this.popup = null);
    }
  }
  removeOverlayer(source = this.source) {
    for (let key in source) {
      let layers = source[key];
      layers &&
        layers.forEach &&
        layers.forEach(layerId => {
          this.map &&
            this.map.getLayer(layerId + '-SM-highlighted') &&
            this.map.removeLayer(layerId + '-SM-highlighted');
          this.map && this.map.getLayer(layerId + '-SM-StrokeLine') && this.map.removeLayer(layerId + '-SM-StrokeLine');
        });
    }
  }
}

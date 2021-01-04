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
const HIGHLIGHT_COLOR = '#01ffff';
const defaultPaintTypes = {
  circle: ['circle-radius', 'circle-stroke-width'],
  line: ['line-width'],
  fill: ['line-width']
};
export default class IdentifyViewModel extends mapboxgl.Evented {
  constructor(map, options) {
    super();
    this.map = map;
    this.layers = options.layers || [];
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
        className: 'sm-mapboxgl-identify-popup sm-mapboxgl-tabel-popup',
        closeButton: false
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
        'circle-color': HIGHLIGHT_COLOR,
        'circle-opacity': 0.6,
        'circle-stroke-color': HIGHLIGHT_COLOR,
        'circle-stroke-opacity': 1
      },
      line: {
        'line-color': HIGHLIGHT_COLOR,
        'line-opacity': 1
      },
      fill: {
        'fill-color': HIGHLIGHT_COLOR,
        'fill-opacity': 0.6,
        'fill-outline-color': HIGHLIGHT_COLOR
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
    }
    let layerStyle = this._setDefaultPaintWidth(this.map, type, id, defaultPaintTypes[type], this.layerStyle);
    if (type === 'circle' || type === 'line' || type === 'fill') {
      layerStyle = layerStyle[type];
      let highlightLayer = Object.assign({}, layer, {
        id: id + '-identify-SM-highlighted',
        type,
        paint: (layerStyle && layerStyle.paint) || Object.assign({}, paint, mbglStyle[type]),
        layout: (layerStyle && layerStyle.layout) || { visibility: 'visible' },
        filter
      });
      this.map.addLayer(highlightLayer);
    }
    if (type === 'fill') {
      let strokeLayerID = id + '-identify-SM-StrokeLine';
      let stokeLineStyle = layerStyle.strokeLine || layerStyle.stokeLine || {};
      let lineStyle = (stokeLineStyle && stokeLineStyle.paint) || {
        'line-width': 3,
        'line-color': HIGHLIGHT_COLOR,
        'line-opacity': 1
      };
      let highlightLayer = Object.assign({}, layer, {
        id: strokeLayerID,
        type: 'line',
        paint: lineStyle,
        layout: { visibility: 'visible' },
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
  removed(layers = this.layers) {
    // 移除高亮图层
    this.removePopup();
    this.removeOverlayer(layers);
  }
  removePopup() {
    if (this.popup) {
      this.popup.remove() && (this.popup = null);
    }
  }
  removeOverlayer(layers = this.layers) {
    layers &&
      layers.forEach(layerId => {
        this.map &&
          this.map.getLayer(layerId + '-identify-SM-highlighted') &&
          this.map.removeLayer(layerId + '-identify-SM-highlighted');
        this.map &&
          this.map.getLayer(layerId + '-identify-SM-StrokeLine') &&
          this.map.removeLayer(layerId + '-identify-SM-StrokeLine');
      });
  }

  _setDefaultPaintWidth(map, type, layerId, paintTypes, layerStyle) {
    if (!paintTypes) {
      return;
    }
    paintTypes.forEach(paintType => {
      let mapPaintProperty;
      if (type !== 'fill') {
        mapPaintProperty = map.getLayer(layerId) && map.getPaintProperty(layerId, paintType);
      } else {
        type = 'stokeLine';
      }
      layerStyle[type].paint[paintType] = layerStyle[type].paint[paintType] || mapPaintProperty;
      if (layerStyle[type].paint[paintType] === void 0 || layerStyle[type].paint[paintType] === '') {
        layerStyle[type].paint[paintType] = paintType === 'circle-stroke-width' || type === 'stokeLine' ? 2 : 8;
      }
    });
    return layerStyle;
  }
}

import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
/**
 * @class FeatureTableViewModel
 * @description FeatureTable viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends mapboxgl.Evented
 */

const HIGHLIGHT_COLOR = '#01ffff';
const defaultPaintTypes = {
  circle: ['circle-radius', 'circle-stroke-width'],
  line: ['line-width'],
  fill: ['line-width']
};

const mbglStyle = {
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

class FeatureTableViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.layerStyle = options.layerStyle || {};
    this.selectedKeys = [];
    this.diffKeys = [];
    this.selectLayerFn = this._selectLayerFn.bind(this);
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.fire('mapLoaded', map);
  }

  _selectLayerFn(e) {
    let pos = [e.point.x, e.point.y];
    const featuresInfo = this.map.queryRenderedFeatures(pos);
    if (featuresInfo && featuresInfo.length) {
      this.fire('changeSelectLayer', featuresInfo[0]);
    }
  }

  startSelectFeature() {
    this.map.on('click', this.selectLayerFn);
  }

  endSelectFeature() {
    this.map.off('click', this.selectLayerFn);
  }

  bindQueryRenderedFeatures(feature) {
    if (!feature || !feature.geometry) {
      return;
    }
    let coords = feature.geometry.coordinates;
    let point = this.map.project(coords);
    let features = this.map.queryRenderedFeatures(point);
    return features;
  }

  addOverlayToMap(layer, filter, selectedKeys, associateWithMap) {
    let { centerToFeature } = associateWithMap;
    if (!layer) {
      return;
    }
    let { type, id, paint } = layer;
    // 如果是面的strokline,处理成面
    if (id.includes('-strokeLine') && type === 'line') {
      type = 'fill';
      paint = {};
    }
    let layerStyle = this._setDefaultPaintWidth(this.map, type, id, defaultPaintTypes[type], this.layerStyle);
    if (['circle', 'fill', 'line'].includes(type)) {
      id = id + '-feature-table-SM-highlighted';
      layerStyle = layerStyle[type];
      let highlightLayer = Object.assign({}, layer, {
        id,
        type,
        paint: (layerStyle && layerStyle.paint) || Object.assign({}, paint, mbglStyle[type]),
        layout: (layerStyle && layerStyle.layout) || { visibility: 'visible' },
        filter
      });
      this.map.addLayer(highlightLayer);
      let latlng = selectedKeys[this.diffKeys[0]].geometry.coordinates;
      if ((centerToFeature && latlng) || (!centerToFeature && !this._inMapExtent(latlng))) {
        this.map.flyTo({ center: latlng });
      }
    }
    if (type === 'fill') {
      let strokeLayerID = id + '-feature-table-SM-StrokeLine';
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
    this.diffKeys = [];
  }
  //  数据变动 enabled change应该清空地图状态
  zoomToFeatures(selectedKeys, associateWithMap) {
    let { zoomToFeature } = associateWithMap;
    if (!zoomToFeature) {
      if (Object.keys(selectedKeys).length) {
        let features = Object.keys(selectedKeys).map(key => {
          return selectedKeys[key];
        });
        const geojson = {
          type: 'FeatureCollection',
          features
        };
        let bounds = bbox(transformScale(geojson, 2));
        this.map.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
          ],
          { maxZoom: this.map.getMaxZoom() }
        );
      }
    }
  }

  _inMapExtent(latlng) {
    const mapbounds = this.map.getBounds();
    return mapbounds && mapbounds.contains(latlng);
  }

  addOverlaysToMap(selectedKeys, associateWithMap) {
    const layers = this.map.getStyle().layers;
    this.removeOverlayer(layers);
    // 先去掉缓存
    // 去掉被移除的
    this.selectedKeys.forEach((key, index) => {
      if (!Object.keys(selectedKeys).includes[key]) {
        this.selectedKeys.splice(index, 1);
      }
    });
    // 添加被添加的
    Object.keys(selectedKeys).forEach(key => {
      if (!this.selectedKeys.includes[key]) {
        this.selectedKeys.push(key);
        this.diffKeys.push(key);
      }
    });
    let filter:any = ['any'];
    let feature:any = {};
    Object.keys(selectedKeys).forEach(key => {
      const features = this.bindQueryRenderedFeatures(selectedKeys[key]);
      if (features && features.length) {
        feature = features[0];
        filter.push(['==', 'index', feature.properties['index']]);
      }
    });
    this.addOverlayToMap(feature.layer, filter, selectedKeys, associateWithMap);
  }

  removeOverlayer(layers = this.layers) {
    layers = layers || this.map.getStyle().layers;
    layers &&
      layers.forEach(layerInfo => {
        let layerId = layerInfo.id;
        this.map &&
          this.map.getLayer(layerId + '-feature-table-SM-highlighted') &&
          this.map.removeLayer(layerId + '-feature-table-SM-highlighted');
        this.map &&
          this.map.getLayer(layerId + '-feature-table-SM-StrokeLine') &&
          this.map.removeLayer(layerId + '-feature-table-SM-StrokeLine');
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

  _initFeatures(layerName) {
    return this.map.getSource(layerName).getData().features;
  }

  removed() {}
}
export default FeatureTableViewModel;

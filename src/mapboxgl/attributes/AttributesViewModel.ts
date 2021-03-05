import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
/**
 * @class AttributesViewModel
 * @description Attributes viewModel.
 * @param {Object} map - map实例对象。
 * @fires mapLoaded - 地图加载
 * @extends mapboxgl.Evented
 */

interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}

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
  map: mapboxglTypes.Map;

  layerStyle: Object;

  selectedKeys: Array<string>;

  diffKeys: Array<string>;

  fire: any;

  layerName: string;

  selectLayerFn: MapEventCallBack;

  sourceId: string;

  layerId: string;

  strokeLayerID: string;


  constructor(options) {
    super();
    this.layerStyle = options.layerStyle || {};
    this.layerName = options.layerName;
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
    let pos: mapboxglTypes.LngLatLike = [e.point.x, e.point.y];
    const featuresInfo = this.map.queryRenderedFeatures(pos, {
      layers: [this.layerName]
    });
    if (featuresInfo && featuresInfo.length) {
      this.fire('changeSelectLayer', featuresInfo[0]);
    }
  }

  startSelectFeature() {
    this.map && this.map.on('click', this.selectLayerFn);
  }

  endSelectFeature() {
    this.map && this.map.off('click', this.selectLayerFn);
  }

  //  数据变动 enabled change应该清空地图状态
  zoomToFeatures(selectedKeys, associateWithMap) {
    let { zoomToFeature } = associateWithMap;
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
        { maxZoom: zoomToFeature ? this.map.getMaxZoom() : this.map.getZoom() }
      );
    }
  }

  _inMapExtent(featureObj) {
    const mapbounds: mapboxglTypes.LngLatBoundsLike = this.map.getBounds();
    if (this.diffKeys.length) {
      return this.diffKeys.every(key => {
        let { type, coordinates } = featureObj[key].geometry;
        if (['MultiLineString', 'Polygon'].includes(type)) {
          return coordinates.some(line => {
            return line.some(coordinate => {
              // @ts-ignore
              return mapbounds.contains(coordinate);
            });
          });
        } else if (['MultiPoint', 'LineString'].includes(type)) {
          return coordinates.some(coordinate => {
            // @ts-ignore
            return mapbounds.contains(coordinate);
          });
        } else if (type === 'MultiPolygon') {
          return coordinates[0].some(polygon => {
            return polygon.some(coordinate => {
              // @ts-ignore
              return mapbounds.contains(coordinate);
            });
          });
        }
        // @ts-ignore
        return mapbounds.contains(coordinates);
      });
    }
    return false;
  }

  addOverlaysToMap(selectedKeys, associateWithMap, featureMap, layerStyleOptions, attributesTitle) {
    // 先去掉缓存
    // 去掉被移除的
    this.selectedKeys.forEach((key, index) => {
      if (!Object.keys(selectedKeys).includes(key)) {
        this.selectedKeys.splice(index, 1);
      }
    });
    // 添加被添加的
    Object.keys(selectedKeys).forEach(key => {
      if (!this.selectedKeys.includes(key)) {
        this.selectedKeys.push(key);
        this.diffKeys.push(key);
      }
    });
    let filter: any = ['any'];
    // let feature: any = {};
    this.selectedKeys.forEach(key => {
      const feature = selectedKeys[key];
      if (feature) {
        filter.push(['==', 'index', feature.properties['index']]);
      }
    });
    this.addOverlayToMap(
      filter,
      selectedKeys,
      associateWithMap,
      featureMap,
      layerStyleOptions,
      attributesTitle
    );
  }

  addOverlayToMap(filter, selectedKeys, associateWithMap, featureMap, layerStyleOptions, attributesTitle) {
    let { centerToFeature, zoomToFeatures } = associateWithMap;
    if (!this.map) {
      return;
    }
    let layer = this.map.getLayer(this.layerName);
    let type, id: string, paint;
    let features = [];
    if (!layer) {
      for (const key in featureMap) {
        features.push(featureMap[key]);
      }
      switch (features[0].geometry.type) {
        case 'Point':
          type = 'circle';
          break;
        case 'LineString':
        case 'MultiLineString':
          type = 'line';
          break;
        case 'Polygon':
        case 'MultiPolygon':
          type = 'fill';
          break;
        default:
          break;
      }
      id = attributesTitle;
      this.sourceId = id + '-attributes-SM-highlighted-source';
      if (this.map.getSource(this.sourceId)) {
        //@ts-ignore
        this.map.getSource(this.sourceId).setData({
          type: 'FeatureCollection',
          features
        })
      } else {
        this.map.addSource(this.sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        });
      }
    } else {
      type = layer.type;
      id = layer.id;
      paint = layer.paint;
    }
    // 如果是面的strokline,处理成面
    if (id.includes('-strokeLine') && type === 'line') {
      type = 'fill';
      paint = {};
    }
    let layerStyle = this._setDefaultPaintWidth(
      type,
      id,
      defaultPaintTypes[type],
      layerStyleOptions || this.layerStyle
    );
    this.layerId = id + '-attributes-SM-highlighted';
    this.strokeLayerID = id + '-attributes-SM-StrokeLine';
    if (
      (!this.diffKeys.length && !this.selectedKeys.length) ||
      JSON.stringify(layerStyleOptions) !== JSON.stringify(this.layerStyle)
    ) {
      this.map.getLayer(this.layerId) && this.map.removeLayer(this.layerId);
      this.map.getLayer(this.strokeLayerID) && this.map.removeLayer(this.strokeLayerID);
    }
    if (['circle', 'fill', 'line'].includes(type)) {
      if (this.map.getLayer(this.layerId)) {
        this.map.setFilter(this.layerId, filter);
      } else {
        let highlight_layerStyle = layerStyle[type];
        let highlightLayer = {
          id: this.layerId,
          type,
          paint: (highlight_layerStyle && highlight_layerStyle.paint) || Object.assign({}, paint, mbglStyle[type]),
          layout: (highlight_layerStyle && highlight_layerStyle.layout) || { visibility: 'visible' },
          filter
        };
        highlightLayer = Object.assign({}, layer || { source: this.sourceId }, highlightLayer);
        this.map.addLayer(highlightLayer);
      }

      if (
        this.diffKeys.length &&
        (centerToFeature ||
          zoomToFeatures ||
          (!zoomToFeatures && Object.keys(selectedKeys).length && !this._inMapExtent(selectedKeys)))
      ) {
        this.zoomToFeatures(selectedKeys, associateWithMap);
      }
    }
    if (type === 'fill') {
      if (this.map.getLayer(this.strokeLayerID)) {
        this.map.setFilter(this.strokeLayerID, filter);
      } else {
        let stokeLineStyle = layerStyle.strokeLine || layerStyle.stokeLine || {};
        let lineStyle = (stokeLineStyle && stokeLineStyle.paint) || {
          'line-width': 3,
          'line-color': HIGHLIGHT_COLOR,
          'line-opacity': 1
        };
        let highlightLayer =  {
          id: this.strokeLayerID,
          type: 'line',
          paint: lineStyle,
          layout: { visibility: 'visible' },
          filter
        };
        highlightLayer = Object.assign({}, layer || { source: this.sourceId }, highlightLayer);
        //@ts-ignore
        this.map.addLayer(highlightLayer);
      }
    }
    this.diffKeys = [];
  }

  reset(options) {
    this.layerStyle = options.layerStyle || {};
    this.layerName = options.layerName;
    this.selectedKeys = [];
    this.diffKeys = [];
  }

  _setDefaultPaintWidth(type, layerId, paintTypes, layerStyle) {
    if (!paintTypes) {
      return;
    }
    paintTypes.forEach(paintType => {
      let mapPaintProperty;
      if (type !== 'fill') {
        mapPaintProperty = this.map.getLayer(layerId) && this.map.getPaintProperty(layerId, paintType);
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

  _initFeatures(layerName: string) {
    // @ts-ignore
    return this.map.getSource(layerName).getData().features;
  }

  removed() {
    this.map.getLayer(this.layerId) && this.map.removeLayer(this.layerId);
    this.map.getLayer(this.strokeLayerID) && this.map.removeLayer(this.strokeLayerID);
    this.map.getSource(this.sourceId) && this.map.removeSource(this.sourceId);
  }
}
export default FeatureTableViewModel;

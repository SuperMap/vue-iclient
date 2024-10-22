import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import { geti18n } from 'vue-iclient/src/common/_lang/index';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { getValueCaseInsensitive } from 'vue-iclient/src/common/_utils/util';
import bbox from '@turf/bbox';
import envelope from '@turf/envelope';
import transformScale from '@turf/transform-scale';
import getFeatures from 'vue-iclient/src/common/_utils/get-features';

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
    super({ name: 'query', style: options.highlightStyle });
    this.options = options || {};
    this.maxFeatures = this.options.maxFeatures || 200;
    this.layerStyle = options.layerStyle || {};
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  clearResultLayer(relatedLayerIds) {
    if (this.map) {
      const layerIds = [this.strokeLayerID, this.layerID].concat(relatedLayerIds).filter(item => !!item);
      layerIds.forEach(item => {
        if (this.map.getLayer(item)) {
          this.map.removeLayer(item);
        }
      });
      layerIds.forEach(item => {
        if (this.map.getSource(item)) {
          this.map.removeSource(item);
        }
      });
    }
  }

  clear(layerIds) {
    this.bounds = null;
    this.clearResultLayer(layerIds);
  }

  /**
   * @function QueryViewModel.prototype.query
   * @desc 开始查询。
   * @param {iPortalDataParameter|RestDataParameter|RestMapParameter} parameter - 查询配置参数。
   * @param {String} [queryBounds='mapBounds'] - 查询范围，可选值为 mapBounds（地图全图范围），currentMapBounds（当前地图范围）。
   */
  async query(queryParameter, queryBounds) {
    if (!this.map) {
      return;
    }
    this.queryParameter = queryParameter;
    this.clear();
    this.queryBounds = queryBounds;
    if (queryBounds === 'currentMapBounds') {
      this.bounds = this.map.getBounds();
    }
    this.queryResult = null;
    if (queryParameter) {
      try {
        const queryOptions = {
          maxFeatures: queryParameter.maxFeatures || this.maxFeatures,
          keyWord: queryParameter.queryMode === 'KEYWORD' ? queryParameter.attributeFilter : '',
          bounds: this.bounds
        };
        const res = await getFeatures({ ...queryParameter, ...queryOptions });
        if (res.type === 'featureisempty') {
          this.fire('queryfailed', { message: geti18n().t('query.noResults') });
          return;
        }
        this.queryResult = { name: queryParameter.name, result: res.features, fields: res.fields };
        this._addResultLayer(this.queryResult);
        this.fire('querysucceeded', { result: this.queryResult, layers: [this.layerID, this.strokeLayerID].filter(item => !!item) });
      } catch (error) {
        this.fire('queryfailed', { message: geti18n().t('query.queryFailed') });
      }
    }
  }

  _addResultLayer() {
    this.layerID = `${this.queryParameter.name}-SM-query-result`;
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
        [Math.max(bounds[0], -180), bounds[1]],
        [Math.min(bounds[2], 180), bounds[3]]
      ],
      { maxZoom: 17 }
    );
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

import type { CircleLayer, FillLayer, GeoJSONSourceRaw, LineLayer, LngLatBounds, Map } from 'mapbox-gl';
import type { HighlightStyle } from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient-static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import bbox from '@turf/bbox';
import envelope from '@turf/envelope';
import transformScale from '@turf/transform-scale';
import getFeatures from 'vue-iclient-core/utils/get-features';

export interface QueryOptions {
  maxFeatures?: number | string;
  layerStyle?: HighlightStyle;
}

export interface QueryParameter {
  name?: string;
  maxFeatures?: number | string;
  keyWord?: string;
  bounds?: LngLatBounds;
  queryMode?: 'KEYWORD' | 'SQL';
  attributeFilter?: string;
  onlyService?: boolean;
  type?: 'iPortal';
}

export interface QueryResultParams {
  name: string
  result: GeoJSON.Feature[]
  fields: string[]
}

export interface QueryResultEvent {
  result: QueryResultParams
  layers: string[]
}

export type QueryBoundsType = 'mapBounds' | 'currentMapBounds';

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
  map: Map;
  layerStyle: Partial<HighlightStyle>;
  maxFeatures: number | string;
  queryResult: QueryResultParams;
  bounds: LngLatBounds;
  queryBounds: QueryBoundsType;
  strokeLayerID: string;
  layerID: string;
  queryParameter: QueryParameter;
  options: QueryOptions;

  fire: ((name: 'queryfailed', data: { code_name: 'NO_RESULTS' | 'SEVICE_NOT_SUPPORT' | 'QUREY_FAILED' }) => void) & ((name: 'querysucceeded', data: QueryResultEvent) => void);
  on: (name: string, data: (...rest: any) => void) => void;
  off: (name: string, data?: (...rest: any) => void) => void;

  constructor(options: QueryOptions) {
    super();
    this.options = options || {};
    this.maxFeatures = this.options.maxFeatures || 200;
    this.layerStyle = options.layerStyle || {};
  }

  setMap(mapInfo: { map: Map }) {
    const { map } = mapInfo;
    this.map = map;
  }

  clearResultLayer(relatedLayerIds: string[]) {
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

  clear(layerIds?: string[]) {
    this.bounds = null;
    this.clearResultLayer(layerIds);
  }

  /**
   * @function QueryViewModel.prototype.query
   * @desc 开始查询。
   * @param {iPortalDataParameter|RestDataParameter|RestMapParameter} parameter - 查询配置参数。
   * @param {String} [queryBounds='mapBounds'] - 查询范围，可选值为 mapBounds（地图全图范围），currentMapBounds（当前地图范围）。
   */
  async query(queryParameter: QueryParameter, queryBounds: QueryBoundsType) {
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
        const queryOptions: QueryParameter = {
          maxFeatures: queryParameter.maxFeatures || this.maxFeatures,
          keyWord: queryParameter.queryMode === 'KEYWORD' ? queryParameter.attributeFilter : '',
          bounds: this.bounds
        };
        if (queryParameter.type === 'iPortal') {
          queryOptions.onlyService = true;
        }
        const res = await getFeatures({ ...queryParameter, ...queryOptions });
        if (res.type === 'featureisempty') {
          this.fire('queryfailed', { code_name: 'NO_RESULTS' });
          return;
        }
        this.queryResult = { name: queryParameter.name, result: res.features, fields: res.fields };
        this._addResultLayer();
        this.fire('querysucceeded', { result: this.queryResult, layers: [this.layerID, this.strokeLayerID].filter(item => !!item) });
      } catch (error) {
        const code_name = error.onlyService ? 'SEVICE_NOT_SUPPORT' : 'QUREY_FAILED';
        this.fire('queryfailed', { code_name });
      }
    }
  }

  _addResultLayer() {
    this.layerID = `${this.queryParameter.name}-SM-query-result`;
    let type = this.queryResult.result[0].geometry.type;
    let source: GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.queryResult.result
      }
    };
    this._addOverlayToMap(type, source, this.layerID);
    // @ts-ignore
    const bounds = bbox(transformScale(envelope(source.data), 1.7));
    this.map.fitBounds(
      [
        [Math.max(bounds[0], -180), bounds[1]],
        [Math.min(bounds[2], 180), bounds[3]]
      ],
      { maxZoom: 17 }
    );
  }

  _addOverlayToMap(type: string, source: GeoJSONSourceRaw, layerID: string) {
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
      const layerInfo = {
        id: layerID,
        type: type,
        source: source,
        paint: (layerStyle && layerStyle.paint) || mbglStyle[type],
        layout: (layerStyle && layerStyle.layout) || {}
      };
      this.map.addLayer(layerInfo as CircleLayer | FillLayer | LineLayer);
    }
    if (type === 'fill') {
      this.strokeLayerID = layerID + '-StrokeLine';
      let stokeLineStyle = this.layerStyle.stokeLine || { paint: {} };
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

import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';

interface HighlightStyle {
  circle: InstanceType<typeof CircleStyle>;
  line: InstanceType<typeof LineStyle>;
  fill: InstanceType<typeof FillStyle>;
  strokeLine?: InstanceType<typeof LineStyle>;
  stokeLine?: InstanceType<typeof LineStyle>;
}

interface HighlightLayerOptions {
  name: string;
  style: HighlightStyle;
  layerIds?: string[];
  fields?: string[];
  filter?: any[];
  clickTolerance?: number;
}

type StyleTypes = Array<keyof HighlightStyle>;

type BasicStyleAttrs = {
  [prop in StyleTypes[number]]?: string[];
};

type LayerClickedFeature = mapboxglTypes.MapboxGeoJSONFeature & {
  _vectorTileFeature: {
    _keys: string[];
    [prop: string]: any;
  };
};

const HIGHLIGHT_COLOR = '#01ffff';

const PAINT_BASIC_ATTRS: BasicStyleAttrs = {
  circle: ['circle-radius', 'circle-stroke-width'],
  line: ['line-width'],
  strokeLine: ['line-width']
};
const PAINT_DEFAULT_STYLE = {
  'circle-radius': 8,
  'circle-stroke-width': 2,
  'line-width': 2
};

const LAYER_DEFAULT_STYLE = {
  circle: {
    paint: {
      'circle-color': HIGHLIGHT_COLOR,
      'circle-opacity': 0.6,
      'circle-stroke-color': HIGHLIGHT_COLOR,
      'circle-stroke-opacity': 1
    },
    layout: {
      visibility: 'visible'
    }
  },
  line: {
    paint: {
      'line-color': HIGHLIGHT_COLOR,
      'line-opacity': 1
    },
    layout: {
      visibility: 'visible'
    }
  },
  fill: {
    paint: {
      'fill-color': HIGHLIGHT_COLOR,
      'fill-opacity': 0.6,
      'fill-outline-color': HIGHLIGHT_COLOR
    },
    layout: {
      visibility: 'visible'
    }
  },
  symbol: {
    layout: {
      'icon-size': 5
    }
  },
  strokeLine: {
    paint: {
      'line-width': 3,
      'line-color': HIGHLIGHT_COLOR,
      'line-opacity': 1
    },
    layout: {
      visibility: 'visible'
    }
  }
};

const HIGHLIGHT_DEFAULT_STYLE: HighlightStyle = {
  circle: new CircleStyle(),
  line: new LineStyle(),
  fill: new FillStyle(),
  strokeLine: new LineStyle()
};

export default class HighlightLayer extends mapboxgl.Evented {
  uniqueName: string;
  targetLayerIds: string[] = [];
  hightlightStyle: HighlightStyle;
  filterExp?: any[];
  filterFields?: string[];
  clickTolerance = 5;

  constructor(options: HighlightLayerOptions) {
    super();
    this.uniqueName = options.name;
    this.hightlightStyle = this._transHighlightStyle(options.style);
    this.targetLayerIds = options.layerIds || [];
    this.filterExp = options.filter;
    this.filterFields = options.fields;
    this.clickTolerance = options.clickTolerance ?? 5;
    this._handleMapClick = this._handleMapClick.bind(this);
    this._handleMapMouseEnter = this._handleMapMouseEnter.bind(this);
    this._handleMapMouseLeave = this._handleMapMouseLeave.bind(this);
  }

  setHighlightStyle(style: HighlightStyle) {
    this.hightlightStyle = this._transHighlightStyle(style);
  }

  setTargetLayers(layerIds: string[]) {
    this.targetLayerIds = layerIds;
  }

  setFilterExp(exp: any[]) {
    this.filterExp = exp;
  }

  setFilterFields(fields: string[]) {
    this.filterFields = fields;
  }

  registerMapClick() {
    this.map.on('click', this._handleMapClick);
  }

  unregisterMapClick() {
    this.map.off('click', this._handleMapClick);
  }

  registerLayerMouseEvents(layerIds: string[]) {
    this.setTargetLayers(layerIds);
    layerIds.forEach(layerId => {
      this.map.on('mousemove', layerId, this._handleMapMouseEnter);
      this.map.on('mouseleave', layerId, this._handleMapMouseLeave);
    });
  }

  unregisterLayerMouseEvents() {
    this.targetLayerIds.forEach(layerId => {
      this.map.off('mousemove', layerId, this._handleMapMouseEnter);
      this.map.off('mouseleave', layerId, this._handleMapMouseLeave);
    });
  }

  addHighlightLayers(layer: mapboxglTypes.Layer, filter?: any[]) {
    let type = layer.type as unknown as StyleTypes[number];
    let paint = layer.paint;
    const id = layer.id;
    // 如果是面的strokline，处理成面
    if (id.includes('-strokeLine') && type === 'line') {
      type = 'fill';
      paint = {};
    }
    const types = [type] as unknown as StyleTypes;
    if (type === 'fill') {
      types.push('strokeLine');
    }
    const layerHighlightStyle = this._createLayerHighlightStyle(types, id);
    if (['circle', 'line', 'fill'].includes(type)) {
      const layerStyle = layerHighlightStyle[type];
      const highlightLayer = Object.assign({}, layer, {
        id: this._createHightlightLayerId(id),
        type,
        paint: Object.assign({}, paint, LAYER_DEFAULT_STYLE[type].paint, layerStyle?.paint),
        layout: Object.assign({}, LAYER_DEFAULT_STYLE[type].layout, layerStyle?.layout),
        filter
      });
      this.map.addLayer(highlightLayer);
      this.targetLayerIds.push(id);
      this.targetLayerIds = this._uniqueLayerIds(this.targetLayerIds);
    }
    if (type === 'fill') {
      const layerStyle = layerHighlightStyle.strokeLine;
      const highlightLayer = Object.assign({}, layer, {
        id: this._createHighlightStrokeLayerId(id),
        type: 'line',
        paint: Object.assign({}, LAYER_DEFAULT_STYLE['strokeLine'].paint, layerStyle?.paint),
        layout: Object.assign({}, LAYER_DEFAULT_STYLE['strokeLine'].layout, layerStyle?.layout),
        filter
      });
      this.map.addLayer(highlightLayer);
    }
  }

  removeHighlightLayers(layerIds: string[] = []) {
    if (!this.map) {
      return;
    }
    const layersToRemove = this._getHighlightLayerIds(this._uniqueLayerIds(this.targetLayerIds.concat(layerIds)));
    layersToRemove.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
  }

  _createLayerHighlightStyle(types: StyleTypes, layerId: string) {
    const highlightStyle: HighlightStyle = JSON.parse(JSON.stringify(this.hightlightStyle));
    types
      .filter(type => PAINT_BASIC_ATTRS[type])
      .forEach(type => {
        if (!highlightStyle[type]) {
          // @ts-ignore
          highlightStyle[type] = HIGHLIGHT_DEFAULT_STYLE[type];
        }
        const paintBasicAttrs = PAINT_BASIC_ATTRS[type];
        paintBasicAttrs.forEach(paintType => {
          if (!highlightStyle[type].paint?.[paintType]) {
            const originPaintValue =
              type !== 'strokeLine' && this.map.getLayer(layerId) && this.map.getPaintProperty(layerId, paintType);
            highlightStyle[type].paint = Object.assign({}, highlightStyle[type].paint, {
              [paintType]: originPaintValue || PAINT_DEFAULT_STYLE[paintType]
            });
          }
        });
      });
    return highlightStyle;
  }

  _transHighlightStyle(highlightStyle: HighlightStyle) {
    const nextHighlightStyle = JSON.parse(JSON.stringify(highlightStyle));
    // 兼容 strokeLine 错误写法 stokeLine
    if ('stokeLine' in highlightStyle && !('strokeLine' in highlightStyle)) {
      nextHighlightStyle.strokeLine = highlightStyle.stokeLine;
      delete nextHighlightStyle.stokeLine;
    }
    return nextHighlightStyle;
  }

  _getHighlightLayerIds(layerIds: string[]) {
    return layerIds.reduce((idList, layerId) => {
      const highlightLayerId = this._createHightlightLayerId(layerId);
      const highlightStrokeLayerId = this._createHighlightStrokeLayerId(layerId);
      idList.push(highlightLayerId, highlightStrokeLayerId);
      return idList;
    }, []);
  }

  _uniqueLayerIds(layerIds: string[]) {
    return Array.from(new Set(layerIds));
  }

  _createHightlightLayerId(layerId: string) {
    return `${layerId}-${this.uniqueName}-SM-highlighted`;
  }

  _createHighlightStrokeLayerId(layerId: string) {
    const highlightLayerId = this._createHightlightLayerId(layerId);
    return `${highlightLayerId}-StrokeLine`;
  }

  _handleMapClick(e: mapboxglTypes.MapLayerMouseEvent) {
    const features = this._queryLayerFeatures(e);
    this.removeHighlightLayers();
    if (features[0]?.layer) {
      this.addHighlightLayers(features[0].layer, this.filterExp ?? this._createFilterExp(features[0], this.filterFields));
    }
    this.fire('mapselectionchanged', { features });
  }

  _handleMapMouseEnter() {
    this.map.getCanvas().style.cursor = 'pointer';
  }

  _handleMapMouseLeave() {
    this.map.getCanvas().style.cursor = '';
  }

  _queryLayerFeatures(e: mapboxglTypes.MapLayerMouseEvent) {
    const map = e.target;
    const layersOnMap = this.targetLayerIds.filter(item => !!this.map.getLayer(item));
    const bbox = [
      [e.point.x - this.clickTolerance, e.point.y - this.clickTolerance],
      [e.point.x + this.clickTolerance, e.point.y + this.clickTolerance]
    ] as unknown as [mapboxglTypes.PointLike, mapboxglTypes.PointLike];
    const features = map.queryRenderedFeatures(bbox, {
      layers: layersOnMap
    }) as unknown as LayerClickedFeature[];
    return features;
  }

  _createFilterExp(feature: LayerClickedFeature, fields?: string[]) {
    // 高亮过滤(所有字段)
    const filterKeys = ['smx', 'smy', 'lon', 'lat', 'longitude', 'latitude', 'x', 'y', 'usestyle', 'featureinfo'];
    const isBasicType = (item: any) => {
      return typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean';
    };
    const filter: any[] = ['all'];
    const featureKeys: string[] = fields || feature._vectorTileFeature._keys;
    return featureKeys.reduce((exp, key) => {
      if (filterKeys.indexOf(key.toLowerCase()) === -1 && isBasicType(feature.properties[key])) {
        exp.push(['==', key, feature.properties[key]]);
      }
      return exp;
    }, filter);
  }
}

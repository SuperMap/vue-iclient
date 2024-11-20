import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';
import { getFeatureCenter, getValueCaseInsensitive } from 'vue-iclient/src/common/_utils/util';
import isEqual from 'lodash.isequal';
interface HighlightStyle {
  circle: InstanceType<typeof CircleStyle>;
  line: InstanceType<typeof LineStyle>;
  fill: InstanceType<typeof FillStyle>;
  fillExtrusion?: any;
  strokeLine?: InstanceType<typeof LineStyle>;
  stokeLine?: InstanceType<typeof LineStyle>;
}

interface FieldsDisplayInfo {
  field: string;
  title: string;
  slotName?: string;
}

interface LayerEventCursorMap {
  mousemove: string;
  mouseleave: string;
}

interface HighlightLayerOptions {
  name: string;
  layerIds?: string[];
  style: HighlightStyle;
  featureFieldsMap?: Record<string, string[]>;
  displayFieldsMap?: Record<string, FieldsDisplayInfo[]>;
  filter?: any[];
  clickTolerance?: number;
  multiSelection?: boolean;
  eventsCursor?: LayerEventCursorMap;
}

type StyleTypes = Array<keyof HighlightStyle>;

type BasicStyleAttrs = {
  [prop in StyleTypes[number]]?: string[];
};

type LayerClickedFeature = mapboxglTypes.MapboxGeoJSONFeature & {
  geometry: Exclude<GeoJSON.Geometry, GeoJSON.GeometryCollection>;
  _vectorTileFeature?: {
    _keys: string[];
    [prop: string]: any;
  };
};

interface PopupFieldsInfo {
  title: string;
  value: string;
  slotName?: string;
}

interface PopupFeatureInfo {
  coordinates: LayerClickedFeature['geometry']['coordinates'];
  info: PopupFieldsInfo[];
}

interface MapLoadInfo {
  map: mapboxglTypes.Map;
  [prop: string]: any;
}

enum DataSelectorMode {
  SINGLE = 'SINGLE', // 单选
  MULTIPLE = 'MULTIPLE', // 多选
  ALL = 'ALL' // 全选
}

interface MapSelectionChangedEmit {
  features: LayerClickedFeature[];
  popupInfos: PopupFeatureInfo['info'][];
  lnglats: PopupFeatureInfo['coordinates'][];
  highlightLayerIds: string[];
  targetId: string | undefined;
  dataSelectorMode: DataSelectorMode;
}

interface CreateFilterExpParams {
  feature: LayerClickedFeature;
  targetId?: string;
  fields?: string[];
}

interface UpdateHighlightOptions {
  layerId: string;
  features: LayerClickedFeature[];
}

interface CreateRelatedDatasParams {
  features: LayerClickedFeature[];
  targetId: string;
  isMultiple?: boolean;
}

type mapboxEnhanceLayer = mapboxglTypes.Layer & { l7layer?: any };

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
  'fill-extrusion': {
    paint: {
      'fill-extrusion-color': HIGHLIGHT_COLOR,
      'fill-extrusion-opacity': 0.6
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
  private dataSelectorMode: DataSelectorMode = DataSelectorMode.SINGLE;
  private activeTargetId: string | null = null;
  private resultFeatures: LayerClickedFeature[] = [];
  highlightOptions: HighlightLayerOptions;
  map: mapboxglTypes.Map;
  fire: (type: string, params?: any) => void;

  constructor(options: HighlightLayerOptions) {
    super();
    this.handleMapClick = this.handleMapClick.bind(this);
    this.handleMapMouseEnter = this.handleMapMouseEnter.bind(this);
    this.handleMapMouseLeave = this.handleMapMouseLeave.bind(this);
    this.handleLayerKeydown = this.handleLayerKeydown.bind(this);
    this.handleLayerKeyup = this.handleLayerKeyup.bind(this);

    this.highlightOptions = {
      ...options,
      style: this.transHighlightStyle(options.style),
      layerIds: (options.layerIds ?? []).slice(),
      featureFieldsMap: options.featureFieldsMap,
      displayFieldsMap: options.displayFieldsMap,
      clickTolerance: options.clickTolerance ?? 5,
      multiSelection: options.multiSelection ?? false
    };
  }

  setMap({ map, webmap }: MapLoadInfo) {
    this.map = map;
    this.webmap = webmap;
    this.registerMapClick();
    this.setTargetLayers(this.highlightOptions.layerIds);
  }

  setHighlightStyle(style: HighlightStyle) {
    this.highlightOptions.style = this.transHighlightStyle(style);
  }

  setTargetLayers(layerIds: string[]) {
    this.unregisterLayerMouseEvents();
    this.registerLayerMouseEvents(layerIds);
    this.unregisterLayerMultiClick();
    this.registerLayerMultiClick();
    this.highlightOptions.layerIds = layerIds;
  }

  setFeatureFieldsMap(fieldsMap: Record<string, string[]>) {
    this.highlightOptions.featureFieldsMap = fieldsMap;
  }

  setDisplayFieldsMap(fieldsMap: Record<string, FieldsDisplayInfo[]>) {
    this.highlightOptions.displayFieldsMap = fieldsMap;
  }

  setMultiSelection(multiSelection: boolean) {
    this.highlightOptions.multiSelection = multiSelection;
    this.unregisterLayerMultiClick();
    this.registerLayerMultiClick();
  }

  setClickTolerance(clickTolerance: number) {
    this.highlightOptions.clickTolerance = clickTolerance;
  }

  registerMapClick() {
    if (!this.map) {
      return;
    }
    this.map.on('click', this.handleMapClick);
  }

  unregisterMapClick() {
    if (!this.map) {
      return;
    }
    this.map.off('click', this.handleMapClick);
  }

  registerLayerMultiClick() {
    if (this.highlightOptions.multiSelection) {
      window.addEventListener('keydown', this.handleLayerKeydown);
      window.addEventListener('keyup', this.handleLayerKeyup);
    }
  }

  unregisterLayerMultiClick() {
    window.removeEventListener('keydown', this.handleLayerKeydown);
    window.removeEventListener('keyup', this.handleLayerKeyup);
  }

  registerLayerMouseEvents(layerIds: string[]) {
    if (!layerIds?.length || !this.map) {
      return;
    }
    layerIds.forEach(layerId => {
      this.map.on('mousemove', layerId, this.handleMapMouseEnter);
      this.map.on('mouseleave', layerId, this.handleMapMouseLeave);
    });
  }

  unregisterLayerMouseEvents() {
    if (!this.map) {
      return;
    }
    this.highlightOptions.layerIds.forEach(layerId => {
      this.map.off('mousemove', layerId, this.handleMapMouseEnter);
      this.map.off('mouseleave', layerId, this.handleMapMouseLeave);
    });
  }
  highlightL7Layer({ layer, features, filter }) {
    const { type, id, paint } = layer;
    const nextPaint = Object.assign({}, paint);
    let styleType = type;
    const highlightLayerStyle: HighlightStyle = JSON.parse(JSON.stringify(this.highlightOptions.style));
    switch (type) {
      case 'line-extrusion':
        styleType = 'line';
        break;
      case 'radar':
      case 'point-extrusion':
        styleType = 'circle';
        break;
      default:
        styleType = highlightLayerStyle[type] ? type : 'fill';
        break;
    }
    const paintKeys = Object.keys(paint);
    const { paint: paintStyle } = highlightLayerStyle[styleType];
    for (const key in paintStyle) {
      const matchKey = paintKeys.find(item => item.replace(`${type}-`, '') === key.replace(`${styleType}-`, ''));
      if (matchKey) {
        nextPaint[matchKey] = key.match(/-(radius|width)/)
          ? Math.max(paintStyle[key], nextPaint[matchKey])
          : paintStyle[key];
      }
    }
    this.webmap.copyLayer(id, { id: `${id}-${this.highlightOptions.name}-SM-highlighted`, filter, paint: nextPaint });
    this.setL7Filter(layer, features);
  }

  setL7Filter(layer, features) {
    layer.setSelectedDatas(features);
    const layerFilter = this.map.getFilter(layer.id);
    this.map.setFilter(layer.id, layerFilter);
  }

  addHighlightLayers(layer: mapboxEnhanceLayer, filter: any, features) {
    const { l7layer } = layer;
    if (l7layer) {
      this.highlightL7Layer({ layer, features, filter });
      return;
    } else {
      this.addNormalHighlightLayers(layer, filter);
    }
  }

  addNormalHighlightLayers(layer: mapboxglTypes.Layer, filter: any) {
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
    const layerHighlightStyle = this.createLayerHighlightStyle(types, id);
    if (['circle', 'line', 'fill', 'fill-extrusion'].includes(type)) {
      const layerStyle = layerHighlightStyle[type];
      const highlightLayer = Object.assign({}, layer, {
        id: this.createHightlightLayerId(id),
        type,
        paint: Object.assign({}, paint, LAYER_DEFAULT_STYLE[type].paint, layerStyle?.paint),
        layout: Object.assign({}, LAYER_DEFAULT_STYLE[type].layout, layerStyle?.layout),
        filter
      });
      this.map.addLayer(highlightLayer as mapboxglTypes.AnyLayer);
      this.highlightOptions.layerIds = this.uniqueLayerIds(this.highlightOptions.layerIds.concat(id));
    }
    if (type === 'fill') {
      const layerStyle = layerHighlightStyle.strokeLine;
      const highlightLayer = Object.assign({}, layer, {
        id: this.createHighlightStrokeLayerId(id),
        type: 'line',
        paint: Object.assign({}, LAYER_DEFAULT_STYLE['strokeLine'].paint, layerStyle?.paint),
        layout: Object.assign({}, LAYER_DEFAULT_STYLE['strokeLine'].layout, layerStyle?.layout),
        filter
      });
      this.map.addLayer(highlightLayer as mapboxglTypes.AnyLayer);
    }
  }

  updateHighlightDatas(data: UpdateHighlightOptions) {
    // @ts-ignore
    const matchLayer = this.map.getLayer(data.layerId).serialize();
    const features = data.features.map(item => {
      return {
        ...item,
        layer: matchLayer
      };
    });
    this.dataSelectorMode = DataSelectorMode.ALL;
    this.handleMapSelections(features);
  }

  removeHighlightLayers() {
    if (!this.map) {
      return;
    }
    this.highlightOptions.layerIds.forEach(layerId =>{
      const layer = this.map.getLayer(layerId);
      // @ts-ignore
      if (layer?.l7layer) {
        this.setL7Filter(layer, []);
      }
    })
    const layersToRemove = this.getHighlightLayerIds(this.highlightOptions.layerIds);
    layersToRemove.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
  }

  createPopupFeatureInfo(feature: LayerClickedFeature, targetId: string) {
    let displayFieldsList = this.highlightOptions.displayFieldsMap?.[targetId];
    if (!displayFieldsList || !displayFieldsList.length) {
      displayFieldsList = (this.highlightOptions.featureFieldsMap?.[targetId] ?? Object.keys(feature.properties)).map(
        item => {
          return {
            field: item,
            title: item
          };
        }
      );
    }
    const featureInfo: PopupFeatureInfo = {
      coordinates: this.calcFeatureCenterCoordinates(feature),
      info: displayFieldsList.reduce((list: PopupFieldsInfo[], item) => {
        if (Object.prototype.hasOwnProperty.call(feature.properties, item.field)) {
          list.push({
            title: item.title || item.field,
            value: feature.properties[item.field],
            slotName: item.slotName
          });
        }
        return list;
      }, [])
    };
    return featureInfo;
  }

  clear() {
    this.removeHighlightLayers();
    this.activeTargetId = null;
    this.resultFeatures = [];
    this.dataSelectorMode = DataSelectorMode.SINGLE;
  }

  removed() {
    this.clear();
    this.unregisterLayerMouseEvents();
    this.unregisterLayerMultiClick();
    this.unregisterMapClick();
  }

  private calcFeatureCenterCoordinates(feature: LayerClickedFeature) {
    const geometry = feature.geometry;
    if (
      geometry.type === 'MultiPolygon' ||
      geometry.type === 'Polygon' ||
      geometry.type === 'LineString' ||
      geometry.type === 'MultiLineString'
    ) {
      return getFeatureCenter(feature);
    }
    return geometry.coordinates;
  }

  private createFilterExp({
    feature,
    targetId,
    fields = this.highlightOptions.featureFieldsMap?.[targetId]
  }: CreateFilterExpParams) {
    // 高亮过滤(所有字段)
    const filterKeys = ['smx', 'smy', 'lon', 'lat', 'longitude', 'latitude', 'x', 'y', 'usestyle', 'featureinfo', '_id', 'id', 'smgeometry'];
    const isBasicType = (item: any) => {
      return typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean';
    };
    const UNIQUE_FIELD = ['SMID', 'SMPID'];
    const properties = feature.properties || {};
    let uniqueId;
    for (const name of UNIQUE_FIELD) {
      for (const attr in properties) {
        if (attr.toUpperCase() === name) {
          uniqueId = attr;
          break;
        }
      }
    }
    const filter: any[] = ['all'];
    const keys: string[] = fields || feature._vectorTileFeature?._keys || Object.keys(feature.properties);
    const featureKeys = uniqueId ? [uniqueId] : keys;

    return featureKeys.reduce((exp, key) => {
      if (filterKeys.indexOf(key.toLowerCase()) === -1 && isBasicType(feature.properties[key])) {
        exp.push(['==', ['get', key], feature.properties[key]]);
      }
      return exp;
    }, filter);
  }

  private createLayerHighlightStyle(types: StyleTypes, layerId: string) {
    const highlightStyle: HighlightStyle = JSON.parse(JSON.stringify(this.highlightOptions.style));
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
      // 3d填充面的样式用普通面的配置项
      highlightStyle['fill-extrusion'] = {
        paint: {
          'fill-extrusion-color': highlightStyle.fill.paint['fill-color'],
          'fill-extrusion-opacity': highlightStyle.fill.paint['fill-opacity'],
        }
      };
    return highlightStyle;
  }

  private transHighlightStyle(highlightStyle: HighlightStyle) {
    const nextHighlightStyle = JSON.parse(JSON.stringify(highlightStyle));
    // 兼容 strokeLine 错误写法 stokeLine
    if ('stokeLine' in highlightStyle && !('strokeLine' in highlightStyle)) {
      nextHighlightStyle.strokeLine = highlightStyle.stokeLine;
      delete nextHighlightStyle.stokeLine;
    }
    return nextHighlightStyle;
  }

  private getHighlightLayerIds(layerIds: string[]) {
    return layerIds.reduce((idList, layerId) => {
      const highlightLayerId = this.createHightlightLayerId(layerId);
      const highlightStrokeLayerId = this.createHighlightStrokeLayerId(layerId);
      if (this.map.getLayer(highlightLayerId)) {
        idList.push(highlightLayerId);
      }
      if (this.map.getLayer(highlightStrokeLayerId)) {
        idList.push(highlightStrokeLayerId);
      }
      return idList;
    }, []);
  }

  private uniqueLayerIds(layerIds: string[]) {
    return Array.from(new Set(layerIds));
  }

  private createHightlightLayerId(layerId: string) {
    return `${layerId}-${this.highlightOptions.name}-SM-highlighted`;
  }

  private createHighlightStrokeLayerId(layerId: string) {
    const highlightLayerId = this.createHightlightLayerId(layerId);
    return `${highlightLayerId}-StrokeLine`;
  }

  private handleMapClick(e: mapboxglTypes.MapLayerMouseEvent) {
    const features = this.queryLayerFeatures(e as mapboxglTypes.MapLayerMouseEvent);
    if (this.dataSelectorMode !== DataSelectorMode.MULTIPLE) {
      this.dataSelectorMode = DataSelectorMode.SINGLE;
    }
    this.activeTargetId = this.dataSelectorMode === DataSelectorMode.MULTIPLE ? features[0]?.layer?.id : null;
    this.handleMapSelections(features);
  }

  private handleMapSelections(features: LayerClickedFeature[]) {
    this.removeHighlightLayers();
    let popupDatas: PopupFeatureInfo[] = [];
    const matchTargetFeature = features[0];
    let activeTargetLayer = matchTargetFeature?.layer;
    if (activeTargetLayer) {
      switch (this.dataSelectorMode) {
        case DataSelectorMode.ALL:
          this.resultFeatures = features;
          break;
        case DataSelectorMode.MULTIPLE: {
          const id = matchTargetFeature.id || getValueCaseInsensitive(matchTargetFeature.properties, 'smid');
          const includesSameId = id
            ? this.resultFeatures.map(item => item.id || getValueCaseInsensitive(item.properties, 'smid')).includes(id)
            : false;
          const isClickSameFeature =
            includesSameId || this.resultFeatures.some(item => isEqual(item.geometry, matchTargetFeature.geometry));
          if (!isClickSameFeature) {
            this.resultFeatures.push(matchTargetFeature);
          }
          break;
        }
        default:
          this.resultFeatures = [matchTargetFeature];
          break;
      }
      const params: CreateRelatedDatasParams = {
        features: this.resultFeatures,
        targetId: activeTargetLayer.id,
        isMultiple: this.dataSelectorMode !== DataSelectorMode.SINGLE
      };
      const filterExps = this.createFilterExps(params);
      popupDatas = this.createPopupDatas(params);
      this.addHighlightLayers(activeTargetLayer as mapboxEnhanceLayer, filterExps, this.resultFeatures);
    }
    const emitData: MapSelectionChangedEmit = {
      features,
      popupInfos: popupDatas.map(item => item.info),
      lnglats: popupDatas.map(item => item.coordinates),
      highlightLayerIds: this.getHighlightLayerIds(this.highlightOptions.layerIds),
      targetId: activeTargetLayer?.id,
      dataSelectorMode: this.dataSelectorMode
    };
    if (this.highlightOptions.layerIds.length > 0) {
      this.fire('mapselectionchanged', emitData);
    }
  }

  private handleLayerKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && this.dataSelectorMode !== DataSelectorMode.MULTIPLE) {
      this.handleMapSelections([]);
      this.dataSelectorMode = DataSelectorMode.MULTIPLE;
    }
  }

  private handleLayerKeyup(e: KeyboardEvent) {
    if (e.key === 'Control') {
      this.dataSelectorMode = DataSelectorMode.SINGLE;
    }
  }

  private handleMapMouseEnter() {
    this.map.getCanvas().style.cursor = 'pointer';
  }

  private handleMapMouseLeave() {
    this.map.getCanvas().style.cursor = '';
  }

  private queryLayerFeatures(e: mapboxglTypes.MapLayerMouseEvent) {
    const map = e.target;
    const bbox = [
      [e.point.x - this.highlightOptions.clickTolerance, e.point.y - this.highlightOptions.clickTolerance],
      [e.point.x + this.highlightOptions.clickTolerance, e.point.y + this.highlightOptions.clickTolerance]
    ] as unknown as [mapboxglTypes.PointLike, mapboxglTypes.PointLike];
    const features = map.queryRenderedFeatures(bbox, {
      layers: this.activeTargetId
        ? [this.activeTargetId]
        : this.highlightOptions.layerIds.filter(item => !!this.map.getLayer(item))
    }) as unknown as LayerClickedFeature[];
    return features;
  }

  private createFilterExps(params: CreateRelatedDatasParams) {
    const { features, targetId, isMultiple } = params;
    return features.reduce(
      (filterExps: any[], feature) => {
        const filterExp = this.createFilterExp({ feature, targetId });
        filterExps.push(filterExp);
        return filterExps;
      },
      ['any']
    );
  }

  private createPopupDatas(params: CreateRelatedDatasParams) {
    const { features, targetId, isMultiple } = params;
    return features.reduce((popupDatas: PopupFeatureInfo[], feature) => {
      const popupInfo = this.createPopupFeatureInfo(feature, targetId);
      if (isMultiple) {
        popupDatas.push(popupInfo);
      } else {
        popupDatas = [popupInfo];
      }
      return popupDatas;
    }, []);
  }
}

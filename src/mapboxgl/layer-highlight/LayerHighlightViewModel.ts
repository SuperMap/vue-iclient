import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';
import WebMapViewModel from 'vue-iclient/src/mapboxgl/web-map/WebMapViewModel';
import { getFeatureCenter, getValueCaseInsensitive } from 'vue-iclient/src/common/_utils/util';
import isEqual from 'lodash.isequal';
import WFS from 'ol/format/WFS';
import GML32 from 'ol/format/GML32';
import GeoJSON from 'ol/format/GeoJSON';
import UniqueId from 'lodash.uniqueid';
import { XMLParser } from 'fast-xml-parser';
import { transformCoodinates, transformCoordinate } from 'vue-iclient/src/common/_utils/epsg-define';

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

const rasterSourceIdPrefix = 'sm_hightlight_source_';

export default class HighlightLayer extends mapboxgl.Evented {
  private dataSelectorMode: DataSelectorMode = DataSelectorMode.SINGLE;
  private activeTargetId: string | null = null;
  private resultFeatures: LayerClickedFeature[] = [];
  highlightOptions: HighlightLayerOptions;
  map: mapboxglTypes.Map;
  webmap: InstanceType<typeof WebMapViewModel>;
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

  setMap({ map, webmap }: mapInfoType) {
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
    } else {
      this.addNormalHighlightLayers(layer, features, filter);
    }
  }

  convertToMapboxType(geoJsonType) {
    const typeMap = {
      Point: 'circle',
      MultiPoint: 'circle',
      LineString: 'line',
      MultiLineString: 'line',
      Polygon: 'fill',
      MultiPolygon: 'fill'
    };
    return typeMap[geoJsonType] || null;
  }

  addNormalHighlightLayers(layer: mapboxglTypes.Layer, features: GeoJSON.Feature[], filter: any) {
    let type = layer.type as unknown as StyleTypes[number];
    const isWFSLayer = (layer.source as any)?.includes(rasterSourceIdPrefix) && !!features.length;
    if (isWFSLayer) {
      type = this.convertToMapboxType(features[0].geometry.type);
      const sourceConfig = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      };
      const layerSource = layer.source as string;
      layerSource && !this.map.getSource(layerSource) && this.map.addSource(layerSource, sourceConfig as any);
    }
    let paint = isWFSLayer ? {} : layer.paint;
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
    const layerHighlightStyle = this.createLayerHighlightStyle(types, id, isWFSLayer);
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
    // @ts-expect-error
    if (!this.map || !this.map.style) {
      return;
    }
    this.highlightOptions.layerIds.forEach(layerId => {
      const layer = this.map.getLayer(layerId);
      // @ts-ignore
      if (layer?.l7layer) {
        this.setL7Filter(layer, []);
      }
    });
    const layersToRemove = this.getHighlightLayerIds(this.highlightOptions.layerIds);
    layersToRemove.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
    Object.keys(this.map.getStyle().sources).forEach((s) => {
      s.includes(rasterSourceIdPrefix) && this.map.removeSource(s);
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
      geometry.type === 'MultiLineString' ||
      geometry.type === 'MultiPoint'
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
    const filterKeys = [
      'smx',
      'smy',
      'lon',
      'lat',
      'longitude',
      'latitude',
      'x',
      'y',
      'usestyle',
      'featureinfo',
      '_id',
      'id',
      'smgeometry'
    ];
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

  private createLayerHighlightStyle(types: StyleTypes, layerId: string, isWFSLayer) {
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
              !isWFSLayer && type !== 'strokeLine' && this.map.getLayer(layerId) && this.map.getPaintProperty(layerId, paintType);
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
        'fill-extrusion-opacity': highlightStyle.fill.paint['fill-opacity']
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

  private async handleMapClick(e: mapboxglTypes.MapLayerMouseEvent) {
    const features = await this.queryLayerFeatures(e as mapboxglTypes.MapLayerMouseEvent);
    if (this.dataSelectorMode !== DataSelectorMode.MULTIPLE) {
      this.dataSelectorMode = DataSelectorMode.SINGLE;
    }
    this.activeTargetId = this.dataSelectorMode === DataSelectorMode.MULTIPLE ? features[0]?.layer?.id : null;
    this.handleMapSelections(features);
  }

  private handleMapSelections(features: LayerClickedFeature[]) {
    this.removeHighlightLayers();
    let popupDatas: PopupFeatureInfo[] = [];
    let topLayerIndex = 0;
    const layers = this.map.getStyle().layers;
    features.forEach((f) => {
      const idx = layers.findIndex(l => l.id === f.layer.id);
      idx > topLayerIndex && (topLayerIndex = idx);
    });
    const topLayerId = layers?.[topLayerIndex]?.id;
    const matchTargetFeature = features.find(f => f.layer?.id === topLayerId) ?? features[0];
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

  private transformXML2Geojson(xml, dataProjection) {
    const wfsFormat = new WFS({
      version: '2.0.0',
      gmlFormat: new GML32()
    });
    const geoJsonFormat = new GeoJSON();
    const options = dataProjection === 'EPSG:4326' ? undefined : {
      dataProjection,
      featureProjection: 'EPSG:4326'
    };
    const features = wfsFormat.readFeatures(xml, options);
    const geoJson = geoJsonFormat.writeFeatures(features);
    const geojsonData = JSON.parse(geoJson);
    return geojsonData;
  }

  private async getWfsGeojson(url, datasetName, proj, filter) {
    const COUNT = 1000; // 限制1000条数据
    const separator = url.includes('?') ? '&' : '?';
    const getFeaturesUrl = `${url}${separator}SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&COUNT=${COUNT}&FILTER=${filter}&TYPENAMES=${datasetName}`;
    const featureResponse = await mapboxgl.supermap.FetchRequest.get(getFeaturesUrl, null, { withoutFormatSuffix: true });
    const featureXml = await featureResponse.text();
    const geojsonData = this.transformXML2Geojson(featureXml, proj);
    return geojsonData;
  }

  private getFilter(bbox: number[], epsgCode: number): string {
    const srcName = `urn:ogc:def:crs:EPSG::${epsgCode}`;
    const lowerCorner = `${bbox[0]} ${bbox[1]}`;
    const upperCorner = `${bbox[2]} ${bbox[3]}`;
    return `<Filter xmlns="http://www.opengis.net/fes/2.0"><BBOX><Envelope srsName="${srcName}" xmlns="http://www.opengis.net/gml/3.2"><lowerCorner>${lowerCorner}</lowerCorner><upperCorner>${upperCorner}</upperCorner></Envelope></BBOX></Filter>`;
  }

  // xml中多个返回数组格式，单个返回对象，此方法统一转化成数组
  private transformData(value: any | any[]): any[] {
    return Array.isArray(value) ? value : [value];
  }

  private async getWFSCapability(url: string): Promise<any> {
    const parser = new XMLParser({
      parseAttributeValue: false,
      attributeNamePrefix: ''
    });
    const separator = url.includes('?') ? '&' : '?';
    const requestUrl = `${url}${separator}SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`;
    const featureResponse = await mapboxgl.supermap.FetchRequest.get(requestUrl, null, { withoutFormatSuffix: true });
    const featureXml = await featureResponse.text();
    if (!featureXml) return null;
    const data = parser.parse(featureXml)['wfs:WFS_Capabilities'];
    return data;
  }

  private async getDatasetProjection(
    datasetNames: string[],
    url: string
  ): Promise<Record<string, string>> {
    const capability = await this.getWFSCapability(url);
    let featureTypeElements = capability['wfs:FeatureTypeList']['wfs:FeatureType'];
    featureTypeElements = this.transformData(featureTypeElements);
    const result = {};
    datasetNames.forEach((d) => {
      const target = featureTypeElements.find((f) => f['wfs:Name'] === d);
      const projection = target ? `EPSG:${target['wfs:DefaultCRS'].split('EPSG::')[1]}` : 'EPSG:3857';
      result[d] = projection;
    });
    return result;
  }

  private async queryWFSFeatures(wfsLayers, e) {
    const map = e.target;
    const pointBbox = [
      [e.point.x - this.highlightOptions.clickTolerance, e.point.y - this.highlightOptions.clickTolerance],
      [e.point.x + this.highlightOptions.clickTolerance, e.point.y + this.highlightOptions.clickTolerance]
    ];
    const features = [];
    if (wfsLayers?.length) {
      for (let i = 0; i < wfsLayers.length; i++) {
        const l = wfsLayers[i];
        const url = l.dataSource.url;
        const datasetName = l.dataSource.datasetName;
        const point1 = pointBbox[0];
        const point2 = pointBbox[1];
        const lnglat1 = e.target.unproject(point1).toArray();
        const lnglat2 = e.target.unproject(point2).toArray();
        const prjInfo = await this.getDatasetProjection([datasetName], url);
        const proj = prjInfo[datasetName];
        const transLngLat1 = transformCoordinate('EPSG:4326', proj, lnglat1);
        const transLngLat2 = transformCoordinate('EPSG:4326', proj, lnglat2);
        const wfsBbox = [
          Math.min(transLngLat1[0], transLngLat2[0]),
          Math.min(transLngLat1[1], transLngLat2[1]),
          Math.max(transLngLat1[0], transLngLat2[0]),
          Math.max(transLngLat1[1], transLngLat2[1])
        ];
        const filter = this.getFilter(wfsBbox, +proj.split(':')[1]);
        const geojson = await this.getWfsGeojson(url, datasetName, proj, filter);
        const mapLayer = map.getLayer(l.id) as any;
        const wfsFeatures = geojson.features.map(f => {
          const newF = {
            ...f,
            layer: {
              id: l.id,
              type: mapLayer?.type,
              metadata: mapLayer?.metadata || {},
              minzoom: mapLayer?.minzoom || 0,
              maxzoom: mapLayer?.maxzoom || 24,
              paint: mapLayer?.paint || {},
              layout: mapLayer?.layout || {},
              source: `${UniqueId(rasterSourceIdPrefix)}-SM-highlighted`
            }
          };
          return newF;
        });
        features.push(...wfsFeatures);
      }
    }
    return features;
  }

  private async queryLayerFeatures(e: mapboxglTypes.MapLayerMouseEvent) {
    const map = e.target;
    const bbox = [
      [e.point.x - this.highlightOptions.clickTolerance, e.point.y - this.highlightOptions.clickTolerance],
      [e.point.x + this.highlightOptions.clickTolerance, e.point.y + this.highlightOptions.clickTolerance]
    ] as unknown as [mapboxglTypes.PointLike, mapboxglTypes.PointLike];
    const sourceLayers = this.webmap.getAppreciableLayers();
    const wfsLayers = sourceLayers.filter(sl => sl.dataSource.type === 'WFS' && sl.visible && this.highlightOptions.layerIds.includes(sl.id));
    const wfsLayerIds = wfsLayers.map(wfsLayer => wfsLayer.id);
    const layerIds = this.activeTargetId
      ? [this.activeTargetId]
      : this.highlightOptions.layerIds.filter(item => !!this.map.getLayer(item));
    const features = map.queryRenderedFeatures(bbox, {
      layers: layerIds.filter(id => !wfsLayerIds.includes(id))
    }) as unknown as LayerClickedFeature[];
    if (wfsLayers?.length) {
      const wfsFeatures = await this.queryWFSFeatures(wfsLayers, e);
      features.push(...wfsFeatures);
    }
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

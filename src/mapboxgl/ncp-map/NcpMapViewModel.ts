import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../web-map/SourceListModel';
import { handleMultyPolygon } from '../_utils/geometry-util';
import labelPoints from './config/label-points.json';
export interface dataOptions {
  url?: string;
  name?: string;
  proxyUrl?: string;
  themeUrl?: string;
}

export interface mapOptions {
  center?: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number };
  zoom?: number;
  maxBounds?: [[number, number], [number, number]] | mapboxglTypes.LngLatBoundsLike;
  renderWorldCopies?: boolean;
  bearing?: number;
  pitch?: number;
  style?: any;
  interactive?: boolean;
  [props: string]: any;
}
const defaultThemeInfo = {
  field: '确诊',
  identifyField: '省份',
  stroke: {
    'line-width': 0.7,
    'line-color': '#696868',
    'line-opacity': 1
  },
  label: { 'text-size': 10, 'text-color': 'white', 'text-halo-color': '#696868', 'text-halo-width': 1 },
  defaultColor: '#f5f5f5',
  styleGroup: [
    {
      color: '#fdebcf',
      start: 1,
      end: 9
    },
    {
      color: '#f59e83',
      start: 9,
      end: 99
    },
    {
      color: '#e55a4e',
      start: 99,
      end: 499
    },
    {
      color: '#cb2a2f',
      start: 499,
      end: 999
    },
    {
      color: '#811c24',
      start: 999,
      end: 10000
    },
    {
      color: '#4f070d',
      start: 10000
    }
  ]
};
const Backup_Identify_Field = '地区';
const WORLD_WIDTH = 360;
export default class NcpMapViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  target: string;
  dataUrl: string;
  themeUrl: string;
  proxyUrl: string;
  mapOptions: mapOptions;
  defaultOverLayerId: string = '全省确诊人数';
  baseLayerId: string = '中国地图';
  overLayerId: string;
  features: any;
  themeInfo: any = defaultThemeInfo;
  fire: any;
  on: any;
  bounds: mapboxglTypes.LngLatBoundsLike;

  private _sourceListModel: SourceListModel;
  private _legendInfo: any;

  constructor(target: string, dataOptions: dataOptions = {}, mapOptions?: mapOptions) {
    super();
    this.target = target;
    const { url, name, proxyUrl, themeUrl } = dataOptions;
    this.dataUrl = url;
    this.themeUrl = themeUrl;
    this.proxyUrl = proxyUrl;
    this.mapOptions = mapOptions || {};
    this.overLayerId = name || this.defaultOverLayerId;
    this.bounds = mapOptions.bounds;
    this._initWebMap();
  }

  get getSourceListModel(): SourceListModel {
    return this._sourceListModel;
  }

  private _initWebMap(): void {
    this._createMap();
    this.map.on('load', () => {
      this._handleLayerInfo();
    });
  }

  private _createMap(): void {
    const { center, zoom, bearing, pitch, renderWorldCopies = false, interactive, style, bounds, preserveDrawingBuffer = false } = this.mapOptions;
    // 初始化 map
    style.glyphs = 'https://ncov.supermapol.com/statichtml/font/{fontstack}/{range}.pbf';
    this.map = new mapboxgl.Map({
      container: this.target,
      center: center || { lng: 104.93846582803894, lat: 33.37080662210445 },
      zoom: zoom || 3,
      bearing: bearing || 0,
      pitch: pitch || 0,
      bounds,
      renderWorldCopies,
      preserveDrawingBuffer,
      interactive: interactive === void 0 ? true : interactive,
      style: style || {
        version: 8,
        sources: {
          [this.baseLayerId]: {
            type: 'raster',
            tiles: [
              'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: this.baseLayerId,
            source: this.baseLayerId,
            type: 'raster',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      }
    });
  }

  private _handleLayerInfo(): void {
    if (this.dataUrl) {
      SuperMap.FetchRequest.get(this.dataUrl, null, { withoutFormatSuffix: true, proxy: this.proxyUrl })
        .then(response => {
          return response.json();
        })
        .then(features => {
          this.features = handleMultyPolygon(features.features);
          if (this.themeUrl) {
            this._handleThemeInfo();
          } else {
            this._addOverLayer();
          }
        })
        .catch(error => {
          console.log(error);
          this.fire('getlayerinfofailed', {
            error: error
          });
        });
    } else {
      this._sendMapToUser();
    }
  }

  private _creatNewLabelData(): GeoJSON.FeatureCollection {
    if (this.features.length > 0 && this.features[0].properties[this.themeInfo.identifyField] === undefined) {
      this.themeInfo.identifyField = Backup_Identify_Field;
    }
    const labels = {};
    this.features.forEach(feature => {
      labels[feature.properties[this.themeInfo.identifyField]] = feature.properties[this.themeInfo.field];
    });
    const newFeatures = labelPoints.features.map(point => {
      const properties = {};
      properties[this.themeInfo.identifyField] = point.properties['省份'];
      properties[this.themeInfo.field] = labels[point.properties['省份']];
      point.properties = properties;
      return point;
    });
    return { type: 'FeatureCollection', features: newFeatures };
  }
  private _handleThemeInfo(): void {
    if (this.themeUrl) {
      SuperMap.FetchRequest.get(this.themeUrl, null, { withoutFormatSuffix: true, proxy: this.proxyUrl })
        .then(response => {
          return response.json();
        })
        .then(themeInfo => {
          this.themeInfo = Object.assign({}, defaultThemeInfo, themeInfo);
          this._addOverLayer();
        })
        .catch(error => {
          console.log(error);
          this.fire('getthmeminfofailed', {
            error: error
          });
          this.themeInfo = defaultThemeInfo;
          this._addOverLayer();
        });
    } else {
      this._sendMapToUser();
    }
  }
  private _toFillColor({ styleGroup, field, defaultColor = '#f5f5f5' }): mapboxglTypes.Expression {
    const fillColor: mapboxglTypes.Expression = ['case'];
    for (let index = styleGroup.length - 1; index >= 0; index--) {
      const element = styleGroup[index];
      const stop = ['>=', ['to-number', ['get', field], 0], element.start];
      fillColor.push(stop);
      fillColor.push(element.color);
    }
    fillColor.push(defaultColor);
    return fillColor;
  }
  private _addOverLayer() {
    if (!this.features) return;
    const sourceData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: this.features };
    if (this.map.getSource(this.overLayerId)) {
      const source: mapboxglTypes.GeoJSONSource = <mapboxglTypes.GeoJSONSource>this.map.getSource(this.overLayerId);
      source.setData(sourceData);
      const labelData = this._creatNewLabelData();
      this.map.setPaintProperty(this.overLayerId, 'fill-color', this._toFillColor(this.themeInfo));
      this.map.setPaintProperty(`${this.overLayerId}-strokeLine`, 'line-color', this.themeInfo.stroke['line-color']);
      this.map.setPaintProperty(`${this.overLayerId}-strokeLine`, 'line-width', this.themeInfo.stroke['line-width']);
      this.map.setPaintProperty(
        `${this.overLayerId}-strokeLine`,
        'line-opacity',
        this.themeInfo.stroke['line-opacity']
      );
      const sourceLabel: mapboxglTypes.GeoJSONSource = <mapboxglTypes.GeoJSONSource>(
        this.map.getSource(`${this.overLayerId}-label`)
      );
      sourceLabel.setData(labelData);
      if (this.map.getLayer(`${this.overLayerId}-label`)) {
        this.map.setLayoutProperty(`${this.overLayerId}-label`, 'text-size', this.themeInfo.label['text-size']);
        this.map.setPaintProperty(`${this.overLayerId}-label`, 'text-color', this.themeInfo.label['text-color']);
        this.map.setPaintProperty(
          `${this.overLayerId}-label`,
          'text-halo-color',
          this.themeInfo.label['text-halo-color']
        );
        this.map.setPaintProperty(
          `${this.overLayerId}-label`,
          'text-halo-width',
          this.themeInfo.label['text-halo-width']
        );
      }

      this.map.setLayoutProperty(`${this.overLayerId}-label`, 'text-field', [
        'case',
        ['>', ['to-number', ['get', this.themeInfo.field], 0], 0],
        ['concat', ['get', this.themeInfo.identifyField], ['get', this.themeInfo.field]],
        ''
      ]);
    } else {
      this.map.addSource(this.overLayerId, {
        type: 'geojson',
        data: sourceData
      });
      this.map.addLayer({
        id: this.overLayerId,
        type: 'fill',
        source: this.overLayerId,
        layout: {},
        paint: {
          'fill-color': this._toFillColor(this.themeInfo)
        }
      });
      this.map.addLayer({
        id: `${this.overLayerId}-strokeLine`,
        type: 'line',
        source: this.overLayerId,
        layout: {},
        paint: this.themeInfo.stroke
      });
      const labelData: GeoJSON.FeatureCollection = this._creatNewLabelData() || {
        type: 'FeatureCollection',
        features: []
      };
      this.map.addSource(`${this.overLayerId}-label`, {
        type: 'geojson',
        data: labelData
      });
      this.map.addLayer({
        id: `${this.overLayerId}-label`,
        type: 'symbol',
        source: `${this.overLayerId}-label`,
        layout: {
          'text-field': [
            'case',
            ['>', ['to-number', ['get', this.themeInfo.field], 0], 0],
            ['concat', ['get', this.themeInfo.identifyField], ['get', this.themeInfo.field]],
            ''
          ],
          'text-font': ['Microsoft YaHei Regular'],
          'text-size': this.themeInfo.label['text-size'],
          'text-allow-overlap': true,
          'text-letter-spacing': 0,
          'text-max-width': 0
        },
        paint: {
          'text-color': this.themeInfo.label['text-color'],
          'text-opacity': 1,
          'text-halo-color': this.themeInfo.label['text-halo-color'],
          'text-halo-width': this.themeInfo.label['text-halo-width']
        }
      });

      // 图例处理
      this._initLegendInfo();
    }
    this._sendMapToUser();
  }

  private _sendMapToUser(): void {
    this._sourceListModel = new SourceListModel({
      map: this.map
    });
    if (this._legendInfo) {
      this._sourceListModel.addSourceStyle(this.overLayerId, this._legendInfo);
    }
    /**
     * @event WebMapViewModel#addlayerssucceeded
     * @description 添加图层成功。
     * @property {mapboxglTypes.Map} map - MapBoxGL Map 对象。
     * @property {Object} mapparams - 地图信息。。
     */
    this.fire('addlayerssucceeded', {
      map: this.map
    });
  }

  private _clearOverLayer(): void {
    if (this.map && this.map.getLayer(this.overLayerId)) {
      this.map.getLayer(this.overLayerId) && this.map.removeLayer(this.overLayerId);
      this.map.getLayer(`${this.overLayerId}-strokeLine`) && this.map.removeLayer(`${this.overLayerId}-strokeLine`);
      this.map.getLayer(`${this.overLayerId}-label`) && this.map.removeLayer(`${this.overLayerId}-label`);
      this.map.getSource(this.overLayerId) && this.map.removeSource(this.overLayerId);
      this.map.getSource(`${this.overLayerId}-label`) && this.map.removeSource(`${this.overLayerId}-label`);
    }
  }
  private _restTheme(): void {
    if (this.map && this.map.getLayer(this.overLayerId)) {
      this.themeInfo = defaultThemeInfo;
      this._addOverLayer();
    }
  }

  private _initLegendInfo(): void {
    this._legendInfo = {
      layerType: 'RANGE',
      featureType: 'POLYGON',
      layerId: this.overLayerId,
      themeField: this.themeInfo.field,
      styleGroup: this.themeInfo.styleGroup,
      integerType: true
    };
  }

  private centerValid(center) {
    if (
      center &&
      ((<[number, number]>center).length > 0 ||
        typeof center === mapboxgl.LngLat ||
        (<{ lng: number; lat: number }>center).lng)
    ) {
      return true;
    }
    return false;
  }

  private _getResizedZoom(bounds, mapContainerStyle, tileSize = 512, worldWidth = WORLD_WIDTH) {
    let { width, height } = mapContainerStyle;
    let lngArcLength = Math.abs(bounds.getEast() - bounds.getWest());
    let latArcLength = Math.abs(this._getBoundsRadian(bounds.getSouth()) - this._getBoundsRadian(bounds.getNorth()));
    let lngResizeZoom = +Math.log2(worldWidth / ((lngArcLength / parseInt(width)) * tileSize)).toFixed(2);
    let latResizeZoom = +Math.log2(worldWidth / ((latArcLength / parseInt(height)) * tileSize)).toFixed(2);
    if (lngResizeZoom <= latResizeZoom) {
      return lngResizeZoom;
    }
    return latResizeZoom;
  }

  private _getBoundsRadian(point) {
    return (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (point * Math.PI) / 360));
  }

  // TODO现在只限制了不同屏幕大小下地图bounds的经度不变， 纬度会随setZoom变化

  public resize(keepBounds = false): void {
    this.map && this.map.resize();
    let mapContainerStyle = window.getComputedStyle(document.getElementById(this.target));
    if (keepBounds && this.map && this.bounds && mapContainerStyle) {
      let zoom = this._getResizedZoom(this.bounds, mapContainerStyle);
      if (zoom !== this.map.getZoom()) {
        this.map && this.map.setZoom(zoom);
      }
    }
  }

  public setProxyUrl(proxyUrl) {
    this.proxyUrl = proxyUrl;
    this.map && this._handleLayerInfo();
  }
  public setCenter(center): void {
    if (this.map && this.centerValid(center)) {
      this.mapOptions.center = center;
      this.map.setCenter(center);
    }
  }

  public setZoom(zoom) {
    if (this.map) {
      this.mapOptions.zoom = zoom;
      (zoom || zoom === 0) && this.map.setZoom(zoom);
    }
  }

  public setMaxBounds(maxBounds): void {
    if (this.map) {
      this.mapOptions.maxBounds = maxBounds;
      maxBounds && this.map.setMaxBounds(maxBounds);
    }
  }

  public setBearing(bearing): void {
    if (this.map) {
      this.mapOptions.bearing = bearing;
      (bearing || bearing === 0) && this.map.setBearing(bearing);
    }
  }

  public setPitch(pitch): void {
    if (this.map) {
      this.mapOptions.pitch = pitch;
      (pitch || pitch === 0) && this.map.setPitch(pitch);
    }
  }

  public setRenderWorldCopies(renderWorldCopies): void {
    if (this.map) {
      this.mapOptions.renderWorldCopies = renderWorldCopies;
      renderWorldCopies && this.map.setRenderWorldCopies(renderWorldCopies);
    }
  }

  // public setStyle(style): void {
  //   if (this.map) {
  //     style.glyphs="https://ncov.supermapol.com/statichtml/font/{fontstack}/{range}.pbf"
  //     this.mapOptions.style = style;
  //     style && this.map.setStyle(style);
  //   }
  // }

  public setUrl(url: string): void {
    if (this.map) {
      this.dataUrl = url;
      url ? this._handleLayerInfo() : this._clearOverLayer();
    }
  }
  public setThemeUrl(url: string): void {
    if (this.map) {
      this.themeUrl = url;
      url ? this._handleThemeInfo() : this._restTheme();
    }
  }

  public setName(name: string): void {
    if (this.map) {
      this._clearOverLayer();
      this.overLayerId = name || this.defaultOverLayerId;
      this._addOverLayer();
    }
  }
}

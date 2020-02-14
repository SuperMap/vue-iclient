import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../web-map/SourceListModel';
import { handleMultyPolygon } from '../_utils/geometry-util';

export interface dataOptions {
  url?: string;
  name?: string;
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

export default class NcpMapViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  target: string;
  dataUrl: string;
  mapOptions: mapOptions;
  defaultOverLayerId: string = '全省确诊人数';
  baseLayerId: string = '中国地图';
  overLayerId: string;
  features: any;
  fire: any;
  on: any;

  private _sourceListModel: SourceListModel;
  private _legendInfo: any;

  constructor(target: string, dataOptions?: dataOptions, mapOptions?: mapOptions) {
    super();
    this.target = target;
    const { url, name } = dataOptions || {};
    this.dataUrl = url;
    this.mapOptions = mapOptions || {};
    this.overLayerId = name || this.defaultOverLayerId;
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
    const { center, zoom, bearing, pitch, renderWorldCopies, interactive, style, bounds } = this.mapOptions;
    // 初始化 map
    this.map = new mapboxgl.Map({
      container: this.target,
      center: center || { lng: 104.93846582803894, lat: 33.37080662210445 },
      zoom: zoom || 3,
      bearing: bearing || 0,
      pitch: pitch || 0,
      renderWorldCopies: renderWorldCopies || false,
      interactive: interactive === void 0 ? true : interactive,
      bounds,
      style: style || {
        version: 8,
        sources: {
          [this.baseLayerId]: {
            type: 'raster',
            tiles: ["https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}"],
            tileSize: 256
          }
        },
        layers: [
          {
            "id": this.baseLayerId,
            "source": this.baseLayerId,
            "type": "raster",
            'minzoom': 0,
            'maxzoom': 22
          }
        ]
      }
    });
  }

  private _handleLayerInfo(): void {
    if (this.dataUrl) {
      SuperMap.FetchRequest.get(this.dataUrl, null, { withoutFormatSuffix: true })
        .then(response => {
          return response.json();
        })
        .then(features => {
          this.features = handleMultyPolygon(features.features);
          this._addOverLayer();
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

  private _addOverLayer() {
    if (!this.features) return;
    const sourceData: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: this.features };
    if (this.map.getSource(this.overLayerId)) {
      const source: mapboxglTypes.GeoJSONSource = <mapboxglTypes.GeoJSONSource>this.map.getSource(this.overLayerId);
      source.setData(sourceData);
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
          'fill-color': [
            'case',
            ['>', ['to-number', ['get', '确诊'], 0], 10000],
            '#4f070d',
            ['>', ['to-number', ['get', '确诊'], 0], 999],
            '#811c24',
            ['>', ['to-number', ['get', '确诊'], 0], 499],
            '#cb2a2f',
            ['>', ['to-number', ['get', '确诊'], 0], 99],
            '#e55a4e',
            ['>', ['to-number', ['get', '确诊'], 0], 9],
            '#f59e83',
            ['>', ['to-number', ['get', '确诊'], 0], 0],
            '#fdebcf',
            '#f5f5f5'
          ]
        }
      });
      this.map.addLayer({
        id: `${this.overLayerId}-stroke`,
        type: 'line',
        source: this.overLayerId,
        layout: {},
        paint: {
          'line-width': 1,
          'line-color':'#c2bdbd',
          'line-opacity': 1
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
      this.map.getLayer(`${this.overLayerId}-stroke`) && this.map.removeLayer(`${this.overLayerId}-stroke`);
      this.map.getSource(this.overLayerId) && this.map.removeSource(this.overLayerId);
    }
  }

  private _initLegendInfo(): void {
    this._legendInfo = {
      layerType: 'RANGE',
      featureType: 'POLYGON',
      layerId: this.overLayerId,
      themeField: '确诊',
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
        }, {
          color: '#e55a4e',
          start: 99,
          end: 499
        }, {
          color: '#cb2a2f',
          start: 499,
          end: 999
        }, {
          color: '#811c24',
          start: 999,
          end: 10000
        }, {
          color: '#4f070d',
          start: 10000
        }
      ]
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

  public resize(): void {
    this.map && this.map.resize();
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

  public setStyle(style): void {
    if (this.map) {
      this.mapOptions.style = style;
      style && this.map.setStyle(style);
    }
  }

  public setUrl(url: string): void {
    if (this.map) {
      this.dataUrl = url;
      url ? this._handleLayerInfo() : this._clearOverLayer();
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

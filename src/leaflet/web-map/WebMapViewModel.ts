import L from '../leaflet-wrapper';
import '../../../static/libs/iclient-leaflet/iclient-leaflet.min';
// import echarts from 'echarts';  // TODO iclient 拿不到 echarts ???
import '../../../static/libs/geostats/geostats';
import getCenter from '@turf/center';
import WebMapBase from '../../common/web-map/WebMapBase';
import { toEpsgCode, getProjection } from '../../common/_utils/epsg-define';

interface webMapOptions {
  target?: string;
  serverUrl?: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  isSuperMapOnline?: boolean;
}

interface mapOptions {
  center?: [number, number] | L.LatLng;
  zoom?: number;
  maxBounds?: [[number, number], [number, number]] | L.Bounds;
  minZoom?: number;
  maxZoom?: number;
  crs?: L.CRS;
  preferCanvas?: boolean;
}

// TODO 坐标系 / noWrap
export default class WebMapViewModel extends WebMapBase {
  map: L.Map;

  center: [number, number] | L.LatLng;

  mapParams: { title?: string; description?: string };

  layers: any = {};

  crs: L.CRS;

  private _dataFlowLayer: any;

  private _dataflowFeatureCache: any;

  private _dataflowPathIdCache: any = {};

  private _dataflowLabelIdCache: any = {};

  private _dataflowLineFeatureCache: any = {};

  private _updateDataFlowFeaturesCallback: Function;

  private _unprojectCrs;

  constructor(id, options: webMapOptions = {}, mapOptions: mapOptions = {}) {
    super(id, options, mapOptions);
    this.center = mapOptions.center;
    this.zoom = mapOptions.zoom;
    this._initWebMap();
  }

  public resize() {
    this.map && this.map.invalidateSize();
    this.echartsLayerResize();
  }

  public setCenter(center): void {
    if (this.map) {
      this.mapOptions.center = center;
      center && (<[number, number]>center).length > 0 && this.map.setView(center, this.zoom);
    }
  }

  _initWebMap(): void {
    this.initWebMap();
  }

  _getMapInfo(mapInfo, _taskID) {
    let { layers } = mapInfo;
    this._layers = [];
    // 创建 MAP
    this._createMap(mapInfo);
    this._initBaseLayer(mapInfo, false);
    if (!layers || layers.length === 0) {
      this._sendMapToUser(0, 0);
    } else {
      this._initOverlayLayers(layers, _taskID);
    }
  }

  _createMap(mapInfo?): void {
    if (!mapInfo) {
      this.map = L.map(this.target, {
        center: this.center && (<number[]>this.center).length ? L.latLng(this.center[0], this.center[1]) : [0, 0],
        zoom: this.zoom || 0,
        crs: this.mapOptions.crs || L.CRS.EPSG3857,
        maxZoom: this.mapOptions.maxZoom || 30,
        minZoom: this.mapOptions.minZoom || 0,
        preferCanvas: this.mapOptions.preferCanvas || true
      });

      setTimeout(() => {
        this.triggerEvent('addlayerssucceeded', {
          map: this.map,
          mapparams: {},
          layers: []
        });
      }, 0);
      return;
    }
    let { level, maxZoom, minZoom } = mapInfo;

    // zoom & center
    let zoom = level ? level : 0;
    zoom = zoom === 0 ? 0 : zoom;

    let crs = this._handleMapCrs(mapInfo);
    let center = this._getMapCenter(mapInfo);

    // 初始化 map
    this.map = L.map(this.target, {
      center: this.center || center,
      zoom: this.zoom || zoom,
      crs,
      maxZoom: maxZoom || 30,
      minZoom: minZoom || 0,
      preferCanvas: true // unicode marker 需要 canvas
    });

    /**
     * @event WebMapViewModel#mapinitialized
     * @description Map 初始化成功。
     * @property {L.Map} map - Leaflet Map 对象。
     */
    this.triggerEvent('mapinitialized', { map: this.map });
  }

  _initBaseLayer(mapInfo: any, sendToMap = true): void {
    let layerInfo = mapInfo.baseLayer || mapInfo;

    let layerType = this.getBaseLayerType(layerInfo);
    let mapUrls = this.getMapurls({
      CLOUD: 'http://t2.dituhui.com/FileService/image',
      CLOUD_BLACK: 'http://t3.dituhui.com/MapService/getGdp',
      OSM: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    });

    let url: string;
    let layer;
    switch (layerType) {
      case 'TIANDITU':
        layer = this._createTiandituLayer(layerInfo);
        break;
      case 'BING':
        layer = this._createBingLayer();
        break;
      case 'WMS':
        layer = this._createWMSLayer(layerInfo);
        break;
      case 'WMTS':
        layer = this._createWMTSLayer(layerInfo);
        break;
      case 'TILE':
        layer = this._createDynamicTiledLayer(layerInfo);
        break;
      case 'CLOUD':
        url = mapUrls[layerInfo.layerType];
        layer = this._createCLOUDLayer(layerType, url);
        break;
      case 'XYZ':
        url = mapUrls[layerInfo.layerType];
        layer = this._createXYZLayer(url);
        break;
      case 'BAIDU':
        layer = this._createBaiduTileLayer();
        break;
      case 'MAPBOXSTYLE':
        this.triggerEvent('notsupportmvt', {});
        break;
      default:
        break;
    }
    layer && this._addLayerToMap({ layer, type: 'baseLayers', layerInfo, sendToMap });
  }

  _initOverlayLayers(layers: any, _taskID): void {
    // 存储地图上所有的图层对象
    this._layers = layers;
    this.layerAdded = 0;
    this.expectLayerLen = layers.length;
    if (this.expectLayerLen > 0) {
      layers.forEach((layer, index) => {
        let type = this.webMapService.getDatasourceType(layer);
        // TODO  ---  暂不支持 SAMPLE_DATA
        if (type === 'SAMPLE_DATA') {
          this._addLayerSucceeded();
          this.triggerEvent('getlayerdatasourcefailed', {
            error: 'SAMPLE DATA is not supported',
            layer,
            map: this.map
          });
          return;
        }
        layer.layerID = layer.name + '-' + index;
        layer.index = index;
        if (type === 'tile') {
          this._initBaseLayer(layer);
        } else {
          this.getLayerFeatures(layer, _taskID, type);
        }
      }, this);
    }
  }

  _createMvtLayer(info, layer, featureType) {
    // TODO MVT
    this._addLayerSucceeded();
    return;
  }

  _createRestMapLayer(restMaps, layer) {
    restMaps.forEach((restMapInfo, index) => {
      layer = this.getRestMapLayerInfo(restMapInfo, layer);
      this._initBaseLayer(layer, index === restMaps.length - 1);
    });
  }

  async _initOverlayLayer(layerInfo: any, features?: any): Promise<void> {
    try {
      let { layerType, style, filterCondition, featureType, labelStyle, projection } = layerInfo;
      if (layerType === 'restMap') {
        this._createRestMapLayer(features, layerInfo);
        return;
      }
      if (layerType === 'mvt') {
        this._createMvtLayer(features.info, layerInfo, features.featureType);
        return;
      }

      if (features && projection && projection !== 'EPSG:4326') {
        let epsgCode = projection.split(':')[1];
        if (!epsgCode) {
          return;
        }
        this._unprojectCrs = this.getTransformCoodinatesCRS(projection.split(":")[1]);
        features = this.transformFeatures(features);
      }

      features = this.handleLayerFeatures(features, layerInfo);

      let layer;
      switch (layerType) {
        case 'VECTOR':
          if (featureType === 'POINT') {
            if (style.type === 'SYMBOL_POINT') {
              layer = await this._createSymbolLayer(layerInfo, features);
            } else {
              layer = await this._createGraphicLayer(layerInfo, features);
            }
          } else {
            // 线和面
            layer = await this._createVectorLayer(layerInfo, features);
          }
          break;
        case 'UNIQUE':
          layer = await this._createUniqueLayer(layerInfo, features);
          break;
        case 'RANGE':
          layer = await this._createRangeLayer(layerInfo, features);
          break;
        case 'HEAT':
          layer = await this._createHeatLayer(layerInfo, features);
          break;
        case 'MARKER':
          layer = await this._createMarkerLayer(features);
          break;
        case 'RANK_SYMBOL':
          layer = await this._createRankSymbolLayer(layerInfo, features);
          break;
        case 'MIGRATION':
          layer = await this._createMigrationLayer(layerInfo, features);
          break;
        case 'DATAFLOW_POINT_TRACK':
        case 'DATAFLOW_HEAT':
          layer = await this._createDataflowLayer(layerInfo);
          break;
      }

      if (labelStyle && labelStyle.labelField && layerType !== 'DATAFLOW_POINT_TRACK') {
        // 存在标签专题图
        features = this.getFilterFeatures(filterCondition, features);
        let labelLayerInfo = JSON.parse(JSON.stringify(layerInfo));
        let labelLayer = this._addLabelLayer(labelLayerInfo, features);
        this._addLayerToMap({ layer: L.layerGroup([layer, labelLayer]), layerInfo });
      } else {
        layer && this._addLayerToMap({ layer, layerInfo });
      }
    } catch (err) {
      console.error(err);
      this._addLayerSucceeded();
      this.triggerEvent('getlayerdatasourcefailed', {
        error: err,
        layer: layerInfo,
        map: this.map
      });
    }
  }

  private _createBingLayer() {
    let url =
      'https://dynamic.t0.tiles.ditu.live.com/comp/ch/{quadKey}?it=G,TW,L,LA&mkt=zh-cn&og=109&cstl=w4c&ur=CN&n=z';
    // @ts-ignore
    L.TileLayer.BingLayer = L.TileLayer.extend({
      getTileUrl: function (coordinates) {
        let { z, x, y } = coordinates;
        let index = '';
        for (let i = z; i > 0; i--) {
          let b = 0;
          let mask = 1 << (i - 1);
          if ((x & mask) !== 0) {
            b++;
          }
          if ((y & mask) !== 0) {
            b += 2;
          }
          index += b.toString();
        }
        return url.replace('{quadKey}', index);
      }
    });
    // @ts-ignore
    L.tileLayer.bingLayer = (url, options) => {
      // @ts-ignore
      return new L.TileLayer.BingLayer(url, options);
    };
    // @ts-ignore
    return L.tileLayer.bingLayer(url, {
      noWrap: true
    });
  }

  private _createDynamicTiledLayer(layerInfo: any): void {
    let url = layerInfo.url;
    // @ts-ignore
    let layer = L.supermap.tiledMapLayer(url, {
      noWrap: true,
      prjCoordSys: { epsgCode: this.baseProjection.split(':')[1] }
    });
    return layer;
  }

  private _createWMSLayer(layerInfo: any) {
    let { url, layers } = layerInfo;
    if (!layers || layers === 'undefined' || layers === 'null') {
      layers = '0';
    } else if (layers.length > 0) {
      layers = layers[0];
    }
    return L.tileLayer.wms(url, {
      layers,
      format: 'image/png',
      transparent: true,
      noWrap: true
    });
  }

  private _createWMTSLayer(layerInfo: any) {
    let { url, tileMatrixSet, name } = layerInfo;
    // @ts-ignore
    return L.supermap.wmtsLayer(url, {
      layer: name,
      style: 'default',
      tilematrixSet: tileMatrixSet,
      format: 'image/png',
      noWrap: true
    });
  }

  private _createTiandituLayer(layerInfo) {
    this.map.getZoom() < 1 && this.map.setZoom(1);
    this.map.setMinZoom(1);
    let layerType = layerInfo.layerType.split('_')[1].toLowerCase();
    let isLabel = Boolean(layerInfo.labelLayerVisible);
    // @ts-ignore
    let tiandituLayer = L.supermap.tiandituTileLayer({
      layerType,
      key: this.tiandituKey
    });
    // @ts-ignore
    let tiandituLabelLayer = L.supermap.tiandituTileLayer({
      layerType,
      isLabel: true,
      key: this.tiandituKey
    });
    let layers = [tiandituLayer];
    isLabel && layers.push(tiandituLabelLayer);
    return L.layerGroup(layers);
  }

  private _createCLOUDLayer(layerType, url) {
    if (layerType === 'CLOUD') {
      this.map.getZoom() < 3 && this.map.setZoom(3);
      this.map.setMinZoom(3);
    }
    // @ts-ignore
    return L.supermap.cloudTileLayer(url, { noWrap: true });
  }

  private _createXYZLayer(url) {
    return L.tileLayer(url, { noWrap: true });
  }

  private _createBaiduTileLayer() {
    this.map.getZoom() < 3 && this.map.setZoom(3);
    this.map.setMinZoom(3);
    // @ts-ignore
    return L.supermap.baiduTileLayer('', { noWrap: true });
  }

  private _createUniqueLayer(layerInfo: any, features: any) {
    return this._createThemeLayer('unique', layerInfo, features);
  }

  private _createRangeLayer(layerInfo: any, features: any) {
    return this._createThemeLayer('range', layerInfo, features);
  }

  private _createMarkerLayer(features: any): Promise<object> {
    return new Promise((resolve, reject) => {
      const layerGroupPromises =
        features &&
        features.map(feature => {
          return new Promise((resolve, reject) => {
            let geomType = feature.geometry.type.toUpperCase();
            let defaultStyle = feature.dv_v5_markerStyle;
            if (geomType === 'POINT' && defaultStyle.text) {
              // 说明是文字的feature类型
              geomType = 'TEXT';
            }
            let featureInfo = this.setFeatureInfo(feature);
            feature.properties['useStyle'] = defaultStyle;
            feature.properties['featureInfo'] = featureInfo;
            if (
              geomType === 'POINT' &&
              defaultStyle.src &&
              defaultStyle.src.indexOf('http://') === -1 &&
              defaultStyle.src.indexOf('https://') === -1
            ) {
              // 说明地址不完整
              defaultStyle.src = this.serverUrl + defaultStyle.src;
            }
            const imgWidth = (defaultStyle.imgWidth || 48) * defaultStyle.scale;
            const imgHeight = (defaultStyle.imgHeight || 43) * defaultStyle.scale;
            // image-marker
            if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') <= -1) {
              resolve(
                L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                  icon: L.icon({
                    iconUrl: defaultStyle.src,
                    iconSize: [imgWidth, imgHeight],
                    iconAnchor: [imgWidth * defaultStyle.anchor[0], imgHeight * defaultStyle.anchor[1]]
                  })
                })
              );
            }

            // svg-marker
            if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') > -1) {
              if (!this._svgDiv) {
                this._svgDiv = document.createElement('div');
                document.body.appendChild(this._svgDiv);
              }
              this.getCanvasFromSVG(defaultStyle.src, this._svgDiv, canvas => {
                resolve(this._getSvgLayer(canvas, defaultStyle, [feature]));
              });
            }
            // point-line-polygon-marker
            if (!defaultStyle.src) {
              if ((geomType === 'LINESTRING' && defaultStyle.lineCap) || geomType === 'POLYGON') {
                resolve(this._createGeojsonLayer([feature], this._getVectorLayerStyle(defaultStyle)));
              } else if (geomType === 'TEXT') {
                // @ts-ignore
                var text = new L.supermap.labelThemeLayer(defaultStyle.text + '-text');

                text.style = {
                  fontSize: defaultStyle.font.split(' ')[0],
                  labelRect: true,
                  fontColor: defaultStyle.fillColor,
                  fill: true,
                  fillColor: defaultStyle.backgroundFill, // TODO labelStyle 未返回标签背景颜色 待确定；
                  stroke: false
                };
                text.themeField = 'text';
                feature.properties.text = defaultStyle.text;
                // @ts-ignore
                let geoTextFeature = new L.supermap.themeFeature(
                  [feature.geometry.coordinates[1], feature.geometry.coordinates[0], defaultStyle.text],
                  feature.properties
                );
                text.addFeatures([geoTextFeature]);
                resolve(text);
              } else {
                resolve(
                  L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                    ...this._getVectorLayerStyle(defaultStyle)
                  })
                );
              }
            }
          });
        });
      layerGroupPromises &&
        Promise.all(layerGroupPromises)
          .then(layerGroup => {
            layerGroup && resolve(L.layerGroup(layerGroup as L.Layer[]));
          })
          .catch(error => {
            console.error(error);
          });
    });
  }

  private _createRankSymbolLayer(layerInfo, features) {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let styleSource: any = this.createRankStyleSource(layerInfo, features);
    let styleGroups = styleSource.styleGroups;
    features = this.getFilterFeatures(layerInfo.filterCondition, features);
    let radiusList = [];
    features.forEach(row => {
      let target = parseFloat(row.properties[fieldName]);
      if (styleGroups) {
        for (let i = 0; i < styleGroups.length; i++) {
          if (styleGroups[i].start <= target && target < styleGroups[i].end) {
            let radius =
              style.type === 'SYMBOL_POINT' || style.type === 'IMAGE_POINT'
                ? style.type === 'SYMBOL_POINT'
                  ? styleGroups[i].radius * 2
                  : styleGroups[i].radius
                : styleGroups[i].radius;
            radiusList.push(radius);
          }
        }
      }
    }, this);
    if (style.type === 'SYMBOL_POINT') {
      return this._createSymbolLayer(layerInfo, features, radiusList);
    } else if (style.type === 'IMAGE_POINT' || style.type === 'SVG_POINT') {
      return this._createGraphicLayer(layerInfo, features, radiusList);
    } else {
      const layerGroup = [];
      features.forEach((feature, index) => {
        const newStyle = Object.assign({}, style, { radius: radiusList[index] });
        layerGroup.push(
          L.circleMarker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            this._getVectorLayerStyle(newStyle)
          )
        );
      });
      return L.layerGroup(layerGroup);
    }
  }

  private _addLabelLayer(layerInfo: any, features: any) {
    let { labelStyle, layerID, featureType } = layerInfo;
    // @ts-ignore
    var label = new L.supermap.labelThemeLayer(layerID + '-label');
    labelStyle.fontSize = 14;
    labelStyle.labelRect = true;
    labelStyle.fontColor = labelStyle.fill;
    labelStyle.fill = true;
    labelStyle.fillColor = '#FFFFFF'; // TODO labelStyle 未返回标签背景颜色 待确定；
    labelStyle.stroke = false;
    labelStyle.strokeColor = '#8B7B8B';
    label.style = labelStyle;
    label.themeField = labelStyle.labelField;

    let labelFeatures = this._convertLabelFeatures(label, features, layerInfo, featureType);
    label.addFeatures(labelFeatures);

    return label;
  }

  private _createHeatLayer(layerInfo: any, features: any): void {
    let { themeSetting, layerID } = layerInfo;

    let { colors, radius, customSettings, weight } = themeSetting;

    let heatColors = colors.slice();

    // 自定义颜色
    for (let i in customSettings) {
      heatColors[i] = customSettings[i];
    }

    // @ts-ignore
    let heatMapLayer = L.supermap.heatMapLayer(layerID, {
      colors: heatColors,
      map: this.map,
      radius: radius * 2,
      featureWeight: weight,
      blur: radius * 1.5
    });

    // let gradient = {};
    // for (let i = 0, len = heatColors.length, index = 1; i < len; i++) {
    //   gradient[index / len] = heatColors[i];
    //   index++;
    // }

    // features.forEach((feature, index) => {
    //   features[index] = { lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] };
    // });

    // @ts-ignore
    // let heatMapLayer = L.heatLayer(features, {
    //   radius: radius*1.3,
    //   minOpacity: 1,
    //   gradient: gradient,
    //   // blur: radius*2,
    //   featureWeight: weight
    // })

    heatMapLayer.addFeatures({
      type: 'FeatureCollection',
      features: features
    });

    return heatMapLayer;
  }

  private _createSymbolLayer(layerInfo: any, features: any, textSize?) {
    let { style } = layerInfo;

    let { unicode } = style;

    let pointToLayer;

    if (unicode) {
      pointToLayer = this._getSymbolPointLayer(style, textSize);
    }

    return pointToLayer && this._createGeojsonLayer(features, null, pointToLayer);
  }

  private _createGraphicLayer(layerInfo: any, features: any, textSize?): Promise<object> {
    return new Promise((resolve, reject) => {
      let { style } = layerInfo;
      let { type, imageInfo, radius, url } = style;
      let pointToLayer;
      if (type === 'IMAGE_POINT' && imageInfo.url) {
        let resolution = imageInfo.size.w / imageInfo.size.h;
        pointToLayer = (geojson, latlng) => {
          let iconSize = textSize && textSize[geojson.id - 1 || geojson.properties.index] * 2;
          return L.marker(latlng, {
            icon: L.icon({
              iconUrl: imageInfo.url,
              iconSize: textSize ? [iconSize, iconSize / resolution] : [radius * 2, (radius * 2) / resolution]
            })
          });
        };
      } else if (type === 'SVG_POINT') {
        if (!this._svgDiv) {
          this._svgDiv = document.createElement('div');
          document.body.appendChild(this._svgDiv);
        }
        this.getCanvasFromSVG(url, this._svgDiv, canvas => {
          resolve(this._getSvgLayer(canvas, style, features, textSize));
        });
      } else {
        pointToLayer = (geojson, latlng) => {
          return L.circleMarker(latlng, this._getVectorLayerStyle(style));
        };
      }
      pointToLayer && resolve(this._createGeojsonLayer(features, null, pointToLayer));
    });
  }

  private _createVectorLayer(layerInfo: any, features: any): void {
    let { style } = layerInfo;
    return this._createGeojsonLayer(features, this._getVectorLayerStyle(style));
  }

  private _createMigrationLayer(layerInfo, features) {
    // window['echarts'] = echarts;
    let options = this.getEchartsLayerOptions(layerInfo, features, 'leaflet');
    // @ts-ignore
    let layer = L.supermap.echartsLayer(options);
    this.echartslayer.push(layer);
    return layer;
  }

  private _createDataflowLayer(layerInfo) {
    this._dataflowFeatureCache = {};
    return new Promise((resolve, reject) => {
      this._getDataflowPointLayer(layerInfo).then(pointToLayer => {
        // @ts-ignore
        let dataFlowLayer = L.supermap.dataFlowLayer(layerInfo.wsUrl, {
          pointToLayer
        });
        this._updateDataFlowFeaturesCallback = this._updateDataFlowFeature.bind(this, layerInfo);
        dataFlowLayer.on('dataupdated', this._updateDataFlowFeaturesCallback);
        this._dataFlowLayer = dataFlowLayer;
        resolve(dataFlowLayer);
      });
    });
  }

  private _createGeojsonLayer(features, style?, pointToLayer?) {
    return L.geoJSON(
      {
        type: 'FeatureCollection',
        // @ts-ignore
        features: features
      },
      { pointToLayer, style }
    );
  }

  private _getVectorLayerStyle(style) {
    let { fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWidth, radius, lineDash } = style;
    let commonStyle = {
      color: strokeColor,
      weight: strokeWidth,
      opacity: strokeOpacity,
      fillColor,
      fillOpacity
    };
    let dashArray;
    if (lineDash) {
      dashArray = this.getDashStyle(lineDash, strokeWidth, 'string');
    }
    radius && (commonStyle['radius'] = radius);
    lineDash && (commonStyle['dashArray'] = dashArray);
    return commonStyle;
  }

  private _getMapCenter(mapInfo) {
    let center: [number, number] | L.LatLng;
    center = mapInfo.center && [mapInfo.center.x, mapInfo.center.y];

    if (!center) {
      center = [0, 0];
    }

    center =
      this.baseProjection === 'EPSG:3857'
        ? this.crs.unproject(L.point(center[0], center[1]))
        : L.latLng(center[1], center[0]);
    return center;
  }

  private _sendMapToUser(count: number, layersLen: number): void {
    if (count === layersLen) {
      /**
       * @event WebMapViewModel#addlayerssucceeded
       * @description 添加图层成功。
       * @property {L.Map} map - Leaflet Map 对象。
       * @property {Object} mapparams - 地图信息。
       * @property {string} mapParams.title - 地图标题。
       * @property {string} mapParams.description - 地图描述。
       * @property {Array.<Object>} layers - 地图上所有的图层对象。
       */
      this.triggerEvent('addlayerssucceeded', {
        map: this.map,
        mapparams: this.mapParams,
        layers: this._layers
      });
    }
  }

  private _addLayerToMap({ layer, type = 'overlays', layerInfo, sendToMap = true }) {
    let { visible, layerID, name, index } = layerInfo;

    sendToMap && (type = 'overlays');
    type === 'overlays' && layer.setZIndex && layer.setZIndex(index + 1);

    if (visible === undefined || visible) {
      // @ts-ignore
      this.map.addLayer(layer, layerInfo.name);
    }
    !this.layers[type] && (this.layers[type] = {});
    this.layers[type][layerID || name] = layer;
    this._addLayerSucceeded(sendToMap);
  }

  private _convertLabelFeatures(layer, features, layerInfo, featureType) {
    if (!features) {
      return [];
    }
    let { themeField, style } = layer;
    let labelFeatures = [];
    let layerStyle = layerInfo.style || {};
    features.forEach(feature => {
      let coordinate = this._getLabelLngLat(featureType, feature);
      this._setLabelOffset(featureType, layerStyle, style);
      let properties = feature.properties;
      // @ts-ignore
      let geoTextFeature = new L.supermap.themeFeature(
        [coordinate[1], coordinate[0], properties[themeField]],
        properties
      );
      labelFeatures.push(geoTextFeature);
    });
    return labelFeatures;
  }

  private _getLabelLngLat(featureType, feature) {
    let coordinate;
    let coordinates = feature.geometry.coordinates;
    if (featureType === 'POINT') {
      coordinate = coordinates;
    } else if (featureType === 'LINE') {
      let length = coordinates.length;
      coordinate = coordinates[Math.round(length / 2)];
    } else {
      coordinate = getCenter(feature).geometry.coordinates;
    }
    return coordinate;
  }

  private _setLabelOffset(featureType, layerStyle, style) {
    if (featureType === 'POINT') {
      var pointRadius = layerStyle.pointRadius || 0;
      var strokeWidth = layerStyle.strokeWidth || 0;
      var fontSize = parseInt(layerStyle.fontSize) || 0;
      style.labelXOffset = 0;
      style.labelYOffset = layerStyle.unicode ? 20 + fontSize : 25 + (pointRadius + strokeWidth);
    } else {
      return;
    }
  }

  _addLayerSucceeded(sendMap = true) {
    if (sendMap) {
      this.layerAdded++;
      this._sendMapToUser(this.layerAdded, this.expectLayerLen);
    }
  }

  _unproject(coordinate): [number, number] {
    let crs = this._unprojectCrs || L.CRS.EPSG3857;
    return this._latlngToCoordinate(crs.unproject(L.point(coordinate[0], coordinate[1])));
  }

  _latlngToCoordinate(latlng): [number, number] {
    if (!latlng) {
      return null;
    }
    return [latlng.lng, latlng.lat];
  }

  _getSvgLayer(canvas, style, features, textSize?) {
    let svgPointToLayer = this._getSvgPointLayer(canvas, style, textSize);
    return this._createGeojsonLayer(features, null, svgPointToLayer);
  }

  _createThemeLayer(type, layerInfo, features) {
    let { filterCondition, style, themeSetting, featureType, layerID } = layerInfo;
    let layerStyle = JSON.parse(JSON.stringify(style));
    featureType === 'POINT' && (layerStyle.pointRadius = style.radius);
    delete layerStyle.radius;

    if (featureType === 'LINE') {
      layerStyle.fill = false;
      layerStyle.strokeDashstyle = style.lineDash; // TODO lineDash 样式错误
      delete layerStyle.lineDash;
    }

    let styleGroup;
    if (type === 'unique') {
      styleGroup = this.getUniqueStyleGroup(layerInfo, features);
    } else if (type === 'range') {
      styleGroup = this.getRangeStyleGroup(layerInfo, features);
    }

    filterCondition && (features = this.getFilterFeatures(filterCondition, features));

    let themeField = themeSetting.themeField;
    Object.keys(features[0].properties).forEach(key => {
      key.toLocaleUpperCase() === themeField.toLocaleUpperCase() && (themeField = key);
    });
    // @ts-ignore
    let layer = L.supermap[`${type}ThemeLayer`](layerID);

    layerStyle.stroke = true;
    layer.style = layerStyle;
    layer.themeField = themeField;
    layer.styleGroups = styleGroup;
    layer.addFeatures({
      type: 'FeatureCollection',
      features: features
    });

    return layer;
  }

  _handleMapCrs(mapInfo) {
    let { projection, baseLayer, extent } = mapInfo;

    this.baseProjection = projection;

    // crs 坐标系处理待优化
    if (projection === 'EPSG:910111' || projection === 'EPSG:910112') {
      // 早期数据存在的自定义坐标系  "EPSG:910111": "GCJ02MERCATOR"， "EPSG:910112": "BDMERCATOR"
      this.baseProjection = 'EPSG:3857';
    } else if (projection === 'EPSG:910101' || projection === 'EPSG:910102') {
      // 早期数据存在的自定义坐标系 "EPSG:910101": "GCJ02", "EPSG:910102": "BD",
      this.baseProjection = 'EPSG:4326';
    }

    if (baseLayer.layerType === 'BAIDU') {
      // @ts-ignore
      this.crs = L.CRS.Baidu;
      return this.crs;
    }

    if (baseLayer.layerType.indexOf('TIANDITU') > -1) {
      // @ts-ignore
      this.crs = this.baseProjection === 'EPSG:3857' ? L.CRS.TianDiTu_Mercator : L.CRS.TianDiTu_WGS84;
      return this.crs;
    }

    let epsgCode = this.baseProjection.split(':')[1];
    let bounds = L.bounds([extent.leftBottom.x, extent.leftBottom.y], [extent.rightTop.x, extent.rightTop.y]);

    if (['4326', '3857', '3395'].includes(epsgCode)) {
      // @ts-ignore
      this.crs = L.Proj.CRS(`EPSG:${epsgCode}`, { bounds });
    } else if (parseFloat(epsgCode) < 0) {
      // @ts-ignore
      this.crs = new L.CRS.NonEarthCRS({ bounds });
    } else if (!epsgCode) {
      this.baseProjection = toEpsgCode(this.baseProjection);
      if (this.baseProjection) {
        // @ts-ignore
        this.crs = L.Proj.CRS(this.baseProjection, {
          bounds,
          def: mapInfo.projection
        });
      }
    }
    return this.crs;
  }

  _updateDataFlowFeature(layerInfo, e) {
    if (layerInfo.visible) {
      let feature = e.data;
      let { lineStyle, labelStyle } = layerInfo;
      lineStyle && this._updateDataflowPathLayer(feature, layerInfo);
      labelStyle && labelStyle.labelField !== '未设置' && this._updateDataflowLabelLayer(feature, layerInfo);
    }
  }

  _getSymbolPointLayer(style, textSize?) {
    let symbolStyle = JSON.parse(JSON.stringify(style));
    symbolStyle.fontColor = style.fillColor;
    symbolStyle.label = style.unicode;
    symbolStyle.fontFamily = 'supermapol-icons';
    let pointToLayer = (geojson, latlng) => {
      textSize && (symbolStyle.fontSize = textSize[geojson.id - 1 || geojson.properties.index] + 'px');
      // @ts-ignore
      return new L.supermap.unicodeMarker(latlng, symbolStyle);
    };
    return pointToLayer;
  }

  _getSvgPointLayer(canvas, style, textSize?) {
    let { radius } = style;

    this.handleSvgColor(style, canvas);

    let imgUrl = canvas.toDataURL('img/png');
    let resolution = canvas.width / canvas.height;
    let svgPointToLayer = (geojson, latlng) => {
      let iconSize = textSize && textSize[geojson.id - 1 || geojson.properties.index];
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: imgUrl,
          iconSize: textSize ? [iconSize, iconSize / resolution] : [radius, radius / resolution]
        })
      });
    };
    return svgPointToLayer;
  }

  _getDataflowPointLayer(layerInfo) {
    let { layerType, pointStyle, layerID, themeSetting } = layerInfo;
    return new Promise((resolve, reject) => {
      if (layerType === 'DATAFLOW_HEAT') {
        let { colors, radius, customSettings, weight } = themeSetting;
        let heatLayerInfo = { layerID, themeSetting: { colors, radius, customSettings, weight } };
        let pointToLayer = (geojson, latlng) => {
          return this._createHeatLayer(heatLayerInfo, [geojson]);
        };
        resolve(pointToLayer);
      } else if ('SYMBOL_POINT' === pointStyle.type) {
        resolve(this._getSymbolPointLayer(pointStyle, null));
      } else if ('SVG_POINT' === pointStyle.type) {
        if (!this._svgDiv) {
          this._svgDiv = document.createElement('div');
          document.body.appendChild(this._svgDiv);
        }
        this.getCanvasFromSVG(pointStyle.url, this._svgDiv, canvas => {
          resolve(this._getSvgPointLayer(canvas, pointStyle, null));
        });
      } else {
        let pointToLayer = (geojson, latlng) => {
          return L.circleMarker(latlng, this._getVectorLayerStyle(pointStyle));
        };
        resolve(pointToLayer);
      }
    });
  }

  _handleDataflowFeature(feature, layerInfo) {
    let { identifyField, maxPointCount, lineStyle } = layerInfo;
    let geoID = feature.properties[identifyField];
    if (lineStyle) {
      if (this._dataflowLineFeatureCache[geoID]) {
        let coordinates = this._dataflowLineFeatureCache[geoID].geometry.coordinates;
        coordinates.push(feature.geometry.coordinates);
        if (maxPointCount && coordinates.length > maxPointCount) {
          coordinates.splice(0, coordinates.length - maxPointCount);
        }
        this._dataflowLineFeatureCache[geoID].geometry.coordinates = coordinates;
      } else {
        this._dataflowLineFeatureCache[geoID] = {
          type: 'Feature',
          properties: feature.properties,
          geometry: {
            type: 'LineString',
            coordinates: [feature.geometry.coordinates]
          }
        };
      }
    }
    this._dataflowFeatureCache[geoID] = feature;
  }

  _updateDataflowLabelLayer(feature, layerInfo) {
    this._handleDataflowFeature(feature, layerInfo);
    let geoID = feature.properties[layerInfo.identifyField];
    let layer;
    if (this._dataflowLabelIdCache[geoID]) {
      layer = this._dataFlowLayer.getLayer(this._dataflowLabelIdCache[geoID]);
      let feature = this._dataflowFeatureCache[geoID];
      // @ts-ignore
      let geoTextFeature = new L.supermap.themeFeature(
        [feature.geometry.coordinates[1], feature.geometry.coordinates[0], geoID],
        feature.properties
      );
      layer.removeAllFeatures();
      layer.addFeatures([geoTextFeature]);
    } else {
      let feature = this._dataflowFeatureCache[geoID];
      layer = this._addLabelLayer(layerInfo, [feature]);
      this._dataFlowLayer.addLayer(layer);
      this._dataflowLabelIdCache[geoID] = this._dataFlowLayer.getLayerId(layer);
    }
  }

  _updateDataflowPathLayer(feature, layerInfo) {
    this._handleDataflowFeature(feature, layerInfo);
    let geoID = feature.properties[layerInfo.identifyField];
    let layer;
    let coordinates = this._dataflowLineFeatureCache[geoID].geometry.coordinates;
    let latlngs = L.GeoJSON.coordsToLatLngs(coordinates, 0);
    if (this._dataflowPathIdCache[geoID]) {
      layer = this._dataFlowLayer.getLayer(this._dataflowPathIdCache[geoID]);
      layer.setLatLngs(latlngs);
    } else {
      layer = L.polyline(latlngs, { ...this._getVectorLayerStyle(layerInfo.lineStyle) });
      // layer = L.GeoJSON.geometryToLayer(this._dataflowLineFeatureCache[geoID], { style: () => { return this._getVectorLayerStyle(layerInfo.lineStyle) } });  // style 不生效
      this._dataFlowLayer.addLayer(layer);
      this._dataflowPathIdCache[geoID] = this._dataFlowLayer.getLayerId(layer);
    }
  }

  protected getTransformCoodinatesCRS(epsgCode) {
    const defName = `EPSG:${epsgCode}`;
    const defValue = getProjection(defName);
    // @ts-ignore
    return L.Proj.CRS(toEpsgCode(defValue), {
      def: defValue,
    });
  }

  public cleanWebMap() {
    if (this.map) {
      this.map.remove();
      this.center = null;
      this.zoom = null;
      this._dataFlowLayer.off('dataupdated', this._updateDataFlowFeaturesCallback);
      this._unprojectCrs = null;
    }
  }
}

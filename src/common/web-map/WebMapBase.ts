import { Events } from '../_types/event/Events';
import municipalCenterData from './config/MunicipalCenter.json';
import provincialCenterData from './config/ProvinceCenter.json';
import '../../../static/libs/geostats/geostats';
import '../../../static/libs/json-sql/jsonsql';
import isNumber from 'lodash.isnumber';
import canvg from 'canvg';

import WebMapService from '../_utils/WebMapService';
import { getColorWithOpacity } from '../_utils/util';
import { getProjection, registerProjection } from '../../common/_utils/epsg-define';

// 迁徙图最大支持要素数量
const MAX_MIGRATION_ANIMATION_COUNT = 1000;
export default abstract class WebMapBase extends Events {
  map: any;

  mapId: string | number | object;

  webMapInfo: any;

  mapOptions: any;

  serverUrl: string;

  accessToken: string;

  accessKey: string;

  tiandituKey: string;

  withCredentials: boolean;

  proxy: String | Boolean;

  target: string;

  excludePortalProxyUrl: boolean;

  isSuperMapOnline: boolean;

  zoom: number;

  mapParams: { title?: string; description?: string };

  baseProjection: string;

  ignoreBaseProjection: boolean;

  on: any;

  echartslayer: any = [];

  protected webMapService: WebMapService;

  protected _layers: any = [];

  protected _svgDiv: HTMLElement;

  protected _taskID: Date;

  protected layerAdded: number;

  protected expectLayerLen: number;

  constructor(id, options?, mapOptions?) {
    super();
    this.serverUrl = options.serverUrl || 'https://www.supermapol.com';
    this.accessToken = options.accessToken;
    this.accessKey = options.accessKey;
    this.tiandituKey = options.tiandituKey || '';
    this.withCredentials = options.withCredentials || false;
    this.proxy = options.proxy;
    this.target = options.target || 'map';
    this.excludePortalProxyUrl = options.excludePortalProxyUrl;
    this.isSuperMapOnline = options.isSuperMapOnline;
    this.ignoreBaseProjection = options.ignoreBaseProjection;
    this.echartslayer = [];
    this.webMapService = new WebMapService(id, options);
    this.mapOptions = mapOptions;
    this.eventTypes = [
      'getmapinfofailed',
      'crsnotsupport',
      'getlayerdatasourcefailed',
      'addlayerssucceeded',
      'notsupportmvt',
      'notsupportbaidumap',
      'projectionIsNotMatch',
      'beforeremovemap'
    ];
    this.mapId = id;
  }

  abstract _initWebMap(): void;
  abstract _getMapInfo(data, _taskID);
  abstract _createMap();
  // TODO 重构子类 webmap layer 添加逻辑，只重写具体添加某个layer的方法，基类实现 initxxxx
  abstract _initBaseLayer(mapInfo);
  abstract _initOverlayLayer(layer, features?);

  abstract _addLayerSucceeded();
  abstract _unproject(point: [number, number]): [number, number];
  abstract cleanWebMap();

  public echartsLayerResize(): void {
    this.echartslayer.forEach(echartslayer => {
      echartslayer.chart.resize();
    });
  }

  public setMapId(mapId: string | number): void {
    this.mapId = mapId;
    this.webMapService.setMapId(mapId);
    setTimeout(() => {
      this._initWebMap();
    }, 0);
  }

  public setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
    this.webMapService.setServerUrl(serverUrl);
  }

  public setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
    this.webMapService.setWithCredentials(withCredentials);
  }

  public setProxy(proxy) {
    this.proxy = proxy;
    this.webMapService.setProxy(proxy);
  }

  public setZoom(zoom) {
    if (this.map) {
      this.mapOptions.zoom = zoom;
      if (zoom !== +this.map.getZoom().toFixed(2)) {
        (zoom || zoom === 0) && this.map.setZoom(zoom, { from: 'setZoom' });
      }
    }
  }

  public setMaxBounds(maxBounds): void {
    if (this.map) {
      this.mapOptions.maxBounds = maxBounds;
      maxBounds && this.map.setMaxBounds(maxBounds);
    }
  }

  public setMinZoom(minZoom): void {
    if (this.map) {
      this.mapOptions.minZoom = minZoom;
      (minZoom || minZoom === 0) && this.map.setMinZoom(minZoom);
    }
  }

  public setMaxZoom(maxZoom): void {
    if (this.map) {
      this.mapOptions.maxZoom = maxZoom;
      (maxZoom || maxZoom === 0) && this.map.setMinZoom(maxZoom);
    }
  }

  protected initWebMap() {
    this.cleanWebMap();
    if (this.webMapInfo) {
      // 传入是webmap对象
      let mapInfo = this.webMapInfo;
      mapInfo.mapParams = {
        title: this.webMapInfo.title,
        description: this.webMapInfo.description
      };
      this.mapParams = mapInfo.mapParams;
      this._getMapInfo(mapInfo, null);
      return;
    } else if (!this.mapId || !this.serverUrl) {
      this._createMap();
      return;
    }
    this._taskID = new Date();
    this.getMapInfo(this._taskID);
  }

  protected getMapInfo(_taskID) {
    this.serverUrl = this.webMapService.handleServerUrl(this.serverUrl);
    this.webMapService
      .getMapInfo()
      .then(
        (mapInfo: any) => {
          if (this._taskID !== _taskID) {
            return;
          }
          // 存储地图的名称以及描述等信息，返回给用户
          this.mapParams = mapInfo.mapParams;
          this._getMapInfo(mapInfo, _taskID);
        },
        error => {
          throw error;
        }
      )
      .catch(error => {
        this.triggerEvent('getmapinfofailed', { error });
        console.log(error);
      });
  }

  protected getBaseLayerType(layerInfo) {
    let layerType = layerInfo.layerType; // 底图和rest地图兼容

    if (
      layerType.indexOf('TIANDITU_VEC') > -1 ||
      layerType.indexOf('TIANDITU_IMG') > -1 ||
      layerType.indexOf('TIANDITU_TER') > -1
    ) {
      layerType = 'TIANDITU';
    }

    switch (layerType) {
      case 'TILE':
      case 'SUPERMAP_REST':
        return 'TILE';
      case 'CLOUD':
      case 'CLOUD_BLACK':
        return 'CLOUD';
      case 'OSM':
      case 'JAPAN_ORT':
      case 'JAPAN_RELIEF':
      case 'JAPAN_PALE':
      case 'JAPAN_STD':
      case 'GOOGLE_CN':
      case 'GOOGLE':
        return 'XYZ';
      default:
        return layerType;
    }
  }

  protected getMapurls(mapurl: { CLOUD?: string; CLOUD_BLACK?: string; OSM?: string } = {}) {
    let mapUrls = {
      CLOUD: mapurl.CLOUD || 'http://t2.dituhui.com/FileService/image?map=quanguo&type=web&x={x}&y={y}&z={z}',
      CLOUD_BLACK: mapurl.CLOUD_BLACK || 'http://t3.dituhui.com/MapService/getGdp?x={x}&y={y}&z={z}',
      OSM: mapurl.OSM || 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      GOOGLE:
        'https://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0',
      GOOGLE_CN: 'https://mt{0-3}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
      JAPAN_STD: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
      JAPAN_PALE: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      JAPAN_RELIEF: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
      JAPAN_ORT: 'https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'
    };

    return mapUrls;
  }

  protected getLayerFeatures(layer, _taskID, type) {
    let getLayerFunc = this.webMapService.getLayerFeatures(type, layer, this.baseProjection);

    getLayerFunc &&
      getLayerFunc
        .then(
          async result => {
            if (this.mapId && this._taskID !== _taskID) {
              return;
            }
            if (result && layer.projection) {
              if (!getProjection(layer.projection)) {
                const epsgWKT = await this.webMapService.getEpsgCodeInfo(
                  layer.projection.split(':')[1],
                  this.serverUrl
                );
                if (epsgWKT) {
                  registerProjection(layer.projection, epsgWKT);
                }
              }
            }

            this._getLayerFeaturesSucceeded(result, layer);
          },
          error => {
            throw new Error(error);
          }
        )
        .catch(error => {
          this._addLayerSucceeded();
          this.triggerEvent('getlayerdatasourcefailed', { error, layer, map: this.map });
          console.log(error);
        });
  }

  protected setFeatureInfo(feature: any): any {
    let featureInfo;
    let info = feature.dv_v5_markerInfo;
    if (info && info.dataViz_title) {
      // 有featureInfo信息就不需要再添加
      featureInfo = info;
    } else {
      // featureInfo = this.getDefaultAttribute();
      return info;
    }
    let properties = feature.properties;
    for (let key in featureInfo) {
      if (properties[key]) {
        featureInfo[key] = properties[key];
        delete properties[key];
      }
    }
    return featureInfo;
  }

  protected getRankStyleGroup(themeField, features, parameters) {
    // 找出所有的单值
    let values = [],
      segements = [],
      style = parameters.style,
      themeSetting = parameters.themeSetting,
      segmentMethod = themeSetting.segmentMethod,
      segmentCount = themeSetting.segmentCount,
      customSettings = themeSetting.customSettings,
      minR = parameters.themeSetting.minRadius,
      maxR = parameters.themeSetting.maxRadius,
      colors = themeSetting.colors,
      fillColor = style.fillColor;
    features.forEach(feature => {
      let properties = feature.properties,
        value = properties[themeField];
      // 过滤掉空值和非数值
      if (value == null || !isNumber(+value)) {
        return;
      }
      values.push(Number(value));
    });
    try {
      segements = SuperMap.ArrayStatistic.getArraySegments(values, segmentMethod, segmentCount);
    } catch (error) {
      console.log(error);
    }

    // 处理自定义 分段
    for (let i = 0; i < segmentCount; i++) {
      if (i in customSettings) {
        let startValue = customSettings[i]['segment']['start'],
          endValue = customSettings[i]['segment']['end'];
        startValue != null && (segements[i] = startValue);
        endValue != null && (segements[i + 1] = endValue);
      }
    }

    //生成styleGroup
    let styleGroup = [];
    if (segements && segements.length) {
      let len = segements.length,
        incrementR = (maxR - minR) / (len - 1), // 半径增量
        start,
        end,
        radius = Number(((maxR + minR) / 2).toFixed(2)),
        color = '';
      let rangeColors = colors ? SuperMap.ColorsPickerUtil.getGradientColors(colors, len, 'RANGE') : [];
      for (let i = 0; i < len - 1; i++) {
        // 处理radius
        start = Number(segements[i].toFixed(2));
        end = Number(segements[i + 1].toFixed(2));
        // 这里特殊处理以下分段值相同的情况（即所有字段值相同）
        radius = start === end ? radius : minR + Math.round(incrementR * i);
        // 最后一个分段时将end+0.01，避免取不到最大值
        end = i === len - 2 ? end + 0.01 : end;
        // 处理自定义 半径
        radius = customSettings[i] && customSettings[i].radius ? customSettings[i].radius : radius;
        style.radius = radius;
        // 处理颜色
        if (colors && colors.length > 0) {
          color = customSettings[i] && customSettings[i].color ? customSettings[i].color : rangeColors[i] || fillColor;
          style.fillColor = color;
        }
        styleGroup.push({ radius, color, start, end, style });
      }
      return styleGroup;
    } else {
      return false;
    }
  }

  protected createRankStyleSource(parameters, features) {
    let themeSetting = parameters.themeSetting,
      themeField = themeSetting.themeField;
    let styleGroups = this.getRankStyleGroup(themeField, features, parameters);
    // @ts-ignore
    return styleGroups ? { parameters, styleGroups } : false;
  }

  protected isMatchAdministrativeName(featureName, fieldName) {
    let isString = typeof fieldName === 'string' && fieldName.constructor === String;
    if (isString) {
      let shortName = featureName.substr(0, 2);
      // 张家口市和张家界市 特殊处理
      if (shortName === '张家') {
        shortName = featureName.substr(0, 3);
      }
      return !!fieldName.match(new RegExp(shortName));
    }
    return false;
  }

  protected getRestMapLayerInfo(restMapInfo, layer) {
    let { bounds, coordUnit, visibleScales, url } = restMapInfo;
    layer.layerType = 'TILE';
    layer.orginEpsgCode = this.baseProjection;
    layer.units = coordUnit && coordUnit.toLowerCase();
    layer.extent = [bounds.left, bounds.bottom, bounds.right, bounds.top];
    layer.visibleScales = visibleScales;
    layer.url = url;
    layer.sourceType = 'TILE';
    return layer;
  }
  protected handleLayerFeatures(features, layerInfo) {
    let { layerType, style, themeSetting, filterCondition } = layerInfo;
    if ((style || themeSetting) && filterCondition) {
      // 将 feature 根据过滤条件进行过滤, 分段专题图和单值专题图因为要计算 styleGroup 所以暂时不过滤
      if (layerType !== 'RANGE' && layerType !== 'UNIQUE' && layerType !== 'RANK_SYMBOL') {
        features = this.getFilterFeatures(filterCondition, features);
      }
    }

    return features;
  }

  protected mergeFeatures(layerId: string, features: any, mergeByField?: string): any {
    features = features.map((feature: any, index: any) => {
      if (!feature.properties.hasOwnProperty('index')) {
        feature.properties.index = index;
      }
      return feature;
    });
    if (!mergeByField) {
      return features;
    }
    const source = this.map.getSource(layerId);
    if (!source || !source._data.features) {
      return features;
    }
    const prevFeatures = source._data.features;
    const nextFeatures = [];
    features.forEach((feature: any) => {
      const prevFeature = prevFeatures.find((item: any) => {
        if (isNaN(+item.properties[mergeByField]) && isNaN(+feature.properties[mergeByField])) {
          return (
            JSON.stringify(item.properties[mergeByField] || '') ===
            JSON.stringify(feature.properties[mergeByField] || '')
          );
        } else {
          return +item.properties[mergeByField] === +feature.properties[mergeByField];
        }
      });
      if (prevFeature) {
        nextFeatures.push({
          ...prevFeature,
          ...feature
        });
      } else if (feature.geometry) {
        nextFeatures.push(feature);
      }
    });
    return nextFeatures;
  }

  protected getFilterFeatures(filterCondition: string, allFeatures): any {
    if (!filterCondition) {
      return allFeatures;
    }
    let condition = this.replaceFilterCharacter(filterCondition);
    let sql = 'select * from json where (' + condition + ')';
    let filterFeatures = [];
    for (let i = 0; i < allFeatures.length; i++) {
      let feature = allFeatures[i];
      let filterResult: any;
      try {
        filterResult = window['jsonsql'].query(sql, {
          properties: feature.properties
        });
      } catch (err) {
        // 必须把要过滤得内容封装成一个对象,主要是处理jsonsql(line : 62)中由于with语句遍历对象造成的问题
        continue;
      }
      if (filterResult && filterResult.length > 0) {
        // afterFilterFeatureIdx.push(i);
        filterFeatures.push(feature);
      }
    }
    return filterFeatures;
  }

  protected replaceFilterCharacter(filterString: string): string {
    filterString = filterString
      .replace(/=/g, '==')
      .replace(/AND|and/g, '&&')
      .replace(/or|OR/g, '||')
      .replace(/<==/g, '<=')
      .replace(/>==/g, '>=');
    return filterString;
  }

  protected getEchartsLayerOptions(layerInfo, features, coordinateSystem) {
    let properties = this.webMapService.getFeatureProperties(features);
    let lineData = this._createLinesData(layerInfo, properties);
    let pointData = this._createPointsData(lineData, layerInfo, properties);
    let options = this._createOptions(layerInfo, lineData, pointData, coordinateSystem);
    return options;
  }

  protected getDashStyle(str, strokeWidth = 1, type = 'array') {
    if (!str) {
      return type === 'array' ? [] : '';
    }

    let w = strokeWidth;
    let dashArr;
    switch (str) {
      case 'solid':
        dashArr = [];
        break;
      case 'dot':
        dashArr = [1, 4 * w];
        break;
      case 'dash':
        dashArr = [4 * w, 4 * w];
        break;
      case 'dashrailway':
        dashArr = [8 * w, 12 * w];
        break;
      case 'dashdot':
        dashArr = [4 * w, 4 * w, 1 * w, 4 * w];
        break;
      case 'longdash':
        dashArr = [8 * w, 4 * w];
        break;
      case 'longdashdot':
        dashArr = [8 * w, 4 * w, 1, 4 * w];
        break;
      default:
        if (SuperMap.Util.isArray(str)) {
          dashArr = str;
        }
        str = SuperMap.String.trim(str).replace(/\s+/g, ',');
        dashArr = str.replace(/\[|\]/gi, '').split(',');
        break;
    }
    dashArr = type === 'array' ? dashArr : dashArr.join(',');
    return dashArr;
  }

  protected getCanvasFromSVG(svgUrl: string, divDom: HTMLElement, callBack: Function): void {
    let canvas = document.createElement('canvas');
    canvas.id = `dataviz-canvas-${new Date().getTime()}`;
    canvas.style.display = 'none';
    divDom.appendChild(canvas);
    let canvgs = window.canvg ? window.canvg : canvg;
    canvgs(canvas.id, svgUrl, {
      ignoreMouse: true,
      ignoreAnimation: true,
      renderCallback: () => {
        if (canvas.width > 300 || canvas.height > 300) {
          return;
        }
        callBack(canvas);
      },
      forceRedraw: () => {
        return false;
      }
    });
  }

  protected getRangeStyleGroup(layerInfo: any, features: any): Array<any> | void {
    let { featureType, style, themeSetting } = layerInfo;
    let { customSettings, themeField, segmentCount, segmentMethod, colors } = themeSetting;

    // 找出分段值
    let values = [];
    let attributes;

    features.forEach(feature => {
      attributes = feature.properties;
      if (attributes) {
        // 过滤掉非数值的数据
        let val = attributes[themeField];
        (val || val === 0) && isNumber(+val) && values.push(parseFloat(val));
      }
    }, this);

    let segements = SuperMap.ArrayStatistic.getArraySegments(values, segmentMethod, segmentCount);
    if (segements) {
      let itemNum = segmentCount;
      if (attributes && segements[0] === segements[attributes.length - 1]) {
        itemNum = 1;
        segements.length = 2;
      }

      // 保留两位有效数
      for (let i = 0; i < segements.length; i++) {
        let value = segements[i];
        value = i === 0 ? Math.floor(value * 100) / 100 : Math.ceil(value * 100) / 100 + 0.1; // 加0.1 解决最大值没有样式问题
        segements[i] = Number(value.toFixed(2));
      }

      // 获取一定量的颜色
      let curentColors = colors;
      curentColors = SuperMap.ColorsPickerUtil.getGradientColors(curentColors, itemNum, 'RANGE');
      for (let index = 0; index < itemNum; index++) {
        if (index in customSettings) {
          if (customSettings[index]['segment']['start']) {
            segements[index] = customSettings[index]['segment']['start'];
          }
          if (customSettings[index]['segment']['end']) {
            segements[index + 1] = customSettings[index]['segment']['end'];
          }
        }
      }
      // 生成styleGroup
      let styleGroups = [];
      for (let i = 0; i < itemNum; i++) {
        let color = curentColors[i];
        if (i in customSettings) {
          if (customSettings[i].color) {
            color = customSettings[i].color;
          }
        }
        if (featureType === 'LINE') {
          style.strokeColor = color;
        } else {
          style.fillColor = color;
        }

        let start = segements[i];
        let end = segements[i + 1];
        let styleObj = JSON.parse(JSON.stringify(style));
        styleGroups.push({
          style: styleObj,
          color: color,
          start: start,
          end: end
        });
      }
      return styleGroups;
    }
  }

  protected getUniqueStyleGroup(parameters: any, features: any) {
    let { featureType, style, themeSetting } = parameters;
    let { themeField, colors, customSettings } = themeSetting;

    // 找出所有的单值
    Object.keys(features[0].properties).forEach(key => {
      key.toLocaleUpperCase() === themeField.toLocaleUpperCase() && (themeField = key);
    });
    let names = [];
    for (let i in features) {
      let properties = features[i].properties;
      let name = properties[themeField];
      let isSaved = false;
      for (let j in names) {
        if (names[j] === name) {
          isSaved = true;
          break;
        }
      }
      if (!isSaved) {
        names.push(name || '0');
      }
    }

    // 获取一定量的颜色
    let curentColors = colors;
    curentColors = SuperMap.ColorsPickerUtil.getGradientColors(curentColors, names.length);

    let styleGroup = [];
    names.forEach((name, index) => {
      let color = curentColors[index];
      let itemStyle = { ...style };
      if (name in customSettings) {
        const customStyle = customSettings[name];
        if (typeof customStyle === 'object') {
          itemStyle = Object.assign(itemStyle, customStyle);
        } else {
          if (typeof customStyle === 'string') {
            color = customSettings[name];
          }
          if (featureType === 'LINE') {
            itemStyle.strokeColor = color;
          } else {
            itemStyle.fillColor = color;
          }
        }
      }

      styleGroup.push({
        color: color,
        style: itemStyle,
        value: name,
        themeField: themeField
      });
    }, this);

    return styleGroup;
  }

  protected transformFeatures(features) {
    features &&
      features.forEach((feature, index) => {
        let geometryType = feature.geometry && feature.geometry.type;
        let coordinates = feature.geometry && feature.geometry.coordinates;
        if (!coordinates || coordinates.length === 0) {
          return;
        }
        if (geometryType === 'LineString') {
          coordinates.forEach((coordinate, index) => {
            coordinate = this._unproject(coordinate);
            coordinates[index] = coordinate;
          }, this);
        } else if (geometryType === 'Point') {
          coordinates = this._unproject(coordinates);
          feature.geometry.coordinates = coordinates;
        } else if (geometryType === 'MultiPolygon' || geometryType === 'Polygon') {
          coordinates.forEach((coordinate, index) => {
            let coords = geometryType === 'MultiPolygon' ? coordinate[0] : coordinate;
            coords.forEach((latlng, i) => {
              latlng = this._unproject(latlng);
              coords[i] = latlng;
            });
            coordinates[index] = coordinate;
          });
        }
        features[index] = feature;
      });

    return features;
  }

  protected handleSvgColor(style, canvas) {
    let { fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWidth } = style;
    let context = canvas.getContext('2d');
    if (fillColor) {
      context.fillStyle = getColorWithOpacity(fillColor, fillOpacity);
      context.fill();
    }

    if (strokeColor || strokeWidth) {
      context.strokeStyle = getColorWithOpacity(strokeColor, strokeOpacity);
      context.lineWidth = strokeWidth;
      context.stroke();
    }
  }

  private _createLinesData(layerInfo, properties) {
    let data = [];
    if (properties && properties.length) {
      // 重新获取数据
      let from = layerInfo.from,
        to = layerInfo.to,
        fromCoord,
        toCoord;
      if (from.type === 'XY_FIELD' && from['xField'] && from['yField'] && to['xField'] && to['yField']) {
        properties.forEach(property => {
          let fromX = property[from['xField']],
            fromY = property[from['yField']],
            toX = property[to['xField']],
            toY = property[to['yField']];
          if (!fromX || !fromY || !toX || !toY) {
            return;
          }

          fromCoord = [property[from['xField']], property[from['yField']]];
          toCoord = [property[to['xField']], property[to['yField']]];
          data.push({
            coords: [fromCoord, toCoord]
          });
        });
      } else if (from.type === 'PLACE_FIELD' && from['field'] && to['field']) {
        const centerDatas = provincialCenterData.concat(municipalCenterData);

        properties.forEach(property => {
          let fromField = property[from['field']],
            toField = property[to['field']];
          fromCoord = centerDatas.find(item => {
            return this.isMatchAdministrativeName(item.name, fromField);
          });
          toCoord = centerDatas.find(item => {
            return this.isMatchAdministrativeName(item.name, toField);
          });
          if (!fromCoord || !toCoord) {
            return;
          }
          data.push({
            coords: [fromCoord.coord, toCoord.coord]
          });
        });
      }
    }
    return data;
  }

  private _createPointsData(lineData, layerInfo, properties) {
    let data = [],
      labelSetting = layerInfo.labelSetting;
    // 标签隐藏则直接返回
    if (!labelSetting.show || !lineData.length) {
      return data;
    }
    let fromData = [],
      toData = [];
    lineData.forEach((item, idx) => {
      let coords = item.coords,
        fromCoord = coords[0],
        toCoord = coords[1],
        fromProperty = properties[idx][labelSetting.from],
        toProperty = properties[idx][labelSetting.to];
      // 起始字段去重
      let f = fromData.find(d => {
        return d.value[0] === fromCoord[0] && d.value[1] === fromCoord[1];
      });
      !f &&
        fromData.push({
          name: fromProperty,
          value: fromCoord
        });
      // 终点字段去重
      let t = toData.find(d => {
        return d.value[0] === toCoord[0] && d.value[1] === toCoord[1];
      });
      !t &&
        toData.push({
          name: toProperty,
          value: toCoord
        });
    });
    data = fromData.concat(toData);
    return data;
  }

  private _createOptions(layerInfo, lineData, pointData, coordinateSystem) {
    let series;
    let lineSeries = this._createLineSeries(layerInfo, lineData, coordinateSystem);
    if (pointData && pointData.length) {
      let pointSeries: any = this._createPointSeries(layerInfo, pointData, coordinateSystem);
      series = lineSeries.concat(pointSeries);
    } else {
      series = lineSeries.slice();
    }
    return { series };
  }
  private _createPointSeries(layerInfo, pointData, coordinateSystem) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let labelSetting = layerInfo.labelSetting;
    let pointSeries = [
      {
        name: 'point-series',
        coordinateSystem: coordinateSystem,
        zlevel: 2,
        label: {
          normal: {
            show: labelSetting.show,
            position: 'right',
            formatter: '{b}',
            color: labelSetting.color,
            fontFamily: labelSetting.fontFamily
          }
        },
        itemStyle: {
          normal: {
            color: lineSetting.color || labelSetting.color
          }
        },
        data: pointData
      }
    ];

    if (animationSetting.show) {
      // 开启动画
      // @ts-ignore
      pointSeries[0].type = 'effectScatter';
      // @ts-ignore
      pointSeries[0].rippleEffect = {
        brushType: 'stroke'
      };
    } else {
      // 关闭动画
      // @ts-ignore
      pointSeries[0].type = 'scatter';
    }

    return pointSeries;
  }

  private _createLineSeries(layerInfo, lineData, coordinateSystem) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let linesSeries = [
      // 轨迹线样式
      {
        name: 'line-series',
        coordinateSystem: coordinateSystem,
        type: 'lines',
        zlevel: 1,
        effect: {
          show: animationSetting.show,
          constantSpeed: animationSetting.constantSpeed,
          trailLength: 0,
          symbol: animationSetting.symbol,
          symbolSize: animationSetting.symbolSize
        },
        lineStyle: {
          normal: {
            color: lineSetting.color,
            type: lineSetting.type,
            width: lineSetting.width,
            opacity: lineSetting.opacity,
            curveness: lineSetting.curveness
          }
        },
        data: lineData
      }
    ];

    if (lineData.length >= MAX_MIGRATION_ANIMATION_COUNT) {
      // @ts-ignore
      linesSeries[0].large = true;
      // @ts-ignore
      linesSeries[0].largeThreshold = 100;
      // @ts-ignore
      linesSeries[0].blendMode = 'lighter';
    }

    return linesSeries;
  }

  private _getLayerFeaturesSucceeded(result, layer) {
    switch (result.type) {
      case 'feature':
        this._initOverlayLayer(layer, result.features);
        break;
      case 'restMap':
        layer.layerType = 'restMap';
        this._initOverlayLayer(layer, result.restMaps);
        break;
      case 'mvt':
        layer.layerType = 'mvt';
        this._initOverlayLayer(layer, result);
        break;
      case 'dataflow':
      case 'noServerId':
        this._initOverlayLayer(layer);
        break;
    }
  }
}

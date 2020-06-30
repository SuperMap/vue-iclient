import turfLength from '@turf/length';
import turfArea from '@turf/area';
import { convertArea } from '@turf/helpers';
import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import drawEvent from '../../../_types/draw-event';
import { geti18n } from '../../../../common/_lang';

/**
 * @class DrawViewModel
 * @description 绘制 viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */

export default class DrawViewModel extends mapboxgl.Evented {
  constructor(componentName) {
    super();
    this.componentName = componentName;
    this.featureIds = []; // 收集当前draw所画的点线面的id
    this.activeFeature = {};
    this.dashedLayerIds = []; // 收集虚线图层的id 信息
    this.layerStyleList = {}; // 收集虚线图层的修改的样式信息
  }

  setMap(mapInfo) {
    const { map, mapTarget } = mapInfo;
    this.map = map;
    this.mapTarget = mapTarget;
    this._addDrawControl();
  }

  _addDrawControl() {
    this.draw = drawEvent.$options.getDraw(this.mapTarget);
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, false);
    this.map.on('draw.create', this._drawCreate.bind(this));
    this.map.on('draw.selectionchange', this._selectionChange.bind(this));
    this.map.on('mouseover', 'draw-line-static.cold', e => {
      const feature = e.features[0];
      const id = feature.properties.id;
      if (this.featureIds.includes(id)) {
        this.map.setFilter('draw-line-hover.cold', ['all', ['==', '$type', 'LineString'], ['==', 'id', id]]);
        this.map.setFilter('draw-line-hover.hot', ['all', ['==', '$type', 'LineString'], ['==', 'id', id]]);
      }
    });
    this.map.on('mouseout', 'draw-line-hover.cold', () => {
      this.map.setFilter('draw-line-hover.cold', ['all', ['==', '$type', 'LineString'], ['==', 'id', '']]);
      this.map.setFilter('draw-line-hover.hot', ['all', ['==', '$type', 'LineString'], ['==', 'id', '']]);
    });
  }

  _drawCreate(e) {
    if (this._isDrawing()) {
      const { features } = e;
      const feature = features[0] || {};
      this.featureIds.push(feature.id);
    }
  }

  _selectionChange(e) {
    if (this._isDrawing()) {
      const { features } = e;
      const feature = features[0];
      if (feature) {
        this._getDefaultStyle();
        this.activeFeature = feature;
        this._calcResult(feature);
      }
    }
  }

  _calcResult(feature) {
    // 计算长度和面积的结果
    const { geometry = {} } = feature;
    const coordinates = geometry.coordinates;
    let result = '';
    let unit;
    let coordinateOfMaxLatitude = [];
    if (geometry.type === 'Point') {
      result = turfLength(feature, 'kilometers');
      coordinateOfMaxLatitude = coordinates;
    } else if (geometry.type === 'LineString') {
      result = turfLength(feature, 'kilometers');
      unit = geti18n().t('unit.kilometers');
      coordinateOfMaxLatitude = this._calcMaxLatitudeInCoordinate(coordinates);
    } else if (geometry.type === 'Polygon') {
      let area = turfArea(feature);
      result = convertArea(area, 'meters', 'kilometers');
      unit = geti18n().t('unit.squarekilometers');
      coordinateOfMaxLatitude = this._calcMaxLatitudeInCoordinate(coordinates[0]);
    }
    const layerStyle = this._getFetureStyle(feature.id);
    /**
     * @event DrawViewModel#drawcreated
     * @description 绘制完成。
     */
    this.fire('draw-create', {
      popupInfo: {
        resultInfo: { feature, layerStyle, result, unit },
        trash: this.trash.bind(this),
        map: this.map,
        coordinate: coordinateOfMaxLatitude
      }
    });
  }

  _calcMaxLatitudeInCoordinate(data = []) {
    let indexOfMax = 0;
    let compareNum = data[indexOfMax] && data[indexOfMax][1];
    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i][1] > compareNum) {
        compareNum = data[i][1];
        indexOfMax = i;
      }
    }
    return data[indexOfMax];
  }

  _getFetureStyle(id) {
    let layerStyle;
    for (let key in this.layerStyleList) {
      if (this.layerStyleList[key] && this.layerStyleList[key][id]) {
        layerStyle = Object.assign(this.layerStyleList[key][id], layerStyle);
      }
    }
    return layerStyle;
  }

  // 开启绘制
  openDraw(mode) {
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, true);
    // 绘画线或面
    this.draw.changeMode(mode);
  }

  trash(id) {
    if (id) {
      // 给外部调用的API 如天地图传入一个id 删除指定点线面
      this.draw.delete(id);
      for (let key in this.layerStyleList) {
        if (this.layerStyleList[key] && this.layerStyleList[key][id]) {
          delete this.layerStyleList[key][id];
          break;
        }
      }
      const matchIndex = this.dashedLayerIds.findIndex(item => item === id);
      matchIndex > -1 && this.dashedLayerIds.splice(matchIndex, 1);
      return;
    }
    const selectedIds = this.draw.getSelectedIds();
    selectedIds.forEach(item => {
      const matchIndex = this.featureIds.findIndex(id => id === item);
      if (matchIndex > -1) {
        this.featureIds.splice(matchIndex, 1);
        this.draw.delete(item);
      }
    });
  }

  setLayerStyle(layerStyle) {
    const { id } = this.activeFeature;
    if (!id) return;
    for (let key in layerStyle) {
      const paint = layerStyle[key];
      this.layerStyleList[key] = this.layerStyleList[key] || {};
      this.layerStyleList[key][id] = Object.assign(this.layerStyleList[id] || {}, layerStyle[key]);
      const isDashedLayer = Object.keys(paint).includes('line-dasharray');

      const matchIndex = this.dashedLayerIds.findIndex(item => item === id);
      if (isDashedLayer) {
        matchIndex < 0 && this.dashedLayerIds.push(id);
      } else {
        key === 'LineString' && matchIndex > -1 && this.dashedLayerIds.splice(matchIndex, 1);
      }
      this.setFilter();
      this.setPaintProperty(key, paint, isDashedLayer);
    }
  }

  setDashFilterData(init) {
    const newFilter = this.dashedLayerIds.reduce(function(filter, layerId) {
      filter.push(layerId);
      return filter;
    }, init);
    return newFilter;
  }

  setFilter() {
    if (!this.linesStaticFilter) {
      // 获取初始的Filter
      this.linesStaticFilter = this.map.getFilter('draw-line-static.cold');
    }
    const notDashedFilter = this.setDashFilterData(['!in', 'id']);
    const dashedFilter = this.setDashFilterData(['in', 'id']);
    this.map.setFilter('draw-line-dashed.cold', dashedFilter);
    this.map.setFilter('draw-line-dashed.hot', dashedFilter);
    this.map.setFilter('draw-line-static.cold', ['all', this.linesStaticFilter, notDashedFilter]);
    this.map.setFilter('draw-line-static.hot', ['all', this.linesStaticFilter, notDashedFilter]);
  }

  setPaintProperty(key, paint, isDashedLayer) {
    for (let name in paint) {
      const value = this.setValueOfPaintKey(key, name);
      switch (key) {
        case 'LineString':
          if (name === 'line-color') {
            const vertexValue = value.slice();
            vertexValue[1] = ['get', 'parent'];
            this.map.setPaintProperty('draw-vertex-active.hot', 'circle-color', vertexValue);
            this.map.setPaintProperty('draw-vertex-active.cold', 'circle-color', vertexValue);
            this.map.setPaintProperty('draw-line-hover.cold', name, value);
            this.map.setPaintProperty('draw-line-hover.hot', name, value);
          }
          if (isDashedLayer) {
            this.map.setPaintProperty('draw-line-dashed.cold', name, value);
            this.map.setPaintProperty('draw-line-dashed.hot', name, value);
            continue;
          }
          this.map.setPaintProperty('draw-line-static.cold', name, value);
          this.map.setPaintProperty('draw-line-static.hot', name, value);
          break;
        case 'Polygon':
          this.map.setPaintProperty('draw-polygon-static.cold', name, value);
          this.map.setPaintProperty('draw-polygon-static.hot', name, value);
          break;
        case 'Point':
          this.map.setPaintProperty('draw-point-static.cold', name, value);
          this.map.setPaintProperty('draw-point-static.hot', name, value);
          break;
        default:
          break;
      }
    }
  }

  setValueOfPaintKey(key, name) {
    let data = [];
    const featureStyle = this.layerStyleList[key];
    for (let id in featureStyle) {
      const info = featureStyle[id];
      data.push(id);
      data.push(info[name]);
    }
    switch (name) {
      // 这里的默认值应该和初始化的地方保持一致
      case 'circle-color':
      case 'line-color':
      case 'fill-color':
      case 'fill-outline-color':
        return ['match', ['get', 'id'], ...data, this.defaultStyle['line-color']];
      case 'line-dasharray':
        return featureStyle[this.activeFeature.id][name] || this.defaultStyle[name];
      default:
        return ['match', ['get', 'id'], ...data, this.defaultStyle[name]];
    }
  }

  _getDefaultStyle() {
    if (!this.defaultStyle) {
      let defaultStyle = {};
      defaultStyle['line-color'] = this.map.getPaintProperty('draw-line-static.cold', 'line-color');
      defaultStyle['line-width'] = this.map.getPaintProperty('draw-line-static.cold', 'line-width');
      defaultStyle['line-dasharray'] = this.map.getPaintProperty('draw-line-static.cold', 'line-dasharray');
      defaultStyle['fill-opacity'] = this.map.getPaintProperty('draw-polygon-static.cold', 'fill-opacity');
      defaultStyle['circle-radius'] = this.map.getPaintProperty('draw-point-static.cold', 'circle-radius');
      this.defaultStyle = defaultStyle;
    }
  }

  removed() {
    this.clearAllFeatures();
    this.draw = null;
  }

  clearAllFeatures() {
    this.featureIds && this.draw.delete(this.featureIds);
    this.featureIds = [];
    this.activeFeature = {};
    this.dashedLayerIds = [];
    this.layerStyleList = {};
  }

  _isDrawing() {
    return this.draw && drawEvent.$options.getDrawingState(this.mapTarget, this.componentName);
  }
}

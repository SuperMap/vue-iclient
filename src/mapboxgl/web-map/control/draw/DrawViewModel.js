import turfLength from '@turf/length';
import turfArea from '@turf/area';
import { convertArea } from '@turf/helpers';
import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import drawEvent from '../../../_types/draw-event';

/**
 * @class DrawViewModel
 * @description 量算 viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */

export default class DrawViewModel extends mapboxgl.Evented {
  constructor(map, mapTarget) {
    super();
    this.map = map;
    this.mapTarget = mapTarget;
    this.componentName = 'SmDraw';
    this.featureIds = []; // 收集当前draw所画的点线面的id
    this._addDrawControl();
  }

  _addDrawControl() {
    this.draw = drawEvent.$options.getDraw(this.mapTarget);
    this.map.on('draw.create', this._drawCreate.bind(this));
  }

  _drawCreate(e) {
    if (this._isDrawing()) {
      const { features } = e;
      const feature = features[0] || {};
      const selectedId = feature.id;
      this.featureIds.push(selectedId);
      // 计算长度和面积的结果
      const { geometry = {} } = feature;
      const coordinates = geometry.coordinates;
      let result = '';
      let coordinateOfMaxLatitude = [];
      if (geometry.type === 'Point') {
        result = turfLength(feature, 'kilometers');
        coordinateOfMaxLatitude = coordinates;
      } else if (geometry.type === 'LineString') {
        result = turfLength(feature, 'kilometers');
        coordinateOfMaxLatitude = this._calcMaxLatitudeInCoordinate(coordinates);
      } else if (geometry.type === 'Polygon') {
        let area = turfArea(feature);
        result = convertArea(area, 'meters', 'kilometers');
        coordinateOfMaxLatitude = this._calcMaxLatitudeInCoordinate(coordinates[0]);
      }
      result = result && result + ' 千米';
      /**
       * @event DrawViewModel#drawcreated
       * @description 绘制完成。
       */
      this.fire('draw-create', {
        popupInfo: {
          resultInfo: { type: geometry.type, result },
          trash: this.trash.bind(this),
          map: this.map,
          drawId: selectedId,
          coordinate: coordinateOfMaxLatitude
        }
      });
    }
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

  // 开启绘制
  openDraw(mode) {
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, true);
    // 绘画线或面
    this.draw.changeMode(mode);
  }

  trash(id) {
    if (id) {
      this.draw.delete(id);
      return;
    }
    const selectedIds = this.draw.getSelectedIds();
    selectedIds.forEach(item => {
      const matchIndex = this.featureIds.findIndex(id => id === item);
      if (matchIndex > -1) {
        this.featureIds.splice(matchIndex, 1);
      }
    });
    this.draw.trash();
  }

  clear() {
    if (this.draw && drawEvent.$options.getDraw(this.mapTarget)) {
      this.draw.delete(this.featureIds);
      drawEvent.$options.deleteDrawingState(this.mapTarget, this.componentName);
    }
  }

  _isDrawing() {
    return drawEvent.$options.getDrawingState(this.mapTarget, this.componentName);
  }
}

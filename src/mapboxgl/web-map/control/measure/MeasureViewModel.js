import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import length from '@turf/length';
import area from '@turf/area';
import center from '@turf/center';
import { convertLength, convertArea } from '@turf/helpers';
import { reservedDecimal } from '../../../../common/_utils/util';
import { geti18n } from '../../../../common/_lang';
import drawEvent from '../../../_types/draw-event';

/**
 * @class MeasureViewModel
 * @description 量算 viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */
class MeasureViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.lenTipNodesList = {}; // 收集测量长度实时生成的popup，以方便后面销毁
    this.areaTipNodesList = {}; // 收集多绘制情况下 测量面积最后生成的结果popup
    this.cacheLengthUnitList = {}; // 缓存量算长度每个节点的值跟单位，在修改单位时使用
    this.cachePolygonUnit = {};
    this.componentName = options.componentName;
    this.continueDraw = options.continueDraw;
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
    this._finishDrawBind = this._finishDraw.bind(this);
    this._changeModeBind = this._changeMode.bind(this);
    this.map.on('draw.create', this._finishDrawBind);
    this.map.on('draw.modechange', this._changeModeBind);
  }

  // 绘画结束后计算最后的结果
  _finishDraw(e) {
    if (this._isDrawing()) {
      this._resetEvent();
      switch (this.activeMode) {
        case 'draw_line_string':
          let tempLength = length(e.features[0], 'kilometers');
          this.result = convertLength(tempLength, 'kilometers', this.activeUnit);
          // 将tipNodesList中key为“id”的字段替换成生成的id值
          this._updateLenPopupNodes(e.features[0].id);
          // 如果是测量长度，销毁实时计算生成的popup
          this._removeHoverPopup();
          break;
        case 'draw_polygon':
          let tempArea = area(e.features[0]);
          this.result = convertArea(tempArea, 'meters', this.activeUnit);
          this._updateAreaPopupNodes(this.result, e.features[0]);
          break;
      }
      this.ids = this.ids || [];
      this.ids.push((e.features[0] || {}).id);
      this.fire('measure-finished', { result: this._getFormatResult(this.result) });
    }
  }

  _changeMode(e) {
    if (this._isDrawing() && this.continueDraw && this.isEditing) {
      this.draw.changeMode(this.mode);
      this.continueDrawBind = this._continueDraw.bind(this);
      this.map.on('mousedown', this.continueDrawBind);
      this.map.on('mousedown', this.measureNodeDistanceBind);
      this.fire('measure-finished', { result: this._getFormatResult(this.result) });
    }
  }

  // 开启绘制
  openDraw(mode, activeUnit, setPopupStyle) {
    this.setPopupStyle = setPopupStyle;
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, true);
    this._resetDraw();
    this._resetEvent();
    this.isEditing = true;
    this.mode = mode;
    this.activeMode = mode;
    this.activeUnit = activeUnit;
    // 绘画线或面
    this.draw.changeMode(mode);
    this.measureNodeDistanceBind = this._measureNodeDistance.bind(this);
    this.map.on('mousedown', this.measureNodeDistanceBind);
  }

  updateUnit(unit) {
    if (Object.values(this.lenTipNodesList).length) {
      for (let id in this.lenTipNodesList) {
        const tipNodes = this.lenTipNodesList[id];
        if (tipNodes && tipNodes.length && ((this.continueDraw && id !== 'id') || id === 'id')) {
          for (let i = 1; i < tipNodes.length; i++) {
            let transValue = convertLength(
              this.cacheLengthUnitList[id][i - 1].value,
              this.cacheLengthUnitList[id][i - 1].unit,
              unit
            );
            transValue = this._getFormatResult(transValue);
            this.cacheLengthUnitList[id][i - 1].value = transValue;
            this.cacheLengthUnitList[id][i - 1].unit = unit;
            if (this.activeMode === 'draw_line_string') {
              let uniti18n = geti18n().t(`unit.${unit}`);
              tipNodes[i] && tipNodes[i].setText(`${transValue} ${uniti18n}`);
            }
          }
        }
      }
      this.result && (this.result = convertLength(this.result, this.activeUnit, unit));
    } else if (this.cachePolygonUnit.value && this.cachePolygonUnit.unit) {
      let transValue = convertArea(this.cachePolygonUnit.value, this.cachePolygonUnit.unit, unit);
      let uniti18n = geti18n().t(`unit.square${unit}`);
      this.tipHoverDiv && this.tipHoverDiv.setText(`${transValue} ${uniti18n}`);
      this.result && (this.result = convertArea(this.result, this.activeUnit, unit));
    }

    this.result && this.fire('update-unit', { result: this._getFormatResult(this.result), mode: this.mode });
    this.activeUnit = unit;
  }

  _resetDraw(continueDraw) {
    // 连续绘制情况下 根据ids只删除上一次量算的数据
    if (this.draw && this.continueDraw) {
      this.ids && this.draw.delete(this.ids);
      this.ids = null;
      this._removePopups();
      this._removeHoverPopup();
    }
    this.isOpenMoveEvent = true;
    this.cacheLengthUnitList = {};
    this.measureNodes = []; // 收集测算长度生成每个点的feature数据, 方便后面计算总长度
    this.result = 0;
    if (!continueDraw) {
      this.activeMode = null;
      this.mode = null;
    }
    this.fire('measure-start', { result: this._getFormatResult(this.result) });
  }

  _continueDraw(e) {
    if (this._isDrawing()) {
      this._resetDraw(true);
      this.map.off('mousemove', this.popupFollowMouseBind);
      this.map.off('mousedown', this.continueDrawBind);
    }
  }

  // 绘画每个点显示tip，同时监听鼠标move事件
  _measureNodeDistance(e) {
    if (this._isDrawing()) {
      const {
        lngLat: { lng, lat }
      } = e;
      const to = [lng, lat];

      if (this.isOpenMoveEvent) {
        this.popupFollowMouseBind = this._popupFollowMouse.bind(this);
        this.map.on('mousemove', this.popupFollowMouseBind);
        this.isOpenMoveEvent = false;
      }
      this.measureNodes.push(to);
      if (this.activeMode === 'draw_line_string') {
        this._renderPopupTip(e);
      }
    }
  }

  _popupFollowMouse(e) {
    if (this._isDrawing()) {
      const {
        // point,
        // originalEvent,
        lngLat: { lng, lat }
      } = e;
      const lastPointPos = [lng, lat];
      let popup = this.tipHoverDiv;
      // 实时显示popup只需要一个，如果没有再生成新popup
      if (!popup) {
        popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
        });
      }
      popup.setLngLat(lastPointPos);
      let measureNodeList = [].concat(this.measureNodes, [lastPointPos]);
      let feature = {
        type: 'Feature',
        geometry: {
          type: `${this.activeMode === 'draw_line_string' ? 'LineString' : 'Polygon'}`,
          coordinates: this.activeMode === 'draw_line_string' ? measureNodeList : [measureNodeList]
        }
      };
      switch (this.activeMode) {
        case 'draw_line_string':
          let tempLength = length(feature, 'kilometers');
          this.result = convertLength(tempLength, 'kilometers', this.activeUnit);
          break;
        case 'draw_polygon':
          let tempArea = area(feature);
          this.result = convertArea(tempArea, 'meters', this.activeUnit);
          break;
      }
      let uniti18n;
      if (this.activeMode === 'draw_line_string') {
        uniti18n = geti18n().t(`unit.${this.activeUnit}`);
      } else if (this.activeMode === 'draw_polygon') {
        uniti18n = geti18n().t(`unit.square${this.activeUnit}`);
      }
      popup.setText(`${this._getFormatResult(this.result)} ${uniti18n}`);
      popup.addTo(this.map);
      this.setPopupStyle && setTimeout(this.setPopupStyle, 0);
      this.cachePolygonUnit['value'] = this.result;
      this.cachePolygonUnit['unit'] = this.activeUnit;
      this.tipHoverDiv = popup;
    }
  }

  _renderPopupTip(e) {
    const {
      // point,
      // originalEvent,
      lngLat: { lng, lat }
    } = e;
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
    });
    if (this.measureNodes.length > 1) {
      let line = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.measureNodes
        }
      };
      // 修改单位
      let tempLength = length(line, 'kilometers');
      let calcValue = convertLength(tempLength, 'kilometers', this.activeUnit);

      let uniti18n;
      if (this.activeMode === 'draw_line_string') {
        uniti18n = geti18n().t(`unit.${this.activeUnit}`);
      } else if (this.activeMode === 'draw_polygon') {
        uniti18n = geti18n().t(`unit.square${this.activeUnit}`);
      }
      let renderText = `${this._getFormatResult(calcValue)} ${uniti18n}`;

      this.cacheLengthUnitList.id = this.cacheLengthUnitList.id || [];
      this.cacheLengthUnitList.id.push({ value: this._getFormatResult(calcValue), unit: this.activeUnit });
      popup.setText(renderText);
    } else {
      popup.setText(geti18n().t('measure.startingPoint'));
      this.cacheLengthUnitList.id = this.cacheLengthUnitList.id || [];
    }
    popup.setLngLat([lng, lat]);
    popup && popup.addTo(this.map);
    this.setPopupStyle && setTimeout(this.setPopupStyle, 0);
    // 这里的key-id只是一个临时的值 在绘画完成后(会生成一个featureId) 这时会把id这个key转换成真实的id值
    this.lenTipNodesList.id = this.lenTipNodesList.id || [];
    this.lenTipNodesList.id.push(popup);
  }

  _getFormatResult(result) {
    return reservedDecimal(result || this.result, 4);
  }

  _isDrawing() {
    return drawEvent.$options.getDrawingState(this.mapTarget, this.componentName) && this.draw;
    // return true;
  }

  _updateLenPopupNodes(idValue) {
    this.cacheLengthUnitList[idValue] = this.cacheLengthUnitList.id || [];
    delete this.cacheLengthUnitList.id;

    this.lenTipNodesList[idValue] = this.lenTipNodesList.id || [];
    delete this.lenTipNodesList.id;
    for (let id in this.lenTipNodesList) {
      const tipNodes = this.lenTipNodesList[id];
      if (tipNodes && !tipNodes.length) {
        delete this.lenTipNodesList[id];
        delete this.cacheLengthUnitList[id];
      }
    }
  }

  _updateAreaPopupNodes(popupResult, feature) {
    // 如果是测量面积，直接利用实时计算生成的popup显示最后结果
    const centerResult = center(feature);
    let uniti18n = geti18n().t(`unit.square${this.activeUnit}`);
    const result = this._getFormatResult(popupResult);
    if (this.continueDraw) {
      this.tipHoverDiv &&
      this.tipHoverDiv.setLngLat(centerResult.geometry.coordinates).setText(`${result} ${uniti18n}`);
    } else {
      this._removeHoverPopup();
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
      });
      popup
        .setLngLat(centerResult.geometry.coordinates)
        .setText(`${result} ${uniti18n}`)
        .addTo(this.map);
      this.areaTipNodesList[feature.id] = popup;
    }
    this.setPopupStyle && setTimeout(this.setPopupStyle, 0);
  }

  _resetEvent() {
    this.map.off('mousemove', this.popupFollowMouseBind);
    this.map.off('mousedown', this.measureNodeDistanceBind);
    this.map.off('mousedown', this.continueDrawBind);
  }

  _clearEvent() {
    this._resetEvent();
    this.map.off('draw.create', this._finishDrawBind);
    this.map.off('draw.modechange', this._changeModeBind);
  }

  _removePopups() {
    for (let id in this.lenTipNodesList) {
      const tipNodes = this.lenTipNodesList[id];
      if (tipNodes && tipNodes.length) {
        tipNodes.forEach(tipNode => tipNode.remove());
      }
    }
    for (let id in this.areaTipNodesList) {
      const tipNode = this.areaTipNodesList[id];
      tipNode && tipNode.remove();
    }
    this.lenTipNodesList = {};
    this.areaTipNodesList = {};
  }

  _removeHoverPopup() {
    this.tipHoverDiv && this.tipHoverDiv.remove();
    this.tipHoverDiv = null;
  }

  trash() {
    const selectedIds = this.draw.getSelectedIds();
    selectedIds.forEach(item => {
      const matchIndex = this.ids.findIndex(id => id === item);
      if (matchIndex > -1) {
        this.ids.splice(matchIndex, 1);
        this.draw.delete(item);
        const tipNodes = this.lenTipNodesList[item] || this.areaTipNodesList[item];
        Array.isArray(tipNodes) ? tipNodes.forEach(tipNode => tipNode.remove()) : tipNodes.remove();
      }
    });
  }

  removeDraw(continueDraw) {
    this.isEditing = false;
    this.draw.changeMode('simple_select');
    this.ids && this.draw.delete(this.ids);
    this.ids = [];
    this._resetDraw(continueDraw);
    this._resetEvent();
    this._removePopups();
    this._removeHoverPopup();
  }

  removed() {
    this.isEditing = false;
    this.ids && this.draw.delete(this.ids);
    this.ids = [];
    this.cacheLengthUnitList = {};
    this.cachePolygonUnit = {};
    this._clearEvent();
    this._removePopups();
    this._removeHoverPopup();
    this.draw = null;
  }

  clearAllFeatures() {
    this.removeDraw();
  }
}
export default MeasureViewModel;

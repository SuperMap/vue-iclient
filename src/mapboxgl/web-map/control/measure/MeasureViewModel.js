import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import length from '@turf/length';
import area from '@turf/area';
import center from '@turf/center';
import { reservedDecimal } from 'vue-iclient/src/common/_utils/util';
import { geti18n } from 'vue-iclient/src/common/_lang/index';
import drawEvent from 'vue-iclient/src/mapboxgl/_types/draw-event';
import { convertMeasureArea, convertMeasureDistance, getMeasureUnitLabel } from './measure-unit';

class MeasureViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    this.lenTipNodesList = {};
    this.areaTipNodesList = {};
    this.cacheLengthUnitList = {};
    this.cachePolygonUnit = {};
    this.componentName = options.componentName;
    this.continueDraw = options.continueDraw;
    this.dashboardConfig = options.dashboardConfig || {};
  }

  setDashboardConfig(dashboardConfig = {}) {
    this.dashboardConfig = dashboardConfig;
  }

  getUnitLabel(unitType, unit) {
    return getMeasureUnitLabel(this.dashboardConfig, unitType, unit, key => geti18n().t(key), 'result');
  }

  setMap(mapInfo) {
    const { map, mapTarget } = mapInfo;
    this.map = map;
    this.mapTarget = mapTarget;
    this._addDrawControl();
  }

  _addDrawControl() {
    this.draw = drawEvent.$options.getDraw({ mapTarget: this.mapTarget });
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, false);
    this._finishDrawBind = this._finishDraw.bind(this);
    this._changeModeBind = this._changeMode.bind(this);
    this.map.on('draw.create', this._finishDrawBind);
    this.map.on('draw.modechange', this._changeModeBind);
  }

  _finishDraw(e) {
    if (this._isDrawing()) {
      this._resetEvent();
      switch (this.activeMode) {
        case 'draw_line_string':
          this.result = convertMeasureDistance(
            length(e.features[0], 'kilometers'),
            'kilometers',
            this.activeUnit,
            this.dashboardConfig
          );
          this._updateLenPopupNodes(e.features[0].id);
          this._removeHoverPopup();
          break;
        case 'draw_polygon':
          this.result = convertMeasureArea(area(e.features[0]), 'meters', this.activeUnit, this.dashboardConfig);
          this.cachePolygonUnit.value = this.result;
          this.cachePolygonUnit.unit = this.activeUnit;
          this._updateAreaPopupNodes(this.result, e.features[0]);
          break;
      }
      this.ids = this.ids || [];
      this.ids.push((e.features[0] || {}).id);
      this.fire('measure-finished', { result: this._getFormatResult(this.result), mode: this.activeMode });
    }
  }

  _changeMode() {
    if (this._isDrawing() && this.continueDraw && this.isEditing) {
      this.draw.changeMode(this.mode);
      this.continueDrawBind = this._continueDraw.bind(this);
      this.map.on('mousedown', this.continueDrawBind);
      this.map.on('mousedown', this.measureNodeDistanceBind);
      this.fire('measure-finished', { result: this._getFormatResult(this.result) });
    }
  }

  openDraw(mode, activeUnit, setPopupStyle) {
    this.setPopupStyle = setPopupStyle;
    drawEvent.$options.setDrawingState(this.mapTarget, this.componentName, true);
    this._resetDraw();
    this._resetEvent();
    this.isEditing = true;
    this.mode = mode;
    this.activeMode = mode;
    this.activeUnit = activeUnit;
    this.draw.changeMode(mode);
    this.measureNodeDistanceBind = this._measureNodeDistance.bind(this);
    this.map.on('mousedown', this.measureNodeDistanceBind);
  }

  updateUnit(unit, mode) {
    const shouldSyncActiveUnit = this.activeMode === mode || this.mode === mode;

    if (mode === 'draw_line_string') {
      if (!Object.values(this.lenTipNodesList).length) {
        shouldSyncActiveUnit && (this.activeUnit = unit);
        return;
      }
      for (const id in this.lenTipNodesList) {
        const tipNodes = this.lenTipNodesList[id];
        if (tipNodes && tipNodes.length && ((this.continueDraw && id !== 'id') || id === 'id')) {
          for (let i = 1; i < tipNodes.length; i++) {
            const cacheItem = this.cacheLengthUnitList[id][i - 1];
            let transValue = convertMeasureDistance(
              cacheItem.rawValue ?? cacheItem.value,
              cacheItem.unit,
              unit,
              this.dashboardConfig
            );
            cacheItem.rawValue = transValue;
            transValue = this._getFormatResult(transValue);
            cacheItem.value = transValue;
            cacheItem.unit = unit;
            if (this.activeMode === 'draw_line_string') {
              tipNodes[i] && tipNodes[i].setText(`${transValue} ${this.getUnitLabel('distance', unit)}`);
            }
          }
        }
      }
      this.result && (this.result = convertMeasureDistance(this.result, this.activeUnit, unit, this.dashboardConfig));
    } else if (mode === 'draw_polygon') {
      if (!this.cachePolygonUnit.value || !this.cachePolygonUnit.unit) {
        shouldSyncActiveUnit && (this.activeUnit = unit);
        return;
      }
      const transValue = convertMeasureArea(this.cachePolygonUnit.value, this.cachePolygonUnit.unit, unit, this.dashboardConfig);
      this.tipHoverDiv && this.tipHoverDiv.setText(`${this._getFormatResult(transValue)} ${this.getUnitLabel('area', unit)}`);
      this.result && (this.result = convertMeasureArea(this.result, this.activeUnit, unit, this.dashboardConfig));
    } else {
      return;
    }

    this.result && this.fire('update-unit', { result: this._getFormatResult(this.result), mode });
    this.activeUnit = unit;
  }

  _resetDraw(continueDraw) {
    if (this.draw && this.continueDraw) {
      this.ids && this.draw.delete(this.ids);
      this.ids = null;
      this._removePopups();
      this._removeHoverPopup();
    }
    this.isOpenMoveEvent = true;
    this.cacheLengthUnitList = {};
    this.measureNodes = [];
    this.result = 0;
    if (!continueDraw) {
      this.activeMode = null;
      this.mode = null;
    }
    this.fire('measure-start', { result: this._getFormatResult(this.result) });
  }

  _continueDraw() {
    if (this._isDrawing()) {
      this._resetDraw(true);
      this.map.off('mousemove', this.popupFollowMouseBind);
      this.map.off('mousedown', this.continueDrawBind);
    }
  }

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
        lngLat: { lng, lat }
      } = e;
      const lastPointPos = [lng, lat];
      let popup = this.tipHoverDiv;
      if (!popup) {
        popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
        });
      }
      popup.setLngLat(lastPointPos);
      const measureNodeList = [].concat(this.measureNodes, [lastPointPos]);
      const feature = {
        type: 'Feature',
        geometry: {
          type: `${this.activeMode === 'draw_line_string' ? 'LineString' : 'Polygon'}`,
          coordinates: this.activeMode === 'draw_line_string' ? measureNodeList : [measureNodeList]
        }
      };
      switch (this.activeMode) {
        case 'draw_line_string':
          this.result = convertMeasureDistance(length(feature, 'kilometers'), 'kilometers', this.activeUnit, this.dashboardConfig);
          popup.setText(`${this._getFormatResult(this.result)} ${this.getUnitLabel('distance', this.activeUnit)}`);
          break;
        case 'draw_polygon':
          this.result = convertMeasureArea(area(feature), 'meters', this.activeUnit, this.dashboardConfig);
          popup.setText(`${this._getFormatResult(this.result)} ${this.getUnitLabel('area', this.activeUnit)}`);
          break;
      }
      popup.addTo(this.map);
      this.setPopupStyle && this.setPopupStyle();
      this.cachePolygonUnit.value = this.result;
      this.cachePolygonUnit.unit = this.activeUnit;
      this.tipHoverDiv = popup;
    }
  }

  _renderPopupTip(e) {
    const {
      lngLat: { lng, lat }
    } = e;
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
    });
    if (this.measureNodes.length > 1) {
      const line = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: this.measureNodes
        }
      };
      const calcValue = convertMeasureDistance(length(line, 'kilometers'), 'kilometers', this.activeUnit, this.dashboardConfig);
      const formatValue = this._getFormatResult(calcValue);

      this.cacheLengthUnitList.id = this.cacheLengthUnitList.id || [];
      this.cacheLengthUnitList.id.push({ value: formatValue, rawValue: calcValue, unit: this.activeUnit });
      popup.setText(`${formatValue} ${this.getUnitLabel('distance', this.activeUnit)}`);
    } else {
      popup.setText(geti18n().t('measure.startingPoint'));
      this.cacheLengthUnitList.id = this.cacheLengthUnitList.id || [];
    }
    popup.setLngLat([lng, lat]);
    popup.addTo(this.map);
    this.setPopupStyle && setTimeout(this.setPopupStyle, 0);
    this.lenTipNodesList.id = this.lenTipNodesList.id || [];
    this.lenTipNodesList.id.push(popup);
  }

  _getFormatResult(result) {
    return reservedDecimal(result || this.result, 4);
  }

  _isDrawing() {
    return drawEvent.$options.getDrawingState(this.mapTarget, this.componentName) && this.draw;
  }

  _updateLenPopupNodes(idValue) {
    this.cacheLengthUnitList[idValue] = this.cacheLengthUnitList.id || [];
    delete this.cacheLengthUnitList.id;

    this.lenTipNodesList[idValue] = this.lenTipNodesList.id || [];
    delete this.lenTipNodesList.id;
    for (const id in this.lenTipNodesList) {
      const tipNodes = this.lenTipNodesList[id];
      if (tipNodes && !tipNodes.length) {
        delete this.lenTipNodesList[id];
        delete this.cacheLengthUnitList[id];
      }
    }
  }

  _updateAreaPopupNodes(popupResult, feature) {
    const centerResult = center(feature);
    const result = this._getFormatResult(popupResult);
    const unitLabel = this.getUnitLabel('area', this.activeUnit);
    if (this.continueDraw) {
      this.tipHoverDiv && this.tipHoverDiv.setLngLat(centerResult.geometry.coordinates).setText(`${result} ${unitLabel}`);
    } else {
      this._removeHoverPopup();
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'sm-component-measure__popup sm-mapboxgl-tabel-popup'
      });
      popup.setLngLat(centerResult.geometry.coordinates).setText(`${result} ${unitLabel}`).addTo(this.map);
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
    for (const id in this.lenTipNodesList) {
      const tipNodes = this.lenTipNodesList[id];
      if (tipNodes && tipNodes.length) {
        tipNodes.forEach(tipNode => tipNode.remove());
      }
    }
    for (const id in this.areaTipNodesList) {
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

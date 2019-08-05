import Vue from 'vue';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import mapEvent from './map-event';
import assignIn from 'lodash.assignin';

/**
 * drawList 结构为 { [mapTarget1]: [draw1], [mapTarget2]: [draw2] }
 * drawStates 结构如下，每个地图上必须保证只有一个组件的绘画状态为true
 * {
 *  [mapTarget1]: {[component1]: true/false, [component2]: true/false},
 *  [mapTarget2]: {[component1]: true/false, [component2]: true/false}
 * }
 */

const NewSimpleSelect = assignIn(MapboxDraw.modes.simple_select, {
  dragMove() {},
  clickOnVertex() {},
  clickOnFeature(state, e) {
    this.stopExtendedInteractions(state);

    const isShiftClick = e.originalEvent && e.originalEvent.shiftKey;
    const selectedFeatureIds = this.getSelectedIds();
    const featureId = e.featureTarget.properties.id;
    const isFeatureSelected = this.isSelected(featureId);

    // Shift-click on an unselected feature
    if (!isFeatureSelected && !isShiftClick) {
      // Make it the only selected feature
      selectedFeatureIds.forEach(id => this.doRender(id));
      this.setSelected(featureId);
    }

    // No matter what, re-render the clicked feature
    this.doRender(featureId);
  }
});

const NewDirectSelect = assignIn(MapboxDraw.modes.direct_select, {
  dragFeature() {}
});

export default new Vue({
  drawList: {},
  drawStates: {},
  _createDraw: function(mapTarget) {
    const drawOptions = {
      displayControlsDefault: false,
      touchEnabled: false,
      boxSelect: false,
      modes: {
        ...MapboxDraw.modes,
        simple_select: NewSimpleSelect,
        direct_select: NewDirectSelect
      },
      styles: [
        // line stroke
        {
          id: 'draw-line-static',
          type: 'line',
          filter: [
            'any',
            ['==', 'active', 'false'],
            ['all', ['==', 'active', 'true'], ['==', 'mode', 'simple_select']]
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#f75564',
            'line-width': 3
          }
        },
        {
          id: 'draw-line-hover',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'id', '']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#f75564',
            'line-width': 33,
            'line-opacity': 0.2
          }
        },
        {
          id: 'draw-line-drawing',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['!=', 'mode', 'simple_select']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#f75564',
            'line-dasharray': [0.4, 2],
            'line-width': 3
          }
        },
        {
          id: 'draw-line-dashed',
          type: 'line',
          filter: ['all', ['==', 'id', '']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#f75564',
            'line-dasharray': [0.4, 2],
            'line-width': 3
          }
        },
        // polygon fill
        {
          id: 'draw-polygon-static',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': '#f75564',
            'fill-outline-color': '#f75564',
            'fill-opacity': 0.4
          }
        },
        // vertex point halos
        {
          id: 'draw-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          id: 'draw-vertex-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'vertex']],
          paint: {
            'circle-radius': 4,
            'circle-color': '#f75564'
          }
        },
        // point
        {
          id: 'draw-point-static',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#f75564'
          }
        }
      ]
    };
    const draw = new MapboxDraw(drawOptions);
    this.drawList[mapTarget] = draw;
    return draw;
  },
  getDraw: function(mapTarget, create = true) {
    let draw = this.drawList[mapTarget];
    const map = mapEvent.$options.getMap(mapTarget);
    if (map && !draw && create) {
      draw = this._createDraw(mapTarget);
      draw.onAdd(map);
    }
    return draw;
  },
  getDrawingState: function(mapTarget, componentName) {
    return this.drawStates[mapTarget] && this.drawStates[mapTarget][componentName];
  },
  setDrawingState: function(mapTarget, componentName, drawing) {
    this.drawStates[mapTarget] = this.drawStates[mapTarget] || {};
    if (drawing) {
      for (let key in this.drawStates[mapTarget]) {
        this.drawStates[mapTarget][key] = false;
      }
    }
    this.drawStates[mapTarget][componentName] = drawing;
  },
  deleteDrawingState: function(mapTarget, componentName) {
    const mapDrawStates = this.drawStates[mapTarget];
    if (mapDrawStates) {
      if (componentName in mapDrawStates) {
        delete mapDrawStates[componentName];
      }
      // 如果当前map上有关draw的组件都销毁 则把当前map上的draw图层销毁 同时把组件状态也销毁
      if (!Object.keys(mapDrawStates).length) {
        delete this.drawStates[mapTarget];
        this.deletDrawOfMap(mapTarget);
      }
    }
  },
  deletDrawOfMap: function(mapTarget) {
    const draw = this.getDraw(mapTarget);
    const map = mapEvent.$options.getMap(mapTarget);
    if (draw && map) {
      draw.onRemove(map);
      delete this.drawList[mapTarget];
    }
  }
});

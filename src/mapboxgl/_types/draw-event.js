import Vue from 'vue';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import mapEvent from './map-event';

/**
 * drawList 结构为 { [mapTarget1]: [draw1], [mapTarget2]: [draw2] }
 * drawStates 结构如下，每个地图上必须保证只有一个组件的绘画状态为true
 * {
 *  [mapTarget1]: {[component1]: true/false, [component2]: true/false},
 *  [mapTarget2]: {[component1]: true/false, [component2]: true/false}
 * }
 */
export default new Vue({
  drawList: {},
  drawStates: {},
  _createDraw: function(mapTarget) {
    const drawOptions = {
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: false
      },
      styles: [
        // line stroke
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#D20C0C',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#D20C0C',
            'fill-outline-color': '#D20C0C',
            'fill-opacity': 0.1
          }
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#D20C0C',
            'line-dasharray': [0.2, 2],
            'line-width': 2
          }
        },
        // vertex point halos
        {
          id: 'gl-draw-polygon-and-line-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
          paint: {
            'circle-radius': 3,
            'circle-color': '#D20C0C'
          }
        },
        // INACTIVE (static, already drawn)
        // line stroke
        {
          id: 'gl-draw-line-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        },
        // polygon fill
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          paint: {
            'fill-color': '#000',
            'fill-outline-color': '#000',
            'fill-opacity': 0.1
          }
        },
        // polygon outline
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#000',
            'line-width': 3
          }
        },
        // point outline
        {
          id: 'gl-draw-point-stroke-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['==', 'active', 'true']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#fff'
          }
        },
        // point fill
        {
          id: 'gl-draw-point-fill-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['==', 'active', 'true']],
          paint: {
            'circle-radius': 5,
            'circle-color': '#D20C0C'
          }
        },
        // point
        {
          id: 'gl-draw-point-static',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature'], ['==', 'active', 'false']],
          paint: {
            'circle-radius': 7,
            'circle-color': '#D20C0C'
          }
        }
      ]
    };
    const draw = new MapboxDraw(drawOptions);
    this.drawList[mapTarget] = draw;
    return draw;
  },
  getDraw: function(mapTarget) {
    let draw = this.drawList[mapTarget];
    const map = mapEvent.$options.getMap(mapTarget);
    if (map && !draw) {
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

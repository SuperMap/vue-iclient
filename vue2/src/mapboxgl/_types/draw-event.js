import Vue from 'vue';
import MapboxDraw from 'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw';
import mapEvent from 'vue-iclient/src/mapboxgl/_types/map-event';
import assignIn from 'lodash.assignin';
import isEqual from 'lodash.isequal';

/**
 * drawList 结构为 { [mapTarget1]: [draw1], [mapTarget2]: [draw2] }
 * drawStates 结构如下，每个地图上必须保证只有一个组件的绘画状态为true
 * {
 *  [mapTarget1]: {[component1]: true/false, [component2]: true/false},
 *  [mapTarget2]: {[component1]: true/false, [component2]: true/false}
 * }
 */

const mainColor = '#f75564';
const haloColor = '#fff';
export const defaultStyles = {
  'line-static': {
    'line-color': mainColor,
    'line-width': 3
  },
  'line-hover': {
    'line-color': mainColor,
    'line-width': 33,
    'line-opacity': 0.2
  },
  'line-drawing': {
    'line-color': mainColor,
    'line-dasharray': [0.4, 2],
    'line-width': 3
  },
  'fill-static': {
    'fill-color': mainColor,
    'fill-outline-color': mainColor,
    'fill-opacity': 0.4
  },
  'fill-drawing': {
    'fill-color': mainColor,
    'fill-outline-color': mainColor,
    'fill-opacity': 0.6
  },
  'vertex-static': {
    'circle-radius': 4,
    'circle-color': mainColor
  },
  'vertex-halo-static': {
    'circle-radius': 6,
    'circle-color': haloColor
  },
  'circle-static': {
    'circle-radius': 6,
    'circle-color': mainColor
  },
  'circle-drawing': {
    'circle-radius': 4,
    'circle-color': haloColor
  },
  'circle-halo-drawing': {
    'circle-radius': 6,
    'circle-color': mainColor
  }
};

export default new Vue({
  mapList: {},
  drawList: {},
  drawStates: {},
  _createDraw: function (mapTarget, styles = defaultStyles) {
    const drawOptions = {
      displayControlsDefault: false,
      touchEnabled: false,
      boxSelect: false,
      modes: {
        ...MapboxDraw.modes,
        simple_select: assignIn(MapboxDraw.modes.simple_select, {
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
        }),
        direct_select: assignIn(MapboxDraw.modes.direct_select, {
          dragFeature() {}
        })
      },
      styles: [
        // line stroke
        {
          id: 'draw-line-static',
          type: 'line',
          filter: [
            'any',
            ['==', 'active', 'false'],
            ['all', ['==', 'active', 'true'],
              ['==', 'mode', 'simple_select']
            ]
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            ...defaultStyles['line-static'],
            ...styles['line-static']
          }
        },
        {
          id: 'draw-line-hover',
          type: 'line',
          filter: ['all', ['==', '$type', 'LineString'],
            ['==', 'id', '']
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            ...defaultStyles['line-hover'],
            ...styles['line-hover']
          }
        },
        {
          id: 'draw-line-drawing',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'],
            ['!=', 'mode', 'simple_select']
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            ...defaultStyles['line-drawing'],
            ...styles['line-drawing']
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
            ...defaultStyles['line-drawing'],
            ...styles['line-drawing']
          }
        },
        // polygon fill
        {
          id: 'draw-polygon-active',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'],
            ['==', 'active', 'true'],
            ['!=', 'mode', 'simple_select']
          ],
          paint: {
            ...defaultStyles['fill-drawing'],
            ...styles['fill-drawing']
          }
        },
        {
          id: 'draw-polygon-static',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'],
            [
              'any',
              ['==', 'active', 'false'],
              ['all', ['==', 'active', 'true'],
                ['==', 'mode', 'simple_select']
              ]
            ]
          ],
          paint: {
            ...defaultStyles['fill-static'],
            ...styles['fill-static']
          }
        },
        // vertex point halos
        {
          id: 'draw-vertex-halo-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'vertex']
          ],
          paint: {
            ...defaultStyles['vertex-halo-static'],
            ...styles['vertex-halo-static']
          }
        },
        // vertex points
        {
          id: 'draw-vertex-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'vertex']
          ],
          paint: {
            ...defaultStyles['vertex-static'],
            ...styles['vertex-static']
          }
        },
        // point
        {
          id: 'draw-point-static',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'false']
          ],
          paint: {
            ...defaultStyles['circle-static'],
            ...styles['circle-static']
          }
        },
        // point-active
        {
          id: 'draw-point-halo-static-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'true']
          ],
          paint: {
            ...defaultStyles['circle-halo-drawing'],
            ...styles['circle-halo-drawing']
          }
        },
        {
          id: 'draw-point-static-active',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'true']
          ],
          paint: {
            ...defaultStyles['circle-drawing'],
            ...styles['circle-drawing']
          }
        }
      ]
    };
    const draw = new MapboxDraw(drawOptions);
    this.drawList[mapTarget] = draw;
    return draw;
  },
  getDraw: function ({
    mapTarget,
    create = true,
    styles = defaultStyles
  }) {
    let draw = this.drawList[mapTarget];
    const map = mapEvent.$options.getMap(mapTarget);
    const prevMap = this.mapList[mapTarget];
    const isSame = isEqual(map, prevMap);
    if (map && !isSame && create) {
      draw = this._createDraw(mapTarget, styles);
      draw.onAdd(map);
      this.mapList[mapTarget] = map;
    }
    return draw;
  },
  getDrawingState: function (mapTarget, componentName) {
    return this.drawStates[mapTarget] && this.drawStates[mapTarget][componentName];
  },
  setDrawingState: function (mapTarget, componentName, drawing) {
    this.drawStates[mapTarget] = this.drawStates[mapTarget] || {};
    if (drawing) {
      for (let key in this.drawStates[mapTarget]) {
        this.drawStates[mapTarget][key] = false;
      }
    }
    this.drawStates[mapTarget][componentName] = drawing;
  },
  deleteDrawingState: function (mapTarget, componentName) {
    const mapDrawStates = this.drawStates[mapTarget];
    if (mapDrawStates) {
      if (componentName in mapDrawStates) {
        delete mapDrawStates[componentName];
      }
      // 如果当前map上有关draw的组件都销毁 则把当前map上的draw图层销毁 同时把组件状态也销毁
      const componentsLen = Object.keys(this.drawStates[mapTarget]).length;
      if (!componentsLen) {
        this.deleteDrawOfMap(mapTarget);
      }
    }
  },
  deleteDrawOfMap: function (mapTarget) {
    const draw = this.getDraw({
      mapTarget,
      create: false
    });
    const map = this.mapList[mapTarget];
    if (draw && map) {
      draw.onRemove(map);
      delete this.drawList[mapTarget];
      delete this.mapList[mapTarget];
      delete this.drawStates[mapTarget];
    }
  }
});

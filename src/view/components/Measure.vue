<template>
  <div class="sm-measure">
    <div class="sm-measure__panel">
      <div class="sm-measure__panelTitle">
        <span class="sm-measure__title">地图量算</span>
      </div>
      <div class="sm-measure__panelContent">
        <span
          v-for="group in modeGroups"
          :key="group.mode"
          :class="{'sm-measure__modeIcon': true, 'sm-measure__iconActive': activeMode === group.mode}"
          :title="group.title"
          @click="checkMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <el-select
          v-model="activeUnit"
          placeholder="请选择"
          size="mini"
          class="sm-measure__unit"
          v-show="isShowUnitOptions && activeMode"
          @change="updateUnit"
        >
          <el-option v-for="value in getUnitOptions" :key="value" :label="value" :value="value"></el-option>
        </el-select>
        <div
          v-show="!isShowUnitOptions && activeMode"
          class="sm-measure__unit sm-measure__default"
        >{{activeUnit}}</div>
      </div>
      <div class="sm-measure__calculateResult">
        <div class="sm-measure__calcuTitle">测量结果</div>
        <div class="sm-measure__result" v-show="!!result">{{`${getFormatResult()}${activeUnit}`}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import turf from 'turf';
import Widget from './Widget';
import { reservedDecimal } from '../../utils/formatter';

export default {
  name: 'SmMeasure',
  extends: Widget,
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-measure'
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    isShowUnitOptions: {
      // 配置单位选择框是否显示，若不显示，则显示对应的默认单位
      type: Boolean,
      default: true
    },
    distanceDefaultUnit: {
      // 距离默认单位
      type: String,
      default: 'kilometers'
    },
    areaDefaultUnit: {
      // 面积默认单位
      type: String,
      default: 'meters'
    }
  },
  data() {
    const unitOptions = {
      draw_line_string: ['kilometers', 'miles', 'degrees', 'radians'],
      draw_polygon: ['meters']
    };
    return {
      unitOptions,
      modeGroups: [
        {
          mode: 'draw_line_string',
          title: '测距离',
          iconClass: 'smwidgets-icons-line-layer'
        },
        {
          mode: 'draw_polygon',
          title: '测面积',
          iconClass: 'smwidgets-icons-polygon-layer'
        }
      ],
      activeMode: '',
      activeUnit: '',
      draw: null,
      result: '',
      measureNodes: [], // 收集测算长度生成每个点的feature数据, 方便后面计算总长度
      tipNodes: [] // 收集测算长度实时生成的popup，以方便后面销毁
    };
  },
  computed: {
    getUnitOptions() {
      return this.unitOptions[this.activeMode] || [];
    },
    getInitUnit() {
      if (this.activeMode === 'draw_line_string') {
        this.activeUnit = this.distanceDefaultUnit;
      } else if (this.activeMode === 'draw_polygon') {
        this.activeUnit = this.areaDefaultUnit;
      }
      return this.getUnitOptions[0];
    }
  },
  loaded() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      styles: [
        // line stroke
        {
          id: 'gl-draw-line',
          type: 'line',
          filter: [
            'all',
            ['==', '$type', 'LineString'],
            ['!=', 'mode', 'static']
          ],
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
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#FFF'
          }
        },
        // vertex points
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static']
          ],
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
          filter: [
            'all',
            ['==', '$type', 'LineString'],
            ['==', 'mode', 'static']
          ],
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
        }
      ]
    });
    this.map.addLayer(this.draw);
    this.map.on('draw.create', this.measureLastDistance);
  },
  methods: {
    // 切换量算模式
    checkMeasureMode(mode) {
      // 绘画之前先清除
      this.draw.deleteAll();
      this.measureNodes = [];
      this.tipNodes.length &&
        this.tipNodes.map(tipNode => tipNode.remove());
      this.tipNodes = [];
      this.result = 0;
      this.resetEvent();
      if (this.activeMode !== mode) {
        this.activeMode = mode;
        this.activeUnit = this.getInitUnit;
        // 绘画线或面
        this.draw.changeMode(mode);
        this.map.on('click', this.measureNodeDistance);
      } else {
        this.activeMode = null;
      }
    },
    // 绘画结束后计算最后的结果
    measureLastDistance(e) {
      switch (this.activeMode) {
        case 'draw_line_string':
          this.result = turf.lineDistance(e.features[0], this.activeUnit);
          this.resetEvent();
          break;
        case 'draw_polygon':
          this.result = turf.area(e.features[0]);
          this.resetEvent(false, this.result, e.features[0]);
          break;
      }
    },
    // 绘画每个点显示tip，同时监听鼠标move事件
    measureNodeDistance(e) {
      const {
        lngLat: { lng, lat }
      } = e;
      const to = [lng, lat];
      this.measureNodes.push(to);
      if (this.activeMode === 'draw_line_string') {
        this.renderPopupTip(e);
      }
      this.map.on('mousemove', this.showDistanceTipHover);
      const { features } = this.draw.getAll();
      if (!features.length) {
        this.resetEvent();
        this.activeMode = null;
      }
    },
    // 实时显示计算结果
    showDistanceTipHover(e) {
      const {
        point,
        originalEvent,
        lngLat: { lng, lat }
      } = e;
      const lastPointPos = [lng, lat];
      let popup = this.tipHoverDiv;
      // 实时显示popup只需要一个，如果没有再生成新popup
      if (!popup) {
        popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });
      }
      popup.setLngLat(lastPointPos);
      let measureNodeList = [].concat(this.measureNodes, [lastPointPos]);
      let feature = {
        type: 'Feature',
        geometry: {
          type: `${
            this.activeMode === 'draw_line_string' ? 'LineString' : 'Polygon'
          }`,
          coordinates:
            this.activeMode === 'draw_line_string'
              ? measureNodeList
              : [measureNodeList]
        }
      };
      switch (this.activeMode) {
        case 'draw_line_string':
          this.result = turf.lineDistance(feature, this.activeUnit);
          break;
        case 'draw_polygon':
          this.result = turf.area(feature);
          break;
      }
      popup.setText(`${this.getFormatResult()} ${this.activeUnit}`);
      popup.addTo(this.map);
      this.tipHoverDiv = popup;
    },
    // 绘画时，每生成一个点显示一个tip显示结果
    renderPopupTip(e) {
      const { point, originalEvent, lngLat: {lng, lat} } = e;
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      });
      popup.setLngLat([lng, lat]);
      if (this.measureNodes.length > 1) {
        let line = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: this.measureNodes
          }
        };
        popup.setText(`${turf.lineDistance(line, this.activeUnit)} ${this.activeUnit}`);
      } else {
        popup.setText('起点');
      }
      popup.addTo(this.map);
      this.tipNodes.push(popup);
    },
    // 更改测量单位后 重新计算结果
    updateUnit(val) {
      console.log(val);
      console.log(this.measureNodes);
      console.log(this.tipNodes);
    },
    resetEvent(isResetHoverTip = true, result, feature) {
      this.map.off('click', this.measureNodeDistance);
      this.map.off('mousemove', this.showDistanceTipHover);
      if (isResetHoverTip) {
        // 如果是测量长度，销毁实时计算生成的popup
        this.tipHoverDiv && this.tipHoverDiv.remove();
        this.tipHoverDiv = null;
      } else {
        // 如果是测量面积，直接利用实时计算生成的popup显示最后结果
        const center = turf.center(feature);
        this.tipHoverDiv.setLngLat(center.geometry.coordinates).setText(`${result} ${this.activeUnit}`);
      }
    },
    getFormatResult() {
      return reservedDecimal(this.result, 4);
    }
  }
};
</script>

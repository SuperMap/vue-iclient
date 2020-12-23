<template>
  <div
    v-show="false"
    ref="Popup"
    class="sm-component-identify"
    :style="[tablePopupBgStyle, getTextColorStyle]"
  >
    <ul
      :class="[
        autoResize ? 'sm-component-identify__auto' : 'sm-component-identify__custom',
        'sm-component-identify__content'
      ]"
    >
      <li v-for="(value, key, index) in popupProps" :key="index" class="content">
        <div class="left ellipsis" :title="key" :style="getWidthStyle.keyWidth">{{ key }}</div>
        <div class="right ellipsis" :title="value" :style="getWidthStyle.valueWidth">{{ value }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import Theme from '../../../../common/_mixin/Theme';
import MapGetter from '../../../_mixin/map-getter';
import IdentifyViewModel from './IdentifyViewModel';
import CircleStyle from '../../../_types/CircleStyle';
import FillStyle from '../../../_types/FillStyle';
import LineStyle from '../../../_types/LineStyle';
import { setPopupArrowStyle } from '../../../../common/_utils/util';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Theme],
  props: {
    layers: {
      type: Array,
      default() {
        return [];
      }
    },
    fields: {
      type: Array,
      default() {
        return [];
      }
    },
    clickTolerance: {
      type: Number,
      default: 5
    },
    layerStyle: {
      type: Object,
      default() {
        return {
          line: new LineStyle({
            'line-width': 3,
            'line-color': '#409eff',
            'line-opacity': 1
          }),
          circle: new CircleStyle({
            'circle-color': '#409eff',
            'circle-opacity': 0.6,
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#409eff',
            'circle-stroke-opacity': 1
          }),
          fill: new FillStyle({
            'fill-color': '#409eff',
            'fill-opacity': 0.6,
            'fill-outline-color': '#409eff'
          }),
          stokeLine: new LineStyle({
            'line-width': 3,
            'line-color': '#409eff',
            'line-opacity': 1
          })
        };
      }
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    keyMaxWidth: {
      type: [Number, String],
      default: 110
    },
    valueMaxWidth: {
      type: [Number, String],
      default: 170
    },
    keyWidth: {
      type: [Number, String],
      default: 110
    },
    valueWidth: {
      type: [Number, String],
      default: 170
    }
  },
  data() {
    return {
      isHide: true, // 消除style里block
      popupProps: {}
    };
  },
  computed: {
    getWidthStyle() {
      let style = { keyWidth: {}, valueWidth: {} };
      if (!this.autoResize) {
        if (this.keyWidth) {
          style.keyWidth.width = this.keyWidth + 'px';
        }
        if (this.valueWidth) {
          style.valueWidth.width = this.valueWidth + 'px';
        }
        return style;
      } else {
        if (this.keyMaxWidth) {
          style.keyWidth.maxWidth = this.keyMaxWidth + 'px';
        }
        if (this.valueMaxWidth) {
          style.valueWidth.maxWidth = this.valueMaxWidth + 'px';
        }
      }
      return style;
    },
    layersOnMap() {
      let layersOnMap = [];
      if (this.map) {
        for (let i = 0; i < this.layers.length; i++) {
          if (this.map.getLayer(this.layers[i])) {
            layersOnMap.push(this.layers[i]);
          }
        }
      }
      return layersOnMap;
    }
  },
  watch: {
    layers: {
      handler(val, oldVal) {
        this.viewModel && this.viewModel.removed(oldVal);
        this.removeCursorEvent(oldVal);
        this.setViewModel();
      }
    },
    layerStyle() {
      this.setViewModel();
    }
  },
  loaded() {
    // 每次地图加载，就要隐藏（md的切换地图）
    this.isHide = true;
    // this.changeCursorPointer = () => {
    //   this.changeCursor('pointer', this.map);
    //   console.log('enter');
    // };
    this.changeCursorGrab = () => this.changeCursor('grab', this.map);
    this.setViewModel();
  },
  removed(layers = this.layersOnMap) {
    if (this.map) {
      this.map.off('click', this.sourceMapClickFn);
      this.map.off('mousemove', this.changeCursorPointer);
      this.map.off('mouseleave', this.changeCursorGrab);
    }
    // 清除旧的高亮的图层
    this.viewModel && this.viewModel.removed();
  },
  beforeDestroy() {
    this.$options.removed.call(this);
  },
  methods: {
    setViewModel() {
      if (this.layers) {
        this.viewModel = new IdentifyViewModel(this.map, {
          mapTarget: this.getTargetName(),
          layers: this.layers,
          layerStyle: this.layerStyle
        });
        this.map && this.bindMapClick(this.map);
        this.changeClickedLayersCursor(this.layersOnMap);
      }
    },
    // 给图层绑定popup和高亮
    bindMapClick(map) {
      map.on('click', this.sourceMapClickFn);
    },
    // 给source中的图层绑定popup
    sourceMapClickFn(e) {
      // 如果点击其他的要素，移除之前的高亮
      this.viewModel.removeOverlayer(this.layers);
      // 获取点中图层的features
      let features = this.bindQueryRenderedFeatures(e);
      if (features[0]) {
        let index = this.layers && this.layers.indexOf(features[0].layer.id);
        let fields;
        if (this.fields instanceof Array) {
          // 如果是二维数组
          fields = this.fields[index];
          // 兼容一维数组
          if (typeof fields === 'string') {
            fields = this.fields;
          }
        } else if (this.fields instanceof Object && index === 0) {
          fields = this.fields;
        }
        this.layersMapClickFn(e, fields || [], features[0]);
      }
    },
    // 给layer绑定queryRenderedFeatures
    bindQueryRenderedFeatures(e, layers = this.layersOnMap) {
      let map = e.target;
      let bbox = [
        [e.point.x - this.clickTolerance, e.point.y - this.clickTolerance],
        [e.point.x + this.clickTolerance, e.point.y + this.clickTolerance]
      ];
      let features = map.queryRenderedFeatures(bbox, {
        layers
      });
      return features;
    },
    // 给点击的图层添加popup和高亮
    layersMapClickFn(e, fields, feature) {
      let map = e.target;
      // 添加popup
      this.addPopup(feature, e.lngLat.toArray(), fields);
      // 高亮过滤(所有字段)
      let filter = ['all'];
      const filterKeys = ['smx', 'smy', 'lon', 'lat', 'longitude', 'latitude', 'x', 'y', 'usestyle', 'featureinfo'];
      feature._vectorTileFeature._keys.forEach((key, index) => {
        if (filterKeys.indexOf(key.toLowerCase()) === -1 && feature.properties[key] !== undefined) {
          filter.push(['==', key, feature.properties[key]]);
        }
      });
      // 添加高亮图层
      this.addOverlayToMap(feature.layer, filter);
      // 给图层加上高亮
      if (map.getLayer(feature.layer.id + '-identify-SM-highlighted')) {
        map.setFilter(feature.layer.id + '-identify-SM-highlighted', filter);
      }
    },
    // 过滤数据， 添加popup
    addPopup(feature, coordinates, fields) {
      this.popupProps = {};
      if (feature.properties) {
        // 过滤字段
        if (fields.length > 0) {
          fields.forEach(field => {
            if (feature.properties.hasOwnProperty(field)) {
              this.popupProps[field] = feature.properties[field];
            }
          });
        } else {
          // 默认是读取layer的全部字段
          this.popupProps = feature.properties;
        }
        // 添加popup
        this.$nextTick(() => {
          this.isHide = false; // 显示内容
          this.viewModel.addPopup(coordinates, this.$refs.Popup);
          setPopupArrowStyle(this.tablePopupBgData);
        });
      }
    },
    // 添加高亮图层
    addOverlayToMap(layer, filter) {
      // 先移除之前的高亮layer
      this.viewModel.addOverlayToMap(layer, filter);
    },
    changeClickedLayersCursor(layers = [], map = this.map) {
      layers &&
        layers.forEach(layer => {
          map.on('mousemove', layer, this.changeCursorPointer);
          map.on('mouseleave', layer, this.changeCursorGrab);
        });
    },
    changeCursor(cursorType = 'grab', map = this.map) {
      if (map && map.getCanvas()) {
        map.getCanvas().style.cursor = cursorType;
      }
    },
    changeCursorPointer() {
      this.changeCursor('pointer', this.map);
    },
    removeCursorEvent(layers = this.layersOnMap) {
      if (!this.map) {
        return;
      }
      this.map.off('click', this.sourceMapClickFn);
      layers.forEach(layer => {
        this.map.off('mousemove', layer, this.changeCursorPointer);
        this.map.off('mouseleave', layer, this.changeCursorGrab);
        this.changeCursor('grab', this.map);
      });
    }
  }
};
</script>

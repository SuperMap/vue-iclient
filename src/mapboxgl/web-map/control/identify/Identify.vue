<template>
  <div v-show="false" ref="Popup" class="sm-component-identify">
    <ul
      :class="[
        autoResize ? 'sm-component-identify__auto' : 'sm-component-identify__custom',
        'sm-component-identify__content'
      ]"
      :style="[getBackgroundStyle, getTextColorStyle]"
    >
      <li v-for="(value, key, index) in popupProps" :key="index" class="content">
        <div class="left ellipsis" :title="key" :style="getWidthStyle.keyWidth">{{ key }}</div>
        <div class="right ellipsis" :title="value" :style="getWidthStyle.valueWidth">{{ value }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import MapGetter from '../../../_mixin/map-getter';
import IdentifyViewModel from './IdentifyViewModel';
import CircleStyle from '../../../_types/CircleStyle';
import FillStyle from '../../../_types/FillStyle';
import LineStyle from '../../../_types/LineStyle';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Theme],
  props: {
    layers: {
      type: Object,
      default() {
        return {};
      }
    },
    fields: {
      type: Object,
      default() {
        return {};
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
    getAllLayers() {
      let allLayers = [];
      for (let key in this.layers) {
        let layers = this.layers[key];
        if (layers) {
          allLayers = allLayers.concat(layers);
        }
      }
      return allLayers;
    },
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
    }
  },
  watch: {
    layers: {
      handler(val, oldVal) {
        if (!isEqual(val, oldVal)) {
          this.viewModel && this.viewModel.removed(oldVal);
          this.setViewModel();
        }
      }
    },
    layerStyle() {
      this.setViewModel();
    },
    backgroundData() {
      this.changeResultPopupArrowStyle();
    }
  },
  loaded() {
    // 每次地图加载，就要隐藏（md的切换地图）
    this.isHide = true;
    this.setViewModel();
  },
  removed() {
    this.map && this.map.off('click', this.sourceMapClickFn);
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
          source: this.layers,
          layerStyle: this.layerStyle
        });
        this.map && this.bindMapClick(this.map);
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
        let fileds = this.fields[features[0].source] || [];
        this.layersMapClickFn(e, fileds, features[0]);
      }
    },
    // 给layer绑定queryRenderedFeatures
    bindQueryRenderedFeatures(e) {
      let layersOnMap = [];
      let map = e.target;
      let bbox = [
        [e.point.x - this.clickTolerance, e.point.y - this.clickTolerance],
        [e.point.x + this.clickTolerance, e.point.y + this.clickTolerance]
      ];
      for (let i = 0; i < this.getAllLayers.length; i++) {
        if (map.getLayer(this.getAllLayers[i])) {
          layersOnMap.push(this.getAllLayers[i]);
        }
      }
      let features = map.queryRenderedFeatures(bbox, {
        layers: layersOnMap
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
      if (map.getLayer(feature.layer.id + '-SM-highlighted')) {
        map.setFilter(feature.layer.id + '-SM-highlighted', filter);
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
          this.changeResultPopupArrowStyle();
        });
      }
    },
    // 添加高亮图层
    addOverlayToMap(layer, filter) {
      // 先移除之前的高亮layer
      this.viewModel.addOverlayToMap(layer, filter);
    },
    // 箭头颜色（适应主题色）
    changeResultPopupArrowStyle() {
      const identifyBottomAnchor =
        document.querySelector('.mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip') ||
        document.querySelector('.mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip') ||
        document.querySelector('.mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip');
      const identifyTopAnchor =
        document.querySelector('.mapboxgl-popup-anchor-top .mapboxgl-popup-tip') ||
        document.querySelector('.mapboxgl-popup-anchor-top-left .mapboxgl-popup-tip') ||
        document.querySelector('.mapboxgl-popup-anchor-top-right .mapboxgl-popup-tip');
      const identifyLeftAnchor = document.querySelector('.mapboxgl-popup-anchor-left .mapboxgl-popup-tip');
      const identifyRightAnchor = document.querySelector('.mapboxgl-popup-anchor-right .mapboxgl-popup-tip');

      identifyTopAnchor && (identifyTopAnchor.style.borderBottomColor = this.backgroundData);
      identifyBottomAnchor && (identifyBottomAnchor.style.borderTopColor = this.backgroundData);
      identifyLeftAnchor && (identifyLeftAnchor.style.borderRightColor = this.backgroundData);
      identifyRightAnchor && (identifyRightAnchor.style.borderLeftColor = this.backgroundData);
    }
  }
};
</script>

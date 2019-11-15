<template>
  <ul
    ref="queryClickPopup"
    :style="[getBackgroundStyle, getTextColorStyle]"
    :class="['sm-component-query-click', {'sm-component-content-hide': isHide}]"
  >
    <li
      v-for="(value, key, index) in popupProps"
      :key="index"
      class="sm-component-query-click__body"
    >
      <div class="sm-component-query-click__left" :title="key">{{ key }}</div>
      <div class="sm-component-query-click__right" :title="value">{{ value }}</div>
    </li>
  </ul>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import MapGetter from '../../../_mixin/map-getter';
import Control from '../../../_mixin/control';
import IdentifyViewModel from './IdentifyViewModel';
import CircleStyle from '../../../_types/CircleStyle';
import FillStyle from '../../../_types/FillStyle';
import LineStyle from '../../../_types/LineStyle';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Control, Theme],
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
    clickAreaAround: {
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
    }
  },
  data() {
    return {
      isHide: true, // 消除style里block
      popupProps: {}
    };
  },
  watch: {
    layers: {
      handler(val, oldVal) {
        this.viewModel && this.viewModel.removed(oldVal);
        if (this.layers.length > 0 && !isEqual(val, oldVal)) {
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
    this.map && this.bindMapClick(this.map);
  },
  removed() {
    // 清除旧的高亮的图层
    this.viewModel && this.viewModel.removed();
  },
  beforeDestroy() {
    this.map.off('click');
    this.$options.removed.call(this);
  },
  methods: {
    setViewModel() {
      this.viewModel = new IdentifyViewModel(this.map, {
        mapTarget: this.getTargetName(),
        layers: this.layers,
        layerStyle: this.layerStyle
      });
    },
    // 给图层绑定popup和高亮
    bindMapClick(map) {
      map.on('click', e => {
        // 如果点击其他的要素，移除之前的高亮
        this.viewModel.removed();
        // set bbox as 5px reactangle area around clicked point
        var bbox = [
          [e.point.x - this.clickAreaAround, e.point.y - this.clickAreaAround],
          [e.point.x + this.clickAreaAround, e.point.y + this.clickAreaAround]
        ];
        // 获取点中图层的features
        var features = map.queryRenderedFeatures(bbox, {
          layers: this.layers
        });
        if (features[0]) {
          // 添加popup
          this.addPopup(features[0], e.lngLat.toArray());
          // 高亮过滤(所有字段)
          let filter = ['all'];
          const filterKeys = ['smx', 'smy', 'lon', 'lat', 'longitude', 'latitude', 'x', 'y', 'usestyle', 'featureinfo'];
          features[0]._vectorTileFeature._keys.forEach((key, index) => {
            if (filterKeys.indexOf(key.toLowerCase()) === -1) {
              filter.push(['==', key, features[0].properties[key]]);
            }
          });

          // 添加高亮图层
          this.addOverlayToMap(features[0].layer, filter);
          // 给图层加上高亮
          if (map.getLayer(features[0].layer.id + '-SM-highlighted')) {
            map.setFilter(features[0].layer.id + '-SM-highlighted', filter);
          }
        }
      });
    },
    // 添加popup
    addPopup(feature, coordinates) {
      this.popupProps = {};
      if (feature.properties) {
        // 过滤字段
        if (this.fields.length > 0) {
          this.fields.forEach(field => {
            if (feature.properties[field]) {
              this.popupProps[field] = feature.properties[field];
            }
          });
        }
        // 添加popup
        this.$nextTick(() => {
          this.isHide = false; // 显示内容
          this.viewModel.addPopup(coordinates, this.$refs.queryClickPopup);
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

<style lang="scss" scoped>
.sm-component-content-hide {
  display: none !important;
}
</style>

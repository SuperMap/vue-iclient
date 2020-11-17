<template>
  <ul v-show="false" ref="Popup" :style="[getTextColorStyle]" :class="['sm-component-identify']">
    <li
      v-for="(value, key, index) in popupProps"
      :key="index"
      class="sm-component-identify__body"
    >
      <div class="sm-component-identify__left" :title="key">{{ key }}</div>
      <div class="sm-component-identify__right" :title="value">{{ value }}</div>
    </li>
  </ul>
</template>

<script>
import MapGetter from '../_mixin/map-getter';
import Theme from '../../common/_mixin/Theme';
import IdentifyViewModel from './IdentifyViewModel';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Theme],
  props: {
    layerNames: {
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
    layerStyle: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      popupProps: {},
      layers: [],
      layerType: false,
      popupLayers: [],
      mapClickPosition: null
    };
  },
  watch: {
    layerNames(val, oldVal) {
      if (val) {
        this.$options.removed.call(this, oldVal);
        this.setLayers();
      }
    },
    getBackground() {
      this.changeStyle();
    }
  },
  loaded() {
    this.setViewModel();
    this.setLayers();
    if (this.layers && this.layers.length > 0) {
      this.layers.forEach(layer => {
        let layerType = this.viewModel.getLayerType(layer);
        this.bindLayerClick(layer, layerType);
      });
    }
    // 客户端专题图图层无准确坐标，通过地图坐标来实现
    this.map.on('click', e => {
      this.mapClickPosition = this.map.layerPointToLatLng(e.layerPoint);
    });
  },
  removed(layers = this.layers) {
    // 清除点击事件和popup
    this.popupLayers &&
      this.popupLayers.forEach(layer => {
        layer.closePopup();
        layer.off('click');
        layer.off('popupclose');
      });
    layers &&
      layers.forEach(layer => {
        layer.off('click');
      });
    // 清除高亮的图层
    this.viewModel && this.viewModel.removed();
    // 重置
    this.popupLayers = [];
    this.layers = [];
  },
  beforeDestroy() {
    this.map && this.map.off('click');
    this.$options.removed.call(this);
  },
  methods: {
    setViewModel() {
      this.viewModel = new IdentifyViewModel(this.map, {
        mapTarget: this.getTargetName(),
        layerNames: this.layerNames,
        layerStyle: this.layerStyle
      });
    },
    // 通过layerName设置layers
    setLayers() {
      // 重置layers
      this.layers = [];
      this.layerNames.forEach(layerName => {
        let layer = this.getLayerByName(layerName);
        layer && this.layers.push(layer);
      });
    },
    // 通过layerName获取layer
    getLayerByName(layerName) {
      let layer = this.viewModel.getLayerByName(layerName);
      if (!layer) {
        this.$message.error(this.$t('identify.layerNotExit', { layer: layerName }));
      }
      return layer;
    },
    // 给选中图层绑定click
    bindLayerClick(layer, layerType) {
      if (layerType) {
        // 如果是geojson
        this.bindGeojsonLayer(layer);
      } else if (layer.TFEvents) {
        // 如果是客户端专题图
        this.bindThemeLayer(layer);
      } else {
        // 如果是其他的图层(marker,polygon,polyline,隐藏的客户端专题图)
        this.bindOtherLayer(layer);
      }
    },
    // geojsonlayer绑定click事件
    bindGeojsonLayer(geojsonLayer) {
      geojsonLayer.on('click', e => {
        // e.layer是被选中的某个要素
        this.bindPopupLayer(e.layer.feature, e.layer, e.latlng);
      });
    },
    // 给客户端专题图绑定click事件
    bindThemeLayer(themeLayer) {
      themeLayer.on('click', e => {
        if (e.target && e.target.refDataID) {
          let themeFeature = themeLayer.getFeatureById(e.target.refDataID);
          // 将矢量要素转换成geojson
          let feature = this.viewModel.formatGeoJSON(themeFeature);
          // 因为线坐标等要素不准确，所以用地图的点击的坐标点
          this.bindPopupLayer(feature, themeLayer, '');
        }
      });
    },
    // 其他layer(layergroup等)绑定click事件
    bindOtherLayer(otherLayer) {
      if (otherLayer._layers) {
        for (let key in otherLayer._layers) {
          let layer = otherLayer._layers[key];
          if (layer.TFEvents) {
            // 说明是客户端专题图
            this.bindThemeLayer(otherLayer._layers[key]);
          } else if (this.viewModel.getLayerType(layer)) {
            this.bindGeojsonLayer(layer);
          } else {
            // 普通图层
            let popupLayer;
            let feature;
            layer.on('click', e => {
              // geojson点线面图层marker,image-marker、 RANK_SYMBOL:等级符号专题图(返回的是layergroup);
              let coordinates =
                (e.sourceTarget && e.sourceTarget._point && this.map.layerPointToLatLng(e.sourceTarget._point)) ||
                (e.target && e.target._latlng) ||
                e.latlng;
              feature = {
                type: 'Feature',
                properties: coordinates,
                geometry: { type: 'Point', coordinates: [coordinates.lng, coordinates.lat] }
              };
              e.sourceTarget.feature = feature;
              popupLayer = e.sourceTarget;
              this.bindPopupLayer(feature, popupLayer, e.latlng);
            });
          }
        }
      }
    },
    // 绑定popup
    bindPopupLayer(feature, popupLayer, latlng) {
      if (!feature) {
        return;
      }
      this.filterFeature(feature);
      this.$nextTick(() => {
        // 这个定时器是避免和专题图的点击事件（要清空popup）冲突
        setTimeout(() => {
          let popupDom = this.$refs.Popup;
          popupDom.style.display = 'block';
          popupLayer.bindPopup(popupDom);
          // 定时为了获取最近的一次地图点击事件的坐标mapClickPosition
          popupLayer.openPopup(latlng || this.mapClickPosition);
          // popupclose(点击地图的时候，清除最后一次的高亮)
          popupLayer.on('popupclose', () => this.viewModel.removed());
          if (!popupLayer.feature) {
            popupLayer.feature = feature;
          }
          this.viewModel.addOverlayToMap(popupLayer, feature, this.layerStyle);
          this.popupLayers.push(popupLayer);
        }, 0);
      });
    },
    // 过滤用户传入的字段
    filterFeature(feature) {
      // 重置popupProps
      this.popupProps = {};
      if (feature.properties) {
        // 过滤字段
        if (this.fields.length > 0) {
          this.fields.forEach(field => {
            if (feature.properties.hasOwnProperty(field)) {
              this.popupProps[field] = feature.properties[field];
            }
          });
        } else {
          // 默认是读取layer的全部字段
          this.popupProps = feature.properties;
        }
      }
    },
    // 根据主题改变样式
    changeStyle() {
      const wrapper = document.querySelector('.leaflet-popup-content-wrapper');
      const tip = document.querySelector('.leaflet-popup-tip');
      wrapper && (wrapper.style.background = this.getBackground);
      tip && (tip.style.background = this.getBackground);
    }
  }
};
</script>

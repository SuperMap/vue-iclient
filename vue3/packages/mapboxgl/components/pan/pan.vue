<template>
  <div
    :class="['sm-component-pan', mapboxglClass]"
    :style="[gisControlHeaderBgStyle, textColorStyle]"
  >
    <div class="sm-component-pan__item" @click="panToCenter">
      <div class="sm-component-pan__center" :style="gisControlHeaderBgStyle" />
      <i class="sm-components-icon-fullscreen" />
    </div>
    <div class="sm-component-pan__item" @click="panToLeft">
      <div class="sm-component-pan__icon is-left" />
      <i class="sm-components-icon-solid-triangle-left" />
    </div>
    <div class="sm-component-pan__item" @click="panToRight">
      <div class="sm-component-pan__icon is-right" />
      <i class="sm-components-icon-solid-triangle-right" />
    </div>
    <div class="sm-component-pan__item" @click="panToTop">
      <div class="sm-component-pan__icon is-top" />
      <i class="sm-components-icon-solid-triangle-up" />
    </div>
    <div class="sm-component-pan__item" @click="panToBottom">
      <div class="sm-component-pan__icon is-bottom" />
      <i class="sm-components-icon-solid-triangle-down" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import { ref } from 'vue';
import type { PanProps, PanEvents } from './types'
import { useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import PanViewModel from 'vue-iclient-core/controllers/mapboxgl/PanViewModel'
import { panPropsDefault } from './types'

defineOptions({
  name: 'SmPan',
  inheritAttrs: false
})

const props = withDefaults(defineProps<PanProps>(), panPropsDefault)
defineEmits<PanEvents>()

const center = ref(null);
const mapboxglClass = ref('');
const viewModel = new PanViewModel();
let lnglat;
const {
  textColorStyle,
  gisControlHeaderBgStyle
} = useTheme(props)
const { mapNotLoadedTip, getMap } = useMapGetter<Map>({
  loaded,
  viewModel
})
const { parentIsWebMapOrMap } = useMapControl()

const panTo = (lnglat) => {
  if (mapNotLoadedTip()) return;
  viewModel.panTo(lnglat);
};

const panBy = (point) => {
  if (mapNotLoadedTip()) return;
  viewModel.panBy(point);
};

const panToCenter = () => {
  lnglat = center.value;
  panTo(lnglat);
};

const panToLeft = () => {
  panBy([-props.panLength, 0]);
};

const panToRight = () => {
  panBy([props.panLength, 0]);
};

const panToTop = () => {
  panBy([0, -props.panLength]);
};

const panToBottom = () => {
  panBy([0, props.panLength]);
};

function loaded() {
  if (parentIsWebMapOrMap) {
    mapboxglClass.value = 'mapboxgl-ctrl';
  }
  center.value = getMap().getCenter();
  lnglat = center.value;
}
</script>
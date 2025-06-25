<template>
  <div class="sm-component-zoom">
    <div class="sm-component-zoom__buttons" :style="[gisControlHeaderBgStyle, textColorHeadingStyle]">
      <sm-button
        class="sm-component-zoom__button sm-component-zoom__button--zoomin"
        :disabled="!canZoomIn"
        @click="zoomIn"
      >
        <i class="sm-components-icon-plus" />
      </sm-button>
      <div class="sm-component-zoom__button--split" />
      <sm-button
        :class="['sm-component-zoom__button sm-component-zoom__button--zoomout', showZoom && 'follow-zoom-value']"
        :disabled="!canZoomOut"
        @click="zoomOut"
      >
        <i class="sm-components-icon-minus" />
      </sm-button>
      <template v-if="showZoom">
        <div class="sm-component-zoom__button--split" />
        <sm-button class="sm-component-zoom__button sm-component-zoom__button--show-zoom">
          <span>{{ Math.round(zoomPosition) }}</span>
        </sm-button>
      </template>
    </div>
    <div v-show="showZoomSlider" class="sm-component-zoom__slider">
      <sm-slider
        v-model:value="zoomPosition"
        :min="min"
        :max="max"
        :step="0.01"
        vertical
        :style="{color: colorPrimary}"
        @change="sliderChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { Map } from 'mapbox-gl'
import type { ZoomProps, ZoomEvents } from './types'
import { useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import ZoomViewModel from 'vue-iclient-core/controllers/mapboxgl/ZoomViewModel'
import { zoomPropsDefault } from './types'
import SmButton from '@supermapgis/common/components/button/Button'
import SmSlider from '@supermapgis/common/components/slider/Slider'

defineOptions({
  name: 'SmZoom',
  inheritAttrs: false
})

const props = withDefaults(defineProps<ZoomProps>(), zoomPropsDefault)
defineEmits<ZoomEvents>()

const zoomPosition = ref(0);
const min = ref(0);
const max = ref(22);
const activeZoomMode = ref('');
const canZoomIn = ref(true);
const canZoomOut = ref(true);
const viewModel = new ZoomViewModel();

const {
  gisControlHeaderBgStyle,
  textColorHeadingStyle,
  colorPrimary
} = useTheme(props)
const { mapNotLoadedTip, getMap } = useMapGetter<Map>({
  loaded,
  viewModel
})
useMapControl()


const sliderChange = () => {
  if (mapNotLoadedTip()) {
    zoomPosition.value = 0;
    return;
  }
  setZoom(zoomPosition.value);
};

const zoomIn = () => {
  if (mapNotLoadedTip()) return;
  activeZoomMode.value = 'zoomInBtn';
  if (zoomPosition.value + 1 <= max.value) {
    zoomPosition.value += 1;
  } else {
    zoomPosition.value = max.value;
  }
  viewModel.zoomIn();
};

const zoomOut = () => {
  if (mapNotLoadedTip()) return;
  activeZoomMode.value = 'zoomOutBtn';
  if (zoomPosition.value - 1 >= min.value) {
    zoomPosition.value -= 1;
  } else {
    zoomPosition.value = min.value;
  }
  viewModel.zoomOut();
};

const getMaxZoom = () => viewModel && viewModel.getMaxZoom();
const getMinZoom = () => viewModel && viewModel.getMinZoom();
const getZoom = () => viewModel && viewModel.getZoom();
const setZoom = (zoom) => viewModel && viewModel.setZoom(zoom);

const getZoomPosition = () => {
  if (canZoomOut.value || canZoomIn.value) {
    return getZoom();
  }
  if (!canZoomIn.value) {
    return getMinZoom();
  }
  if (!canZoomOut.value) {
    return getMaxZoom();
  }
};

function loaded() {
  canZoomIn.value = getMaxZoom() > getZoom();
  canZoomOut.value = getMinZoom() < getZoom();

  getMap().on('zoomend', () => {
    activeZoomMode.value = '';
    canZoomIn.value = getMaxZoom() > getZoom();
    canZoomOut.value = getMinZoom() < getZoom();
    zoomPosition.value = getZoomPosition();
  });

  min.value = getMinZoom();
  max.value = getMaxZoom();
  zoomPosition.value = getZoomPosition();

  viewModel.wheelEventOn(() => {
    zoomPosition.value = getZoomPosition();
  });
}
</script>
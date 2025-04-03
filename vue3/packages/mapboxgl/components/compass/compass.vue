<template>
  <div class="sm-component-compass">
    <sm-button :style="[gisControlHeaderBgStyle, textColorStyle]" class="sm-component-compass__content" @click="reset">
      <i :class="iconClass" :style="needleStyle"></i>
    </sm-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { Map } from 'mapbox-gl'
import type {
  CompassProps,
  needleStyleParams
} from './types'
import { compassPropsDefault } from './types'
import CompassViewModel from 'vue-iclient-core/controllers/mapboxgl/CompassViewModel';
import { useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmButton from '@supermapgis/common/components/button/Button'

const props = withDefaults(defineProps<CompassProps>(), compassPropsDefault)
const { textColorStyle, gisControlHeaderBgStyle} = useTheme(props)

const needleStyle = ref<needleStyleParams>({ transform: '' });
const viewModel = new CompassViewModel({ visualizePitch: props.visualizePitch })
useMapGetter<Map>({ loaded, viewModel })
useMapControl()

// 方法
function reset() {
  return viewModel && (props.visualizePitch 
    ? viewModel.resetNorthPitch() 
    : viewModel.resetNorth());
};

function initAngle() {
  return viewModel?.initAngle() || { angle: 0, pitch: 0 };
};

function createTransform(angle: number, pitch: number) {
  needleStyle.value.transform = props.visualizePitch
    ? `scale(${1 / Math.pow(Math.cos(pitch * (Math.PI / 180)), 0.5)}) rotateX(${pitch}deg) rotateZ(${angle * (180 / Math.PI)}deg)`
    : `rotate(${angle * (180 / Math.PI)}deg)`;
};

function loaded() {
  createTransform(initAngle().angle, initAngle().pitch);
  viewModel.rotateEventOn((angle, pitch) => {
    createTransform(angle, pitch);
  });
}
</script>
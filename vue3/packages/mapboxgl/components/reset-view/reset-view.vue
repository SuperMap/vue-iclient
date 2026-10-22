<template>
  <div class="sm-component-reset-view">
    <div class="sm-component-reset-view__reset-holder" :style="[gisControlHeaderBgStyle, textColorHeadingStyle]">
      <sm-button class="reset-button" :title="t('resetView.title')" @click="resetMapView">
        <i class="sm-components-icon-morenxianshi" aria-hidden="true" />
      </sm-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { ResetViewProps, ResetViewEvents } from './types'
import { resetViewPropsDefault } from './types'
import { useLocale, useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import ResetViewModel from 'vue-iclient-controllers-mapboxgl/src/ResetViewModel'
import SmButton from '@supermapgis/common/components/button/Button'

defineOptions({
  name: 'SmResetView'
})

const props = withDefaults(defineProps<ResetViewProps>(), resetViewPropsDefault)
defineEmits<ResetViewEvents>()

const viewModel = new ResetViewModel()
const { t } = useLocale()
const { gisControlHeaderBgStyle, textColorHeadingStyle } = useTheme(props)
const { mapNotLoadedTip } = useMapGetter<Map>({ viewModel })
useMapControl()

function resetMapView() {
  if (mapNotLoadedTip()) {
    return
  }
  viewModel.resetView(props.duration)
}
</script>

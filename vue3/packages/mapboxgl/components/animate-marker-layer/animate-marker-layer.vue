<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { AnimateMarkerLayerProps, AnimateMarkerLayerEvents } from './types' 
import { useMapGetter, useVmProps } from '@supermapgis/common/hooks/index.common';
import { useMapLayer, createDefaultLayerId } from '@supermapgis/mapboxgl/hooks'
import AnimateMarkerLayerViewModel from 'vue-iclient-core/controllers/mapboxgl/AnimateMarkerLayerViewModel';
import { animateMarkerLayerPropsDefault } from './types' 

const componentName = 'SmAnimateMarkerLayer'

defineOptions({
  name: componentName,
  inheritAttrs: false
})

const props = withDefaults(defineProps<AnimateMarkerLayerProps>(), animateMarkerLayerPropsDefault)
const emit = defineEmits</* @vue-ignore */AnimateMarkerLayerEvents>()

const viewModelProps =  ['features', 'type', 'width', 'height', 'textColor', 'textFontSize', 'colors', 'textField']
const viewModel = new AnimateMarkerLayerViewModel({ ...props, layerId: props.layerId ?? createDefaultLayerId(componentName) });
const { setViewModel } = useVmProps(props, viewModelProps)
const { loaded, removed } = useMapLayer({ props, emit, viewModel })
useMapGetter<Map>({ loaded, removed, viewModel })
setViewModel(viewModel)
</script>
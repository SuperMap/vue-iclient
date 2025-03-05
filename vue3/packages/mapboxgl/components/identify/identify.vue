<template>
  <SmLayerHighlight
    uniqueName="identify-popup"
    :layers="layers"
    :highlightStyle="layerStyle"
    :displayFieldsMap="displayFieldsMap"
    :multiSelection="multiSelect"
    :clickTolerance="clickTolerance"
    :eventsCursor="eventsCursor"
    :popupStyle="popupStyle"
    :background="background"
    :textColor="textColor"
    :mapTarget="mapTarget"
    :showPopup="showPopup"
    :title="title"
    @mapselectionchanged="handleMapSelectionChanged"
  />
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { IdentifyProps, IdentifyEvents, FieldInfo, MapSelectionChangedEmit } from './types'
import { computed } from 'vue';
import { useMapGetter } from '@supermapgis/common/hooks/index.common'
import SmLayerHighlight from '@supermapgis/mapboxgl/components/layer-highlight/layer-highlight.vue'
import { identifyPropsDefault } from './types'

defineOptions({
  name: 'SmIdentify',
  inheritAttrs: false
})

const props = withDefaults(defineProps<IdentifyProps>(), identifyPropsDefault)

const emit = defineEmits<IdentifyEvents>()

const eventsCursor = { mousemove: 'mousemove', mouseleave: 'grab' };

useMapGetter<Map>()

const popupStyle = computed(() => {
  return {
    keyWidth: props.keyWidth,
    valueWidth: props.valueWidth,
    keyMaxWidth: props.keyMaxWidth,
    valueMaxWidth: props.valueMaxWidth,
    keyWordStyle: props.keyWordStyle,
    valueWordStyle: props.valueWordStyle,
    autoResize: props.autoResize
  };
});

const displayFieldsMap = computed(() => {
  if (props.layers) {
    return props.layers.reduce((list, layerId, index) => {
      let fields: any;
      if (Array.isArray(props.fields)) {
        // 如果是二维数组
        fields = props.fields[index];
        // 兼容一维数组
        if (typeof fields === 'string') {
          fields = props.fields;
        }
      } else if (typeof props.fields === 'object' && index === 0) {
        fields = [props.fields];
      }
      const fieldsFormatter = fields && fields.map((field: any) => {
        const isObjArr = typeof field === 'object';
        return isObjArr ? field : {
          field: field,
          title: field
        };
      });
      list[layerId] = fieldsFormatter;
      return list;
    }, {} as Record<string, FieldInfo[]>);
  }
  return {};
});

function handleMapSelectionChanged(e: MapSelectionChangedEmit) {
  emit('datachange', { ...e, fields: displayFieldsMap.value[e.targetId] });
}
</script>
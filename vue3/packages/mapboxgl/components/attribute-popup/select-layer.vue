<template>
  <Card
    v-show="isShow"
    :title="t('popup.selectLayer')"
    class="sm-component-popup__select-layer"
  >
    <template #extra><i class="sm-components-icon-close" @click="handleClose()"></i></template>
    <template v-for="item in layerInfos" :key="item.id">
      <div class="sm-component-popup__select-layer-item">
        <i :class="['sm-component-layer-type', getTypeIcon(item.type)]" />
        <div class="sm-component-layer-name ellipsis">{{ item.name }}</div>
        <i class="sm-components-icon-arrow-right" @click="handleSelect(item.id)" />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref, watch } from 'vue'
import { Card } from 'ant-design-vue'
import { useLocale } from '@supermapgis/common/hooks/index.common'

const { t } = useLocale()

interface LayerInfo {
  id: string
  name: string
  type:
    | 'symbol'
    | 'fill'
    | 'line'
    | 'raster'
    | 'circle'
    | 'fill-extrusion'
    | 'heatmap'
    | 'hillshade'
  [key: string]: any
}

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  layerInfos: {
    type: Array as PropType<LayerInfo[]>,
    default: () => []
  }
})
const emit = defineEmits(['close', 'select'])
const isShow = ref(props.show)

watch(
  () => props.show,
  newVal => {
    isShow.value = newVal
  }
)

const getTypeIcon = (type: LayerInfo['type']) => {
  switch (type) {
    case 'symbol':
    case 'circle':
      return 'sm-components-icon-multi-point'
    case 'fill':
    case 'fill-extrusion':
      return 'sm-components-icon-ploygon'
    case 'line':
      return 'sm-components-icon-line'
  }
}
const handleClose = () => {
  emit('close')
}
const handleSelect = (id: string) => {
  emit('select', id)
}
</script>

<style scoped></style>

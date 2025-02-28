<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName || t('layerList.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :split-line="splitLine"
    :background="background"
    :textColor="textColor"
    ref="root-el"
    class="sm-component-layer-list"
  >
    <sm-card
      class="sm-component-layer-list__a-card"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-layer-list__content">
        <layer-group
          :currentOpacity="currentOpacity"
          :layerCatalog="sourceList"
          :attributes="attributes"
          :operations="operations"
          :dropHandler="onDropHanlder"
          @getLayerOpacityById="getLayerOpacityById"
          @changeOpacity="changeOpacity"
          @zoomToBounds="zoomToBounds"
          @toggleItemVisibility="toggleItemVisibility"
          @toggleAttributesVisibility="(e, item) => toggleAttributesVisibility(e, item)"
        ></layer-group>
      </div>
    </sm-card>
    <sm-attributes
      v-show="displayAttributes"
      ref="attributes-el"
      :mapTarget="getTargetName()"
      :style="attributesStyle"
      v-bind="attributesProps"
    ></sm-attributes>
  </sm-collapse-card>
</template>

<script lang="ts" setup>
import type { Map } from 'mapbox-gl'
import type {
  LayerListProps,
  LayerListEmits,
  TreeNodeDropEvent,
  AttributesParams,
  LayerListItem
} from './types'
import {
  ref,
  computed,
  watch,
  onBeforeUnmount,
  nextTick,
  useTemplateRef,
  onBeforeMount,
  watchEffect
} from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmAttributes from '@supermapgis/mapboxgl/components/attributes/attributes.vue'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmCard from '@supermapgis/common/components/card/Card'
import LayerListViewModel from 'vue-iclient-core/controllers/mapboxgl/LayerListViewModel'
import LayerGroup from './layer-group.vue'
import { isEqual } from 'lodash-es'
import omit from 'omit.js'
import mapEvent from 'vue-iclient-core/types/map-event'
import { layerListPropsDefault } from './types'

defineOptions({
  name: 'SmLayerList'
})

const ATTRIBUTES_NEEDED_PROPS = [
  'title',
  'iconClass',
  'associateWithMap',
  'statistics',
  'toolbar',
  'table',
  'fieldConfig',
  'pagination',
  'customHeaderRow',
  'customRow'
]

const props = withDefaults(defineProps<LayerListProps>(), layerListPropsDefault)

defineEmits(['loaded']) as unknown as LayerListEmits

let viewModel: InstanceType<typeof LayerListViewModel>
const { getTargetName, setViewModel } = useMapGetter<Map>({ loaded, removed })
const { isShow, parentIsWebMapOrMap } = useMapControl()
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const sourceList = ref([])
const attributesProps = ref<AttributesParams>({})
const displayAttributes = ref(false)
const currentOpacity = ref(0)
const attributesEl = useTemplateRef<HTMLElement>('attributes-el')
const rootEl = useTemplateRef<HTMLElement>('root-el')

// Computed
const attributesStyle = computed(() => {
  const style = { height: '300px', 'pointer-events': 'auto', ...props.attributes.style }
  const position = props.attributes.position ? props.attributes.position.split('-') : ['bottom']
  let attributesStyle = ''
  if (position.length === 2) {
    attributesStyle = `position: absolute; ${position[0]}: 0;${position[1]}: 0;`
  } else if (['top', 'bottom'].includes(position[0])) {
    const margin = style.width ? (100 - parseInt(style.width)) / 2 : 0
    attributesStyle = `position: absolute; ${position[0]}: 0; left: ${margin}%;`
  } else if (['left', 'right'].includes(position[0])) {
    const margin = style.height ? (100 - parseInt(style.height)) / 2 : 0
    attributesStyle = `position: absolute; ${position[0]}: 0; top: ${margin}%;`
  }
  for (const key in style) {
    attributesStyle += `${key}: ${style[key]};`
  }
  return attributesStyle
})

const attributesContainer = computed(() => {
  return props.attributes?.getContainer?.() || document.getElementById(getTargetName())
})

const attributesIconClass = computed(() => {
  return props.attributes?.iconClass || 'sm-components-icon-attribute-table'
})

watch(
  () => props.attributes,
  (newVal: LayerListProps['attributes'], oldVal: LayerListProps['attributes']) => {
    if (displayAttributes.value) {
      if (!newVal.enabled) {
        removeAttributes()
        return
      }
      if (!isEqual(newVal.getContainer, oldVal.getContainer)) {
        removeAttributes()
        const container = newVal?.getContainer() || document.getElementById(getTargetName())
        container.appendChild(attributesEl.value)
        displayAttributes.value = !displayAttributes.value
      }
      const newProps = { ...newVal }
      for (const key in newProps) {
        if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
          delete newProps[key]
        }
      }
      attributesProps.value = {
        ...attributesProps.value,
        ...newProps
      }
    }
  },
  { deep: true }
)

watchEffect(() => {
  if (!parentIsWebMapOrMap && rootEl.value?.classList && !rootEl.value.classList.contains('layer-list-container')) {
    rootEl.value.classList.add('layer-list-container')
  }
})

onBeforeMount(() => {
  viewModel = new LayerListViewModel()
  setViewModel(viewModel)
})

onBeforeUnmount(() => {
  if (viewModel) {
    viewModel.off('layersUpdated', layerUpdate)
  }
})

function loaded() {
  layerUpdate()
  viewModel.on('layersUpdated', layerUpdate)
}

function removed() {
  removeAttributes()
  sourceList.value = []
}

function toggleItemVisibility(item: { id: string; [prop: string]: any }, visible: boolean) {
  viewModel?.changeItemVisible(item.id, visible)
}

function zoomToBounds(item: { id: string; [prop: string]: any }) {
  viewModel?.zoomToBounds(item.id)
}

function changeOpacity(id: string, opacity: number) {
  viewModel.changeOpacity(id, opacity)
}

function getLayerOpacityById(id: string) {
  currentOpacity.value = viewModel.getLayerOpacityById(id)
}

function toggleAttributesVisibility(e: MouseEvent & { target: Element }, item) {
  if (e.target.className.indexOf('sm-components-icon-attribute-open') !== -1) {
    e.target.setAttribute('class', attributesIconClass.value)
    displayAttributes.value = !displayAttributes.value
    return
  }
  closeAttributesIconClass()
  removeAttributes()
  handleAttributesProps(item)
  e.target.setAttribute('class', `${attributesIconClass.value} sm-components-icon-attribute-open`)
  attributesContainer.value.appendChild(attributesEl.value)
  displayAttributes.value = !displayAttributes.value
}

async function handleAttributesProps(item: Record<string, any>) {
  const propsClone = Object.assign({}, props.attributes)
  for (const key in propsClone) {
    if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
      delete propsClone[key]
    }
  }
  const dataset = await viewModel.getLayerDatas(item)
  attributesProps.value = { dataset: Object.freeze(dataset), title: item.title, ...propsClone }
}

function layerUpdate() {
  nextTick(() => {
    sourceList.value = viewModel && transformLayerList(viewModel.initLayerList() as LayerListItem[])
    if (
      attributesProps.value.layerName &&
      sourceList.value[attributesProps.value.layerName].visibility === 'none'
    ) {
      closeAttributesIconClass()
      removeAttributes()
    }
  })
}

function transformLayerList(layerCatalog: LayerListItem[]) {
  const layerList: LayerListItem[] = []
  layerCatalog.forEach(layer => {
    const nextLayer = omit(layer, ['CLASS_INSTANCE'])
    if (nextLayer.type === 'group') {
      nextLayer.children = transformLayerList(layer.children)
    }
    layerList.push(nextLayer)
  })
  return layerList
}

function getCatalogTypeById(layerCatalog: any[], id: string) {
  for (let layer of layerCatalog) {
    if (layer.id === id) {
      return layer.type
    } else if (layer.type === 'group') {
      const foundType = getCatalogTypeById(layer.children, id)
      if (foundType) {
        return foundType
      }
    }
  }
}

function onDrop(info: TreeNodeDropEvent, data: any[]) {
  const dropKey = info.node.eventKey
  const dragKey = info.dragNode.eventKey
  const dropPos = info.node.pos.split('-')
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])
  if (!info.dropToGap && getCatalogTypeById(data, dropKey) !== 'group') {
    return null
  }
  const loop = (
    data: any[],
    id: string,
    callback: (item: any, index: number, arr: any[]) => any
  ) => {
    data.forEach((item, index, arr) => {
      if (item.id === id) {
        return callback(item, index, arr)
      }
      if (item.children) {
        return loop(item.children, id, callback)
      }
    })
  }

  // Find dragObject
  let dragObj: any
  loop(data, dragKey, (item, index, arr) => {
    arr.splice(index, 1)
    dragObj = item
  })
  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, item => {
      item.children = item.children || []
      // where to insert 示例添加到尾部，可以是随意位置
      item.children.push(dragObj)
    })
  } else if (
    (info.node.children || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, item => {
      item.children = item.children || []
      // where to insert 示例添加到尾部，可以是随意位置
      item.children.unshift(dragObj)
    })
  } else {
    let ar: any[]
    let i: number
    loop(data, dropKey, (item, index, arr) => {
      ar = arr
      i = index
    })
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj)
    } else {
      ar.splice(i + 1, 0, dragObj)
    }
  }
  return data
}

function onDropHanlder(info: TreeNodeDropEvent) {
  const originLayerCatalog = viewModel.initLayerList()
  const layerCatalog = onDrop(info, originLayerCatalog)
  if (!layerCatalog) {
    return
  }
  sourceList.value = onDrop(info, sourceList.value)
  mapEvent.setLayerCatalog(getTargetName(), layerCatalog)
  viewModel.setLayersOrder()
}

function closeAttributesIconClass() {
  const attributesIcon = document.querySelectorAll('.sm-component-layer-list__attributes')
  attributesIcon.forEach(element => {
    element.children[0].setAttribute('class', attributesIconClass.value)
  })
}

function removeAttributes() {
  if (attributesEl.value && displayAttributes.value) {
    const attributesParentDom = attributesEl.value.parentElement
    displayAttributes.value = !displayAttributes.value
    attributesParentDom.removeChild(attributesEl.value)
  }
}
</script>

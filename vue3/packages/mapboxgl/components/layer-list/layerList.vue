<template>
<div ref="el" class="sm-component-layer-list" style="position: relative;">
  <a-card class="sm-component-layer-list__a-card" :bordered="false" style="">
    <div class="sm-component-layer-list__content">
      <layer-group :currentOpacity="currentOpacity" :layerCatalog="sourceList" :attributes="attributes"
        :operations="operations" :dropHandler="onDropHanlder" @getLayerOpacityById="getLayerOpacityById"
        @changeOpacity="changeOpacity" @zoomToBounds="zoomToBounds" @toggleItemVisibility="toggleItemVisibility"
        @toggleAttributesVisibility="(e, item) => toggleAttributesVisibility(e, item)">
      </layer-group>
    </div>
  </a-card>
</div>

</template>

<script lang="ts" setup>
// import Theme from 'vue-iclient/src/common/_mixin/Theme';
// import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
// import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import { ref, reactive, toRef, computed, defineProps, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useMapGetter } from '@supermapgis/common/utils/hooks/useMapGetter';
import { Card as ACard } from 'ant-design-vue';
import SmAttributes, {
  PaginationParams,
  FieldConfigParams,
  AssociateWithMapParams,
  StatisticsParams,
  TableParams,
  ToolbarParams
} from '@supermapgis/vue-iclient-mapboxgl/attributes/attributes.vue';
import LayerListViewModel from 'vue-iclient-core/controllers/mapboxgl/LayerListViewModel';
import LayerGroup from './layerGroup.vue';
import isEqual from 'lodash.isequal';
import omit from 'omit.js';
import mapEvent from 'vue-iclient-core/types/map-event';

interface AttributesParams {
  enabled: boolean;
  getContainer: Function;
  style: Object;
  position: string; // top-right top-left bottom-right bottom-left top bottom left right
  title: string;
  iconClass: string;
  associateWithMap: AssociateWithMapParams;
  statistics: StatisticsParams;
  toolbar: ToolbarParams;
  table: TableParams;
  fieldConfig: FieldConfigParams;
  pagination: PaginationParams;
  customHeaderRow: Function;
  customRow: Function;
}

interface LayerListItem {
  id: string;
  title: string;
  type: string;
  visible: boolean;
  renderSource: Object;
  renderLayers: string[];
  dataSource: Object;
  themeSetting: Object;
  children?: LayerListItem[];
  CLASS_NAME?: string;
  CLASS_INSTANCE?: Object;
}

interface TreeNodeDropEvent {
  node: {
    eventKey: string;
    pos: string;
    children: LayerListItem[];
    expanded: boolean;
  };
  dragNode: {
    eventKey: string;
  };
  dropPosition: number;
  dropToGap: boolean;
}

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
];

const props = defineProps({
  iconClass: {
    type: String,
    default: 'sm-components-icon-layer-list'
  },
  headerName: {
    type: String,
    default: () => 'layerList.title'
  },
  attributes: {
    type: Object,
    default: () => ({})
  },
  operations: {
    type: Object,
    default: () => ({
      fitBounds: true,
      draggable: false,
      opacity: false
    })
  },
  mapTarget: String
})

const sourceList = ref([])
const layerList = ref([])
const attributesProps = reactive({})
const displayAttributes = ref(false)
const currentOpacity = ref(0)
const layerUpdateFn = ref(null)
const attributes = ref()
const el = ref()
let viewModel: InstanceType<typeof LayerListViewModel>
viewModel = new LayerListViewModel()
// const { getTargetName } = useMapGetter()

onMounted(() => {
  // if (!parentIsWebMapOrMap.value) {
  //   el.value.$el.classList.add('layer-list-container')
  // }
  layerUpdate()
  layerUpdateFn.value = layerUpdate
  viewModel.on('layersUpdated', layerUpdateFn.value)
})

onBeforeUnmount(() => {
  if (viewModel) {
    viewModel.off('layersUpdated', layerUpdateFn.value)
  }
  removeAttributes()
  sourceList.value = []
})

watch(() => props.attributes, (newval, oldval) => {
  if (displayAttributes.value) {
    if (!newval.enabled) {
      removeAttributes()
      return
    }
    if (!isEqual(newval.getContainer, oldval.getContainer)) {
      removeAttributes()
      const container = newval.getContainer ? newval.getContainer() : document.getElementById(getTargetName())
      container.appendChild(attributes.value)
      displayAttributes.value = !displayAttributes.value
    }
    const oldProps = attributesProps
    const newProps = { ...newval }
    for (const key in newProps) {
      if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
        delete newProps[key]
      }
    }
    Object.assign(attributesProps, newProps)
  }
}, { deep: true })

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

function toggleItemVisibility(item: { id: string, [prop: string]: any; }, visible: boolean) {
  viewModel && viewModel.changeItemVisible(item.id, visible);
}

function zoomToBounds(item: { id: string, [prop: string]: any; }) {
  viewModel && viewModel.zoomToBounds(item.id);
}

function addNewLayer() {
  viewModel.addNewLayer();
}

function deleteLayer() {
  viewModel.deleteLayer();
}

function changeOpacity(id, opacity) {
  viewModel.changeOpacity(id, opacity);
}

function getLayerOpacityById(id) {
  currentOpacity.value = viewModel.getLayerOpacityById(id);
}

function toggleAttributesVisibility(e, item) {
  if (e.target.className.indexOf('sm-components-icon-attribute-open') !== -1) {
    e.target.setAttribute('class', attributesIconClass.value)
    displayAttributes.value = !displayAttributes.value
    return
  }
  closeAttributesIconClass()
  removeAttributes()
  handleAttributesProps(item)
  e.target.setAttribute('class', `${attributesIconClass.value} sm-components-icon-attribute-open`)
  attributesContainer.value.appendChild(attributes.value)
  displayAttributes.value = !displayAttributes.value
}

async function handleAttributesProps(item) {
  const propsClone = Object.assign({}, props.attributes);
  for (const key in propsClone) {
    if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
      delete propsClone[key];
    }
  }
  const dataset = await viewModel.getLayerDatas(item);
  Object.assign(attributesProps, { dataset: Object.freeze(dataset), title: item.title, ...propsClone })
}

function layerUpdate() {
  nextTick(() => {
    sourceList.value = transformLayerList(viewModel.initLayerList())
    if (attributesProps.layerName && sourceList.value[attributesProps.layerName].visibility === 'none') {
      closeAttributesIconClass()
      removeAttributes()
    }
  })
}

function transformLayerList(layerCatalog: LayerListItem[]) {
  const layerList: LayerListItem[] = [];
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
      return layer.type;
    } else if (layer.type === 'group') {
      const foundType = getCatalogTypeById(layer.children, id);
      if (foundType) {
        return foundType;
      }
    }
  }
}

function onDrop(info: TreeNodeDropEvent, data: any[]) {
  const dropKey = info.node.eventKey;
  const dragKey = info.dragNode.eventKey;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  if (!info.dropToGap && getCatalogTypeById(data, dropKey) !== 'group') {
    return null;
  }
  const loop = (data: any[], id: string, callback: (item: any, index: number, arr: any[]) => any) => {
    data.forEach((item, index, arr) => {
      if (item.id === id) {
        return callback(item, index, arr);
      }
      if (item.children) {
        return loop(item.children, id, callback);
      }
    });
  };

  // Find dragObject
  let dragObj: any;
  loop(data, dragKey, (item, index, arr) => {
    arr.splice(index, 1);
    dragObj = item;
  });
  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, item => {
      item.children = item.children || [];
      // where to insert 示例添加到尾部，可以是随意位置
      item.children.push(dragObj);
    });
  } else if (
    (info.node.children || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, item => {
      item.children = item.children || [];
      // where to insert 示例添加到尾部，可以是随意位置
      item.children.unshift(dragObj);
    });
  } else {
    let ar: any[];
    let i: number;
    loop(data, dropKey, (item, index, arr) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }
  return data;
}

function onDropHanlder(info: TreeNodeDropEvent) {
  const originLayerCatalog = viewModel.initLayerList();
  const layerCatalog = onDrop(info, originLayerCatalog);
  if (!layerCatalog) {
    return;
  }
  sourceList.value = this.onDrop(info, sourceList.value);
  mapEvent.setLayerCatalog(getTargetName(), layerCatalog);
  viewModel.setLayersOrder();
}

function closeAttributesIconClass() {
  const attributesIcon = document.querySelectorAll('.sm-component-layer-list__attributes');
  attributesIcon.forEach(element => {
    element.children[0].setAttribute('class', attributesIconClass.value);
  });
}

function removeAttributes() {
  if (attributes.value && displayAttributes.value) {
    const attributesParentDom = attributes.value.parentElement;
    displayAttributes.value = !displayAttributes.value
    attributesParentDom.removeChild(attributes.value);
  }
}
</script>

<template>
  <div>
    <a-tree :class="['sm-component-layer-list__collapse', operations.draggable && 'draggable-tree']" blockNode
      :draggable="operations.draggable" :tree-data="treeData" @drop="dropHandler">
      <template #switcherIcon><i class="sm-components-icon-right" /></template>
      <template #title="item">
        <div :class="{
          'header-wrap': true,
          'sm-component-layer-list__disabled': !item.visible
        }">
          <div class="header-text" @mouseenter="() => changeIconsStatus(item.id)"
            @mouseleave="() => changeIconsStatus('')">
            <span class="add-ellipsis">{{ item.title }}</span>
            <div :class="['icon-buttons', showIconsItem === item.id ? 'icon-buttons-visible' : 'icon-buttons-hidden']">
              <div v-if="operations.fitBounds" class="sm-component-layer-list__zoom">
                <i
                  :class="['sm-components-icon-suofangzhituceng', (item.visible || !item.disabled) && 'highlight-icon']"
                  :style="!item.visible && { cursor: 'not-allowed' }" :title="t('layerList.zoomToLayer')"
                  @click.stop="item.visible && zoomToBounds(item)" />
              </div>
              <div v-if="(item && item.type) !== 'group' && attributesEnabled(item)"
                class="sm-component-layer-list__attributes">
                <i :class="attributesIconClass" :style="!item.visible && { cursor: 'not-allowed' }"
                  :title="t('layerList.attributes')" @click.stop="item.visible && toggleAttributesVisibility($event, item)" />
              </div>
              <div v-if="operations.opacity && (item && item.type) !== 'group'" class="sm-component-layer-list__style">
                <i :class="[
                  'sm-components-icon-tucengyangshi01',
                  'sm-components-icon-not-active',
                  showOpacityItem === item.id && 'sm-components-icon-active'
                ]" :style="!item.visible && { cursor: 'not-allowed' }" :title="t('layerList.layerStyle')"
                  @click.stop="item.visible && changeItemOpacity(item)" />
              </div>
              <div>
                <i
                  :class="item.visible ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'"
                  @click.stop="toggleItemVisibility(item)"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-show="operations.opacity && item.id === showOpacityItem" class="opacity-style">
          <div>{{ t('layerList.opacity') }}</div>
          <a-slider :value="formatOpacity" :min="0" :max="100" :step="1" :style="{ width: '70%' }"
            @change="changeOpacity" />
          <div>{{ formatOpacity + '%' }}</div>
        </div>
      </template>
    </a-tree>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Tree as ATree, Slider as ASlider } from 'ant-design-vue';
import { useLocale } from '@supermapgis/common/hooks';

const { t } = useLocale()
const props = defineProps({
  currentOpacity: {
    type: Number,
    default: 0
  },
  layerCatalog: {
    type: Array as () => any[],
    default: () => []
  },
  operations: {
    type: Object as () => { fitBounds: boolean; draggable: boolean; opacity: boolean },
    default: () => ({
      fitBounds: true,
      draggable: false,
      opacity: false
    })
  },
  attributes: {
    type: Object as () => Record<string, any>,
    default: () => ({})
  },
  dropHandler: Function
});

const emit = defineEmits([
  'changeOpacity',
  'toggleItemVisibility',
  'toggleAttributesVisibility',
  'getLayerOpacityById',
  'zoomToBounds'
]);
const treeData = ref<any[]>([]);
const showIconsItem = ref('');
const showOpacityItem = ref('');

const formatOpacity = computed(() => +(props.currentOpacity * 100).toFixed(0));
const attributesIconClass = computed(() => (props.attributes && props.attributes.iconClass) || 'sm-components-icon-attribute-table');
const attributesEnabled = computed(() => {
  return (item: any) => {
    const isGeojson = item.renderSource && item.renderSource.type === 'geojson';
    const isStructureData = item.dataSource && item.dataSource.type === 'STRUCTURE_DATA';
    return props.attributes.enabled && (isGeojson || isStructureData) && (item && item.type) !== 'group';
  };
});

function getTreeData(data: any[]) {
  const treeData: any[] = [];
  data.map((item) => {
    const dataItem = { ...item, key: item.id };
    if (dataItem.children) {
      const children = getTreeData(dataItem.children);
      dataItem.children = children;
    } else if (item.layerOrder !== 'auto') {
      dataItem.disabled = true;
    }
    treeData.push(dataItem);
  });
  return treeData;
};

function changeOpacity(val: number) {
  if (showOpacityItem.value) {
    const newVal = val / 100;
    emit('changeOpacity', showOpacityItem.value, newVal);
    emit('getLayerOpacityById', showOpacityItem.value);
  }
};

function toggleItemVisibility(item: any) {
  emit('toggleItemVisibility', item, !item.visible);
};

function toggleAttributesVisibility(e: Event, item: any) {
  emit('toggleAttributesVisibility', e, item);
};

function changeItemOpacity(item: any) {
  if (showOpacityItem.value === item.id) {
    showOpacityItem.value = '';
  } else {
    showOpacityItem.value = item.id;
    emit('getLayerOpacityById', showOpacityItem.value);
  }
};

function changeIconsStatus(val: string) {
  showIconsItem.value = val;
};

function zoomToBounds(item: any) {
  emit('zoomToBounds', item);
};

watch(
  () => props.layerCatalog,
  (newVal) => {
    treeData.value = getTreeData(newVal);
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

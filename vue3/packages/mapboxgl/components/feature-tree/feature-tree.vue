<template>
  <div class="sm-component-feature-tree">
    <InputSearch class="searchHolder" @search="onSearch" />
    <sm-tree
      class="treeHolder"
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      :treeData="treeDatas"
      @expand="onExpand"
      @select="onSelect"
    >
      <template #title="{ title }">
        <span v-if="title?.includes(searchValue)">
          {{ title.substring(0, title.indexOf(searchValue)) }}
          <span :style="searchHighlightStyle">{{ searchValue }}</span>
          {{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ title }}</span>
      </template>
    </sm-tree>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import SmTree from '@supermapgis/common/components/tree/Tree'
import type { FeatureTreeProps, FeatureTreeEvents } from './types'
import { featureTreePropsDefault } from './types'
import { InputSearch } from 'ant-design-vue'
import { useRequest } from '@supermapgis/mapboxgl/hooks'
import type { TreeData } from '@supermapgis/mapboxgl/hooks'
import omit from 'omit.js'

const props = withDefaults(defineProps<FeatureTreeProps>(), featureTreePropsDefault)
const emit = defineEmits<FeatureTreeEvents>()

const { datas, options, requestDataByFilter } = useRequest({ props, type: 'tree' })

const searchValue = ref('')
const expandedKeys = ref<string[]>([])
const autoExpandParent = ref(true)

const treeDatas = computed(() => {
  return options.value.length ? options.value : props.treeData || []
})
const dataList = computed(() => {
  return generateList(treeDatas.value);
})

const searchHighlightStyle = computed(() => {
  return { color: props.highlightColor }
})

const generateList = (data: Array<any>) => {
  const result = [];
  for (const node of data) {
    result.push(omit(node, ['children']));
    if (node.children) {
      result.push(...generateList(node.children));
    }
  }
  return result;
};


watch(searchValue, value => {
  if (!value) {
    expandedKeys.value = []
    return
  }
  const expanded = dataList.value
    .map(item => {
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, treeDatas.value)
      }
      return null
    })
    .filter((item, i, self) => item && self.indexOf(item) === i) as string[]
  expandedKeys.value = expanded
  searchValue.value = value
  autoExpandParent.value = true
})

function getParentKey(
  key: string | number,
  tree: TreeData[] = []
): string | number | undefined {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

function onExpand(keys: string[]) {
  expandedKeys.value = keys
  autoExpandParent.value = false
}

function onSearch(value: string) {
  searchValue.value = value
}

const onSelect = async (value: string[] | number[]) => {
  const feature = await requestDataByFilter(value);
  const lastSelectKey = value[value.length - 1];
  const selectedItem = dataList.value.find(item => item.key === lastSelectKey);
  const dataset = value && datas.value.find(item => item.value === lastSelectKey)?.dataset;
  emit('select', { value: selectedItem, feature, dataset });
}
</script>

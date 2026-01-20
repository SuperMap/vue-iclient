<template>
  <div class="sm-component-feature-tree">
    <InputSearch class="searchHolder" @search="onSearch" />
    <sm-tree
      class="treeHolder"
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      :treeData="options"
      @expand="onExpand"
      @select="onSelect"
    >
      <template #title="{ title }">
        <span v-if="title.includes(searchValue)">
          {{ title.substring(0, title.indexOf(searchValue)) }}
          <span style="color: #f50">{{ searchValue }}</span>
          {{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ title }}</span>
      </template>
    </sm-tree>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import SmTree from '@supermapgis/common/components/tree/Tree'
import type { FeatureTreeProps, FeatureTreeEvents } from './types'
import { featureTreePropsDefault } from './types'
import { InputSearch } from 'ant-design-vue'
import { useRequest } from '@supermapgis/mapboxgl/hooks'
import type { TreeData } from '@supermapgis/mapboxgl/hooks'

const props = withDefaults(defineProps<FeatureTreeProps>(), featureTreePropsDefault)
const emit = defineEmits<FeatureTreeEvents>()

const { options, datas } = useRequest({ props, type: 'tree' })

const searchValue = ref('')
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const autoExpandParent = ref(true)

watch(searchValue, value => {
  if (!value) {
    expandedKeys.value = []
    return
  }
  const expanded = datas.value
    .map(item => {
      if (item.label.indexOf(value) > -1) {
        return getParentKey(item.value, options.value)
      }
      return null
    })
    .filter((item, i, self) => item && self.indexOf(item) === i) as string[]
  expandedKeys.value = expanded
  searchValue.value = value
  autoExpandParent.value = true
})

watch(selectedKeys, () => {
  handleClick(selectedKeys.value)
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

function onSelect(keys: string[]) {
  selectedKeys.value = keys
}

const handleClick = (value: string[]) => {
  emit('click', value)
}
</script>

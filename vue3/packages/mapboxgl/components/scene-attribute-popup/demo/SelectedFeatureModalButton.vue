<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button, Modal } from 'ant-design-vue'

defineOptions({
  name: 'SelectedFeatureModalButton'
})

const props = defineProps<{
  /** 当前翻页要素属性（平台注入，兼容字段名为 data） */
  data?: Record<string, any>
  /** 当前图层本次点选的全部要素 */
  features?: Record<string, any>[]
  index?: number
  layer?: { id: string; title?: string }
  event?: Record<string, any>
  context?: Record<string, any>
}>()

const visible = ref(false)

const selectedFeatures = computed(() => {
  if (props.features?.length) {
    return props.features
  }
  return props.data && Object.keys(props.data).length ? [props.data] : []
})

const featureJson = computed(() => JSON.stringify(selectedFeatures.value, null, 2))

const openModal = () => {
  visible.value = true
}
console.log(props)
</script>

<template>
  <div class="demo-custom-actions">
    <Button type="primary" size="small" @click.stop="openModal">按钮1</Button>
    <Modal
      v-model:open="visible"
      title="选中的要素"
      :footer="null"
      width="520px"
      destroy-on-close
    >
      <p class="demo-custom-meta">
        图层：{{ layer?.title || layer?.id || '-' }} ｜ 共 {{ selectedFeatures.length }} 个要素
        <template v-if="typeof index === 'number'">（当前第 {{ index + 1 }} 个）</template>
      </p>
      <pre class="demo-custom-json">{{ featureJson }}</pre>
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.demo-custom-actions {
  margin-top: 8px;
}

.demo-custom-meta {
  margin: 0 0 8px;
  color: #666;
  font-size: 13px;
}

.demo-custom-json {
  margin: 0;
  max-height: 360px;
  overflow: auto;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>

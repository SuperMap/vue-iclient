<template>
  <QuillEditor
    v-model:content="contentDelta"
    content-type="delta"
    theme=""
    :options="{ modules: { toolbar: false } }"
    class="sm-compoent-ql"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QuillEditor, Delta } from '@vueup/vue-quill'
import ConvertUtil from './util/ExpressionConverter'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  infos: {
    type: Object,
    default: ''
  }
})
const valueToContents = (value: any) => {
  if (value && value.ops) {
    value = ConvertUtil.getTextInfosString(value.ops)
  }
  return value
}

const formattedValue = computed(() => {
  return valueToContents(props.infos)
})

const contentDelta = computed<Delta>(() => {
  return new Delta(formattedValue.value)
})
</script>

<style scoped></style>

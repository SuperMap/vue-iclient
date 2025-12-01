<template>
  <QuillyEditor
    ref="editor"
    content-type="delta"
    theme=""
    :options="{ readOnly: true, modules: { toolbar: false } }"
    class="sm-compoent-ql"
  />
</template>

<script setup lang="ts">
import { watch, computed, useTemplateRef, onMounted } from 'vue'
import { Delta } from 'quill/core'
import { QuillyEditor } from 'vue-quilly'
import Quill from 'quill'
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

const editor = useTemplateRef<InstanceType<typeof QuillyEditor>>('editor')
let quill: Quill | undefined

onMounted(() => {
  quill = editor.value?.initialize(Quill)
  quill?.setContents(contentDelta.value)
})

watch(
  () => contentDelta.value,
  newVal => {
    quill?.setContents(newVal)
  }
)
</script>

<style scoped></style>

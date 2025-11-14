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
import FieldsConverter, { FieldsCaptionsType } from './util/FieldsConverter'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  infos: {
    type: Object,
    default: ''
  },
  fieldsCaptions: {
    type: Object as () => FieldsCaptionsType,
    default: () => null
  }
})
const valueToContents = (value: any) => {
  if (value && value.ops) {
    value = ConvertUtil.getTextInfosString(value.ops)
  }
  return value
}

const handleFieldCaptions = (value: any) => {
  if (value && props?.fieldsCaptions) {
    const formattedOps = FieldsConverter.convertTextInfoToCaption(value.ops, props.fieldsCaptions)
    value.ops = formattedOps
  }
  return value
}
const formattedValue = computed(() => {
  const value = handleFieldCaptions(props.infos)
  return valueToContents(value)
})
const contentDelta = computed<Delta>(() => {
  return new Delta(formattedValue.value)
})
</script>

<style scoped></style>

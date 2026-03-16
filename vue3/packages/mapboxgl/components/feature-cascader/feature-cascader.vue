<template>
  <Cascader
    :options="options"
    :popupClassName="popupClassName"
    :changeOnSelect="changeOnSelect"
    :placeholder="t('cascader.placeholder')"
    :dropdownStyle="dropdownStyle"
    :getPopupContainer="getPopupContainer"
    class="sm-component-feature-cascader"
    @change="onChange"
  />
</template>
<script setup lang="ts">
import { useLocale } from '@supermapgis/common/hooks/index.common'
import type { FeatureCascaderProps, FeatureCascaderEvents } from './types'
import { featureCascaderPropsDefault } from './types'
import { Cascader } from 'ant-design-vue'
import { useRequest } from '@supermapgis/mapboxgl/hooks'


const { t } = useLocale()
const props = withDefaults(defineProps<FeatureCascaderProps>(), featureCascaderPropsDefault)
const emit = defineEmits<FeatureCascaderEvents>()

const { datas, options, requestDataByFilter } = useRequest({ props, type: 'cascader' })

const getPopupContainer = (triggerNode) => {
  return triggerNode.parentNode;
}
async function onChange(value: string[] | number[]) {
  const feature = await requestDataByFilter(value);
  const dataset = value && datas.value.find(item => item.value === value[value.length - 1])?.dataset;
  emit('change', { value, feature, dataset });
}
</script>

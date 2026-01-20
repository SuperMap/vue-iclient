<template>
  <Cascader
    :options="options"
    :popupClassName="popupClassName"
    :changeOnSelect="changeOnSelect"
    :placeholder="t('cascader.placeholder')"
    :dropdownStyle="dropdownStyle"
    class="sm-component-feature-cascader"
    @change="onChange"
  />
</template>
<script setup lang="ts">
import { useLocale } from '@supermapgis/common/hooks/index.common'
import type { FeatureCascaderProps, FeatureCascaderEvents } from './types'
import { featureCascaderPropsDefault } from './types'
import { Cascader } from 'ant-design-vue'
import getFeatures from 'vue-iclient-core/utils/get-features'
import { useRequest } from '@supermapgis/mapboxgl/hooks'


const { t } = useLocale()
const props = withDefaults(defineProps<FeatureCascaderProps>(), featureCascaderPropsDefault)
const emit = defineEmits<FeatureCascaderEvents>()

const { options, datas } = useRequest({ props, type: 'cascader' })

async function onChange(value) {
  if (!value.length) return;
  const lastValue = value[value.length - 1];
  const target = datas.value.find(v => v.value === lastValue);
  const attributeFilter = `("${target.originalIdField}" like '%${lastValue}%')`;
  const data = await getFeatures({ ...target.dataset, attributeFilter });
  console.log(value, data)
  emit('change', value, data?.features?.[0]);
}
</script>

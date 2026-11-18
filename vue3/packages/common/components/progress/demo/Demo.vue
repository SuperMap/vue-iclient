<script setup lang="ts">
import { ref } from 'vue'
import { SmProgress } from '@supermapgis/common/components/progress'
import '@supermapgis/common/components/progress/style'

defineOptions({ name: 'ProgressDemo' })

const percent = ref(0.8)
</script>

<template>
  <div>
    <sm-progress :percent="percent" percent-type="percentage" type="line" :stroke-width="10" />
    <sm-progress :percent="percent" percent-type="percentage" type="circle" :stroke-width="10" />
    <sm-progress :percent="80" percent-type="percent" :decimals="2" />
  </div>
</template>

<style>
.sm-component-progress {
  width: 240px;
  height: 120px;
  margin-bottom: 16px;
}
</style>

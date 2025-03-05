<script setup lang="ts">
import TimeSlider from '../time-slider.vue'
import '../style'
const lineStyle = { "height": "5px", "type": "solid" }
const data = [1599810915, 1599810920, 1599810925, 1599810930, 1599810935, 1599810940, 1599810945]
</script>
<template>
  <div>
    <TimeSlider :data="data" :lineStyle="lineStyle"></TimeSlider>
  </div>
</template>


<script setup lang="ts">
import TimeText from '../time-text.vue'
import '../style'
</script>
<template>
  <div>
    <TimeText time-type="date+second+week"></TimeText>
    <TimeText time-type="date+second"></TimeText>
    <TimeText></TimeText>
  </div>
</template>


<script setup lang="ts">
import { reactive } from 'vue'
import GraphMap from '../graph-map.vue'
import '../style'
const props = reactive({
  serviceUrl:
    'https://iserver.supermap.io/iserver/services/knowledgeGraph-budongchan/restjsr/graph/graphmaps/图谱',
  autoresize: true,
  options: { container: 'graph-map' }
})
</script>
<template>
  <GraphMap v-bind="props" />
</template>
<style></style>

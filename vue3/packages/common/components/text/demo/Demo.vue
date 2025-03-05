<script setup lang="ts">
import Text from '../text.vue'
import '../style'
const fontStyle = { fontSize: '19px', fontFamily: '微软雅黑' }
</script>
<template>
  <div>
    <Text title="文本" href="http://www.baidu.com" target="_blank" :fontStyle="fontStyle"></Text>
    <Text url="http://172.16.14.44:8190/iportal/apps/mapdashboard/v2/static/templates/timeData/geoJsonSingleFeature.json" field="nowConfirmed"></Text>
  </div>
</template>


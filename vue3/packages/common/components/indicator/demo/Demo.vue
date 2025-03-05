<script setup lang="ts">
import { ref } from 'vue'
import Indicator from '../indicator.vue'
import '../style'
let num = ref(0);
setInterval(() => {
  num.value = Math.floor(Math.random() * 10000);
}, 2000);
</script>
<template>
  <div>
    <Indicator url="http://172.16.14.44:8190/iportal/apps/mapdashboard/v2/static/templates/timeData/geoJsonSingleFeature.json" numField="nowConfirmed" titleField="nowConfirmed" unitField="nowConfirmed"></Indicator>
    <Indicator :numSpacing="9" title="标题" :num="12323412" unit="单位"></Indicator>
    <Indicator title="人均收入" unit="元" indicatorColor="red" textColor="green" :num="12323412" fontSize="25"></Indicator>
    <Indicator :animated="true" title="标题222" unit="单位" :num="num"></Indicator>
  </div>
</template>


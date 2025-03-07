<script setup lang="ts">
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Query from '../query.vue'
import Button from '@supermapgis/common/components/button/Button'
import { useParameters } from '@supermapgis/common/hooks/useParameters'
import { ref, reactive } from 'vue'
import '../style'
import '@supermapgis/mapboxgl/components/web-map/style/index.ts'

const {
  createiPortalDataParameter,
  createRestDataParameter,
  createRestMapParameter
} = useParameters()
const position = ref('top-left')
const mapTarget = ref('map1')
const bgColor = ref()
const queryProps = reactive({
  iportalData: [
    createiPortalDataParameter({
      url: 'http://172.16.14.44:8190/iportal/web/datas/1087373639',
      attributeFilter: 'SmID>0'
    }),
    createiPortalDataParameter({
      url: 'http://172.16.14.44:8190/iportal/web/datas/568810783',
      attributeFilter: 'SmID>0'
    })
  ],
  restData: [
    createRestDataParameter({
      url: 'http://172.16.14.44:8090/iserver/services/data-world/rest/data',
      attributeFilter: "NAME='Huang He'",
      dataName: ['World:Countries']
    })
  ],
  restMap: [
    createRestMapParameter({
      url: 'http://172.16.14.44:8090/iserver/services/map-world-2/rest/maps/World',
      attributeFilter: 'SmID>0',
      layerName: 'Capitals@World.1'
    })
  ]
})

const changePosition = () => {
  position.value = position.value === 'top-left' ? 'top-right' : 'top-left'
}

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
const querySucceeded = (e: any) => {
  console.log(e)
}
</script>
<template>
  <div>
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button type="primary" @click="changePosition">切换位置</Button>
    </div>

    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
      <Query
        v-bind="queryProps"
        :position="position"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="query"
        @query-succeeded="querySucceeded"
      />
    </WebMap>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.sm-component-web-map {
  margin-right: 10px;
  height: 800px;
}
</style>

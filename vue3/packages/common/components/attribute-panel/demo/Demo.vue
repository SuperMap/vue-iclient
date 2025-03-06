<script setup lang="ts">
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Search from '@supermapgis/mapboxgl/components/search/search.vue'
import Button from '@supermapgis/common/components/button/Button'
import { useParameters } from '@supermapgis/common/hooks/useParameters'
import { ref, reactive } from 'vue'
import '../style'

const { createiPortalDataParameter, createRestDataParameter, createRestMapParameter, createAddressMatchParameter } =
  useParameters()
const position = ref('top-left')
const mapTarget = ref('map1')
const bgColor = ref()
const searchProps = reactive({
  layerNames: ['318218382'],
  addressMatch: [createAddressMatchParameter({
    url: 'http://172.16.14.44:8090/iserver/services/addressmatch-Address/restjsr/v1/address'
  })],
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

const changePosition = (pos: string) => {
  position.value = pos
}
const changeMapTarget = () => {
  const target = mapTarget.value || 'map1'
  mapTarget.value = target === 'map1' ? 'map' : 'map1'
}

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
</script>
<template>
  <div>
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button type="primary" @click="changePosition('top-right')">切换位置</Button>
      <Button @click="changeMapTarget">切换绑定地图</Button>
    </div>

    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="331024164" target="map1">
      <Search
        v-bind="searchProps"
        :position="position"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="search"
      />
    </WebMap>
  </div>
</template>
<style></style>

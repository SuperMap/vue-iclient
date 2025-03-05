<script setup lang="ts">
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Query from '../query.vue'
import LayerList from '../../layer-list/layer-list.vue'
import Identify from '../../identify/identify.vue'
import Search from '../../search/search.vue'
import Button from '@supermapgis/common/components/button/Button'
import { useParameters } from '@supermapgis/common/hooks/useParameters'
import { ref, reactive } from 'vue'
import '../style'

const {
  createiPortalDataParameter,
  createRestDataParameter,
  createRestMapParameter,
  createAddressMatchParameter
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
const searchProps = reactive({
  ...queryProps,
  layerNames: ['318218382'],
  addressMatch: [createAddressMatchParameter({
    url: 'http://172.16.14.44:8090/iserver/services/addressmatch-Address/restjsr/v1/address'
  })]
})
const identifyProps = reactive({
  layers: [
    'ms_base_北京轨道交通分布.geojson_1731400350143_31',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_59',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_60',
    'ms_composite_symbol_ms_base_北京轨道交通分布.geojson_1731400350143_31_1731400362150_61',
    '北京住宅小区分布.geojson'
  ],
  multiSelect: true
})

const changePosition = () => {
  position.value = position.value === 'top-left' ? 'top-right' : 'top-left'
}
const changeMapTarget = () => {
  const target = mapTarget.value || 'map1'
  mapTarget.value = target === 'map1' ? 'map' : 'map1'
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
      <Button type="primary" @click="changePosition('top-right')">切换位置</Button>
      <Button @click="changeMapTarget">切换绑定地图</Button>
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
      <LayerList
        :position="position"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="tuceng"
      />
      <Identify
        v-bind="identifyProps"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="identify"
      />
      <Search
        v-bind="searchProps"
        :position="position"
        :map-target="mapTarget"
        :background="bgColor"
        headerName="search"
        @search-succeeded="querySucceeded"
      />
    </WebMap>
  </div>
</template>
<style></style>

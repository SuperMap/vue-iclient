<script setup lang="ts">
import AttributePopup from '../attribute-popup.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref, reactive } from 'vue'
import '../style'

// const mapTarget = ref('map1')
const bgColor = ref()

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
const elements = [
  {
    type: 'FIELD',
    fieldName: 'centroid',
    contentType: 'text'
  },
  {
    type: 'FIELD',
    fieldName: 'center',
    contentType: 'href',
    target: '_blank'
  },
  {
    type: 'FIELD',
    fieldName: 'subFeatureIndex',
    contentType: 'image'
  },
  {
    type: 'FIELD',
    fieldName: 'name',
    contentType: 'image',
    imgWidth: 50,
    imgHeight: 50
  },
  {
    type: 'FIELD',
    fieldName: 'acroutes'
  },
  {
    type: 'DIVIDER'
  },
  {
    type: 'TEXT',
    infos: [
      {
        insert: ['concat', ['get', 'level'], ['get', 'adcode']],
        attributes: {
          size: 'small',
          color: '#4e35cc',
          underline: true,
          strike: true,
          bold: true,
          italic: true
        }
      },
      {
        insert: '\n',
        attributes: {
          align: 'center'
        }
      }
    ]
  },
  {
    type: 'DIVIDER'
  },
  {
    type: 'IMAGE',
    title: ['concat', ['get', 'adcode']],
    value: ['concat', ['get', 'parent']]
  },
  {
    type: 'IMAGE',
    title: 'afdfd',
    value: ['concat', ['get', 'level']]
  },
  {
    type: 'DIVIDER'
  },
  {
    type: 'VIDEO',
    title: 'fdsfs',
    value: 'http://172.16.14.44:8190/iportal/apps/mapstudio/edit.html'
  },
  {
    type: 'DIVIDER'
  },
  {
    type: 'IMAGE',
    title: ['concat', ['get', 'parent'], ['get', 'adcode']],
    value: ['concat', ['get', 'adcode'], ['get', 'level']]
  }
]
const elementss = {
  elements: [
    {
      type: 'FIELD',
      fieldName: 'SmID'
    },
    {
      type: 'FIELD',
      fieldName: '标准名称'
    }
  ],
  id: '北京市轨道交通线路-打印(3)',
  title: '北京市轨道交通线路-打印(3)'
}
const data = ref([
  {
    elements: elements,
    title: '北京市(3)',
    id: '北京市(3)',
    identifyField: 'name'
  },
  elementss
])
const popupConfig = ref({
  autoResize: false,
  keyWordWrap: 'ellipsis',
  valueWordWrap: 'ellipsis',
  color: '#f00',
  width: '200px',
  height: '300px',
  maxWidth: '320px',
  maxHeight: '400px'
})
const popupControl = reactive({
  show: true,
  useMapPopup: true
})
</script>
<template>
  <div>
    <div>
      <Button type="primary" @click="changeBg">切换背景</Button>
    </div>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="1291742002" target="map1" :attributePopupControl="popupControl">
      <!-- <AttributePopup
        :map-target="mapTarget"
        :background="bgColor"
        :popupInfos="data"
        :useMapPopup="true"
        :multi-select="true"
        :identifyFields="[{ layerId: '北京市(3)', field: 'name' }]"
        :popup-config="popupConfig"
      /> -->
    </WebMap>
    <WebMap serverUrl="http://172.16.14.44:8190/iportal" :map-id="1531336475" target="map2">
      <AttributePopup
        map-target="map2"
        :background="bgColor"
        :popupInfos="data"
        :useMapPopup="true"
        :multi-select="true"
        :popup-config="popupConfig"
      />
    </WebMap>
    <!-- <WebMap
      serverUrl="http://172.16.14.44:8190/iportal"
      :map-id="1531336475"
      target="map2"
      :popupControl="popupControl"
    ></WebMap> -->
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.sm-component-web-map {
  margin-right: 10px;
  width: 40% !important;
  height: 80% !important;
  // position: fixed !important;
}
#map2 {
  top: 100px !important;
  left: 30% !important;
}
</style>

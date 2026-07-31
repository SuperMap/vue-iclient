<script setup lang="ts">
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import SceneMapSwitch from '../scene-map-switch.vue'
import '../style'
import { BaseMapLayerConfig } from '../types'

const baseMapLayers: BaseMapLayerConfig[] = [
  {
    label: '影像-restmap',
    layer: {
      type: 'SuperMapImagery',
      url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/China_4326'
    }
  },
  {
    label: '深色-restmap',
    image: 'http://172.16.15.58:3000/zgis-map/public/image/bg_map_normal.png',
    layer: {
      type: 'SuperMapImagery',
      url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark',
      transparentBackColor: 'rgb(0,0,0)',
      transparentBackColorTolerance: 0.1
    }
  },
  {
    label: '天地图矢量(经纬度)',
    layer: {
      type: 'TiandituImagery',
      mapStyle: 'VEC_C',
      labelVisible: false
    }
  },
  {
    label: '地形渲染',
    layer: {
      type: 'TiandituImagery',
      mapStyle: 'TER_C',
      labelVisible: true,
      token: '97d2d09de3e54939dd20123859260bf9'
    }
  }
]

// const terrain = {
//   type: 'TiandituTerrain' as const,
//   url: 'https://{s}.tianditu.gov.cn/mapservice/swdx?T=elv_c',
//   subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
// }


const terrain1 = {
  type: 'SuperMapTerrain' as const,
  url: 'https://www.supermapol.com/realspace/services/3D-dixingyingxiang/rest/realspace/datas/DatasetDEM',
  isSct: true,//地形服务源自SuperMap iServer发布时需设置isSct为true
  invisibility: true  // 启用地形显隐控制
}

const annotation = {
  type: 'TiandituAnnotation' as const,
  url: 'https://{s}.tianditu.gov.cn/mapservice'
}
const tiandituToken = '97d2d09de3e54939dd20123859260bf9'
const defaultProps = ({
  sceneUrl: 'http://172.16.15.109:8082/iportal/web/scenes/825657853',
  widgetsPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: 'http://172.16.15.109:8082/iportal/apps/earth/v2/lib/OpenConfig.js',
  options: {
    scanEffect: {
      status: true,
      type: 'noScan',
      centerPostion: {
        x: null,
        y: null,
        z: null
      },
      period: 2000,
      speed: 500
    },
    position: {
      orientation: {
        pitch: null,
        roll: null,
        heading: null
      },
      destination: {
        x: null,
        y: null,
        z: null
      }
    }
    // position: {
    //   orientation: {
    //     pitch: -0.20917672793046682,
    //     roll: 2.708944180085382e-13,
    //     heading: 1.4059101895600987
    //   },
    //   destination: {
    //     x: -1206939.1925299785,
    //     y:  5337998.241228442,
    //     z: 3286279.2424502545
    //   }
    // }
  }
  // tiandituOptions: {
  //   token: 'bd404cfc4271223b0ba2b6057c8af9c2'
  // }
})
const instanceDidLoadFn = (e: any) => {}
</script>

<template>
  
  <WebScene v-bind="defaultProps" @instance-did-load="instanceDidLoadFn">
      <SceneMapSwitch
      sceneTarget="scene"
      position="top-left"
      :baseMapLayers="baseMapLayers"
      :terrain="terrain1"
      :annotation="annotation"
      :token="tiandituToken"
    />
  </WebScene>

</template>

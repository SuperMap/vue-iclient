<script setup lang="ts">
import Attributes from '../attributes.vue'
import WebMap from '../../web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const bgColor = ref()
const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}
const fieldConfigs = [
                            { value: '平均最低气温_Num', visible: false },
                            { value: 'SmID', visible: false },
                            {
                                value: '站台',
                                visible: true,
                                filters: [
                                    { text: '塔城', value: '塔城' },
                                    { text: '大同', value: '大同' },
                                    { text: '石家庄', value: '石家庄' }
                                ],
                                onFilter: (value, record) => record['站台'].indexOf(value) === 0
                            },
                            {
                                value: '省份',
                                visible: true,
                                onFilter: (value, record) => record['省份'].indexOf(value) === 0,
                                scopedSlots: {
                                    filterDropdown: 'filterDropdown',
                                    filterIcon: 'filterIcon',
                                    customRender: 'customRender'
                                }
                            },
                            { value: '海拔', visible: false },
                            { value: '最高气温_Num', visible: false },
                            { value: '最高气温', visible: false },
                            { value: '最高七天气温_Num', visible: false },
                            { value: '最热七天气温', visible: true, defaultSortOrder: 'descend' },
                            { value: '最低气温_Num', visible: false },
                            { value: '最低气温', visible: false },
                            { value: '年均降雨_Num', visible: false },
                            { value: 'lon', visible: true, title: '经度', width: 250 },
                            { value: 'lat', visible: true, title: '纬度', width: 250 }
                        ]
</script>
<template>
  <WebMap server-url="https://www.supermapol.com/" :map-id="505367620" target='map2'></WebMap>
  <Button type="primary" @click="changeBg">切换背景</Button>
  <Attributes layer-name="全国671个气象站观测数据" :background="bgColor" mapTarget='map2' :field-configs="fieldConfigs"></Attributes>
</template>
<style>
#map2 {
  height: 500px;
}
</style>

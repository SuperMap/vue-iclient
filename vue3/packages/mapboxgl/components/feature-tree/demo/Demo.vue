<script setup lang="ts">
import FeatureTree from '../feature-tree.vue'
import '../style'

const DEFAULT_CONFIG = {
  // 数据服务地址
  dataset: {
    withCredentials: false,
    epsgCode: 4490,
    name: 'quxian:quxian',
    dataName: ['quxian:quxian'],
    id: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/dataquxian:quxian',
    type: 'iServer',
    url: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/data',
    proxy: false
  },
  // 标识字段
  idField: 'PARENT_COD',
  // 显示名称字段
  titleField: 'PARENT_NAM',
  children: {
    dataset: {
      withCredentials: false,
      epsgCode: 4490,
      name: 'quxian:quxian',
      dataName: ['quxian:quxian'],
      id: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/dataquxian:quxian',
      type: 'iServer',
      url: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/data',
      proxy: false
    },
    parentField: 'PARENT_COD',
    idField: 'ADMIN_CODE',
    titleField: 'DIVISION_N',
    children: {
      dataset: {
        type: 'iServer',
        withCredentials: false,
        url: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/data',
        name: 'zhejiang_township:zhejiang_township',
        id: 'http://172.16.14.44:8090/iserver/services/data-zhejiang/rest/datazhejiang_township:zhejiang_township',
        dataName: ['zhejiang_township:zhejiang_township'],
        epsgCode: 4490,
        proxy: false
      },
      parentField: 'PARENT_COD',
      idField: 'CODE',
      titleField: 'NAME'
    }
  }
}

</script>
<template>
  <FeatureTree :config="DEFAULT_CONFIG" />
</template>
<style></style>

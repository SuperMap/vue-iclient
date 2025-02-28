<script setup>
import { WebMapDemo, AttributesDemo, LayerListDemo, QueryDemo } from './register-components'
import { setTheme } from '@supermapgis/common/components/theme/theme'
import { ref, onBeforeMount } from 'vue'
import Button from '@supermapgis/common/components/button/Button'

const theme = ref('light')

onBeforeMount(() => {
  setTheme({ themeStyle: theme.value })
})

const changeStyle = () => {
  setTheme({ themeStyle: 'dark'})
}
const changeStyle1 = () => {
  setTheme({ themeStyle: 'light' })
}
const changeStyle2 = () => {
  let transparent = {
    themeType: 'dark',
    blue: 'purple',
    green: '#00bc00',
    red: '#e41318',
    gold: '#f2b200',
    colorPrimary: 'purple',
    colorSuccess: '#00bc00',
    colorWarning: '#f2b200',
    colorError: '#e41318',
    colorInfo: 'purple',
    colorTextBase: 'pink',
    colorBgBase: 'orange',
    gisControlBg: 'green',
    gisControlHeaderBg: 'red',
    // gisControlItemBgSelected: 'black',
    gisControlItemBgHover: 'blue'
  }
  setTheme({ themeStyle: transparent })
}
</script>

<template>
  <div class="app-holder">
    <div class="changeTheme">
      <Button @click="changeStyle">深色主题</Button>
      <Button @click="changeStyle1">浅色主题</Button>
      <Button @click="changeStyle2" background="red">自定义主题</Button>
    </div>
    <div class="map-holder">
      <WebMapDemo server-url="http://172.16.14.44:8190/iportal" :map-id="692091022"></WebMapDemo>
      <!-- <LayerListDemo></LayerListDemo> -->
      <QueryDemo />
    </div>
    <AttributesDemo></AttributesDemo>
  </div>
</template>

<style>
.changeTheme {
  padding: 8px;
  background: #c8adad;
  text-align: center;
  margin-bottom: 20px;
}

.app-holder {
  background: var(--color-bg-base)
}

.app-holder > div{
  position: relative;
}

.map-holder {
  display: flex;
}
.map-holder > div {
  flex: 1;
  margin-right: 15px;
}
</style>

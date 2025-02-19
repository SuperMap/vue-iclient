<script setup>
import { WebMapDemo, AttributesDemo, LayerListDemo } from './register-components'
import { setTheme } from 'vue-iclient-core/utils/style/theme/set-theme'
import { ref } from 'vue'
import { Button } from 'ant-design-vue'

const theme = ref('light')
setTheme(theme)

const changeStyle = () => {
  setTheme('dark')
}
const changeStyle1 = () => {
  setTheme('light')
}
const changeStyle2 = () => {
  let transparent = {
    style: 'light',
    textColor: '#000',
    background: 'transparent',
    componentBackground: 'pink',
    collapseCardHeaderBg: 'red',
    collapseCardBackground: 'green',
    hoverColor: 'blue',
    clickColor: 'grey',
    selectedColor: 'black'
  }
  setTheme(transparent)
}
const changeStyle3 = () => {
  setTheme('warmGray')
}
</script>

<template>
  <Fragement>
    <div class="changeTheme">
      <Button @click="changeStyle">深色主题</Button>
      <Button @click="changeStyle1">浅色主题</Button>
      <Button @click="changeStyle3">暖灰色主题</Button>
      <Button @click="changeStyle2">透明主题</Button>
    </div>
    <WebMapDemo server-url="http://172.16.14.44:8190/iportal" :map-id="692091022"></WebMapDemo>
    <AttributesDemo></AttributesDemo>
    <LayerListDemo></LayerListDemo>
  </Fragement>
</template>

<style scoped>
.changeTheme {
  position: absolute;
  left: 50%;
  transform: translate(-100px);
  z-index: 100;
}
</style>

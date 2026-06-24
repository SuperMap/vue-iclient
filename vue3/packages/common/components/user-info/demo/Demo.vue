<script setup lang="ts">
import UserInfo from '../user-info.vue'
import Button from '@supermapgis/common/components/button/Button'
import { ref } from 'vue'
import '../style'

const iportalRootUrl = ref('/iportal')
const showIcon = ref(true)
const showName = ref(true)

const toggleIcon = () => {
  showIcon.value = !showIcon.value
}

const toggleName = () => {
  showName.value = !showName.value
}

</script>
<template>
  <div>
    <div style="margin-bottom: 16px;">
      <Button type="primary" @click="toggleIcon">切换图标显示</Button>
      <Button type="primary" @click="toggleName" style="margin-left: 8px;">切换名称显示</Button>
    </div>

    <div style="padding: 16px; border: 1px solid #dcdfe6; border-radius: 4px;">
      <UserInfo
        :root-url="iportalRootUrl"
        :show-icon="showIcon"
        :show-name="showName"
      />
    </div>
  </div>
</template>
<style></style>

<script setup lang="ts">
import { provide, shallowRef } from 'vue'
import PopupContent from '../popup-content.vue'
import CustomPopupContent from './CustomPopupContent.vue'
import {
  popupContentRuntimeRegistryKey,
  type PopupContentRenderer
} from '../runtime-registry'
import '../style'

const customRenderers = shallowRef<PopupContentRenderer[]>([
  {
    type: 'CUSTOM_STATUS',
    hosts: ['map'],
    component: CustomPopupContent,
    resolveProps: context => ({
      config: context.element.extension,
      feature: context.attributes
    })
  }
])

// Demo 与真实宿主使用相同的注入协议，弹窗配置中只保存可序列化数据。
provide(popupContentRuntimeRegistryKey, { renderers: customRenderers })

const data = [
  { title: 'name', value: 'Central Park' },
  { title: 'category', value: 'Park' },
  { title: 'website', value: 'https://iclient.supermap.io' },
  { title: 'imageUrl', value: 'https://iclient.supermap.io/img/whatsNewLandUse.png' }
]

const popupInfo = {
  title: 'Feature details',
  layerId: 'sample-layer',
  elements: [
    {
      type: 'FIELD' as const,
      fieldName: 'name',
      fieldCaption: 'Name',
      contentType: 'text' as const
    },
    {
      type: 'FIELD' as const,
      fieldName: 'website',
      fieldCaption: 'Website',
      contentType: 'href' as const,
      contentInfo: { text: 'Open website', target: '_blank' as const }
    },
    { type: 'DIVIDER' as const },
    {
      type: 'TEXT' as const,
      infos: [
        {
          insert: ['concat', 'Category: ', ['get', 'category']],
          attributes: { bold: true, color: '#1677ff' }
        },
        { insert: '\n' }
      ]
    },
    { type: 'DIVIDER' as const },
    {
      type: 'IMAGE' as const,
      title: ['concat', ['get', 'name'], ' image'],
      value: ['get', 'imageUrl'],
      options: { previewMode: 'popup' as const }
    },
    { type: 'DIVIDER' as const },
    {
      type: 'CUSTOM_STATUS',
      extension: {
        title: 'Custom content',
        field: 'category',
        color: '#52c41a'
      }
    }
  ]
}

const popupConfig = {
  width: '320px',
  maxHeight: '420px',
  keyWordWrap: 'ellipsis' as const,
  valueWordWrap: 'wrap' as const
}
</script>

<template>
  <div class="popup-content-demo">
    <PopupContent :data="data" :popup-info="popupInfo" :popup-config="popupConfig" />
    <PopupContent class="popup-content-demo__empty" />
  </div>
</template>

<style scoped>
.popup-content-demo {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px;
}

.popup-content-demo > * {
  width: 320px;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>

<template>
  <div class="sm-component-field-info">
    <template v-for="{ fieldCaption, fieldName, value, contentType, contentInfo } in infos">
      <div class="name" :style="attributeStyle.keyStyle" :title="fieldCaption || fieldName">
        {{ fieldCaption || fieldName }}
      </div>
      <div class="value">
        <a
          v-if="contentType === 'href'"
          :href="value"
          :target="contentInfo?.target || '_blank'"
          :style="attributeStyle.valueStyle"
          :title="contentInfo?.text || value"
        >
          {{ contentInfo?.text || value }}
        </a>
        <player
          v-else-if="contentType === 'video'"
          :type="'VIDEO'"
          :value="value"
          :options="contentInfo"
          class="sm-component-field-info-video"
        />
        <player
          v-else-if="contentType === 'image'"
          :type="'IMAGE'"
          :value="value"
          :options="contentInfo"
          class="sm-component-field-info-image"
        />
        <template v-else="contentType === 'text'">
          <div :style="attributeStyle.valueStyle" :title="value" class="sm-component-field-info-text">{{ value }}</div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Attribute } from './types'
import player from './player.vue'

interface Infos {
  fieldName?: string
  fieldCaption?: string
  value: string
  contentType: Attribute['contentType']
  contentInfo?: Attribute['contentInfo']
}

defineProps({
  infos: {
    type: Array as PropType<Infos[]>,
    default: () => ({})
  },
  attributeStyle: {
    type: Object as PropType<{ keyStyle: Record<string, any>; valueStyle: Record<string, any> }>,
    default: () => ({ keyStyle: {}, valueStyle: {} })
  }
})
</script>

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
          style="width: 100%; height: auto"
          class="sm-component-field-info-video"
        />
        <player
          v-else-if="contentType === 'image'"
          :type="'IMAGE'"
          value="https://pic1.arkoo.com/56D0B40F99F841DF8A2425762AE2565D/picture/o_1i4qop009177v1tgf14db15he1iaj1is.jpg"
          :options="contentInfo"
          class="sm-component-field-info-image"
        />
        <template v-else="contentType === 'text'">
          <div :style="attributeStyle.valueStyle" :title="value">{{ value }}</div>
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
    type: Object as PropType<{ keyStyle: string; valueStyle: string }>,
    default: () => ({ keyStyle: '', valueStyle: '' })
  }
})
</script>

<style scoped></style>

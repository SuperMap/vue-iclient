<template>
  <div class="sm-component-field-info">
    <div v-for="(item, index) in infos" :key="index" class="item">
      <div class="name" :style="attributeStyle.keyStyle" :title="item.fieldCaption || item.fieldName">
        {{ item.fieldCaption || item.fieldName }}
      </div>
      <div class="value">
        <a
          v-if="item.contentType === 'href'"
          :href="item.value"
          :target="(item.contentInfo && item.contentInfo.target) || '_blank'"
          :style="attributeStyle.valueStyle"
          :title="(item.contentInfo && item.contentInfo.text) || item.value"
        >
          {{ (item.contentInfo && item.contentInfo.text) || item.value }}
        </a>
        <SmPlayer
          v-else-if="item.contentType === 'video'"
          type="VIDEO"
          :value="item.value"
          :options="item.contentInfo"
          style="width: 100%; height: auto"
          class="sm-component-field-info-video"
        />
        <SmPlayer
          v-else-if="item.contentType === 'image'"
          type="IMAGE"
          :value="item.value"
          :options="item.contentInfo"
          class="sm-component-field-info-image"
        />
        <template v-else>
          <div :style="attributeStyle.valueStyle" :title="item.value" class="sm-component-field-info-text">
            {{ item.value }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import SmPlayer from './Player.vue';

export default {
  name: 'SmFieldInfo',
  components: { SmPlayer },
  props: {
    infos: {
      type: Array,
      default: () => []
    },
    attributeStyle: {
      type: Object,
      default() {
        return { keyStyle: '', valueStyle: '' };
      }
    }
  }
};
</script>

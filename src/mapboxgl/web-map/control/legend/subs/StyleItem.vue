<template>
  <div class="sm-component-legend__item">
    <ImageRenderer v-if="styleType === 'image'" :style-data="styleData" />
    <StyleRenderer v-else :style-data="styleData" />
    <StyleValue v-if="showStyleField" :style-data="styleData" />
  </div>
</template>

<script>
import StyleValue from './StyleValue.vue';
import ImageRenderer from './ImageRenderer.vue';
import StyleRenderer from './StyleRenderer.vue';

export default {
  components: {
    StyleValue,
    ImageRenderer,
    StyleRenderer
  },
  props: {
    styleData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    showStyleField() {
      return 'fieldValue' in this.styleData || 'start' in this.styleData || 'end' in this.styleData;
    },
    styleType() {
      return this.styleData.style.type;
    }
  }
};
</script>

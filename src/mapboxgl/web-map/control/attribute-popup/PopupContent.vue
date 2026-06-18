<template>
  <div class="sm-attribute-popup-content">
    <div :style="maxHeight">
      <template v-for="({ type, infos }, index) in content">
        <FieldInfo v-if="type === 'FIELD'" :key="index" :infos="infos" :attributeStyle="attributeStyle" />
        <TextInfo v-if="type === 'TEXT'" :key="index" :infos="infos" />
        <MediaInfo v-if="type === 'MEDIA'" :key="index" :infos="infos" />
        <div class="sm-divider" v-if="type === 'DIVIDER'" :key="index" dashed />
      </template>
      <div v-if="content.length === 0">{{ $t('common.noData') }}</div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import FieldInfo from './FieldInfo.vue';
import TextInfo from './TextInfo.vue';
import MediaInfo from './MediaInfo.vue';
import PopupUtil from './util/PopupUtil';
import popupConfigMixin from './mixins/popup-config-mixin';
import ADivider from 'ant-design-vue/es/divider';

export default {
  name: 'SmPopupContent',
  mixins: [popupConfigMixin],
  components: { FieldInfo, TextInfo, MediaInfo, ADivider },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    popupInfo: {
      type: Object,
      default: () => ({})
    },
    popupConfig: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    popupConfigValue() {
      return this.popupConfig;
    },
    attributes() {
      const attrs = {};
      this.data.forEach(d => {
        attrs[d.title] = d.value;
      });
      return attrs;
    },
    content() {
      const { elements } = this.popupInfo;
      if (!elements) return [];
      const newItems = PopupUtil.getLayoutElements(cloneDeep(elements));
      const resultElements = PopupUtil.getResultElement(newItems, this.attributes);
      return resultElements;
    },
    maxHeight() {
      return this.popupConfig.height || this.popupConfig.maxHeight || {};
    }
  }
};
</script>

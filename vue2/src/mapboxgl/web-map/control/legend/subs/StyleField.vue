<template>
  <div class="sm-component-legend__themefield add-ellipsis" :style="secondaryTextColorStyle">
    {{ themFieldText }}
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';

export default {
  mixins: [Theme],
  props: {
    styleField: {
      type: String
    },
    themeField: {
      type: String,
      default: ''
    }
  },
  computed: {
    themFieldLabel() {
      const themeFieldText = this.$t('legend.themeField');
      if (!this.styleField) {
        return themeFieldText;
      }
      const tips = {
        symbolsContent: this.$t('legend.style'),
        color: this.$t('legend.color'),
        size: this.$t('legend.size'),
        opacity: this.$t('legend.opacity'),
        width: this.$t('legend.width'),
        outlineColor: this.$t('legend.outlineColor'),
        textSize: this.$t('legend.label') + '-' + this.$t('legend.size'),
        textOpacity: this.$t('legend.label') + '-' + this.$t('legend.opacity'),
        textColor: this.$t('legend.label') + '-' + this.$t('legend.color'),
        textHaloColor: this.$t('legend.label') + '-' + this.$t('legend.haloColor')
      };
      return themeFieldText + this.$t('legend.parentheses', { tips: tips[this.styleField] });
    },
    themFieldText() {
      return this.themFieldLabel + this.$t('legend.colon') + this.themeField;
    }
  }
};
</script>

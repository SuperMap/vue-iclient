<template>
  <div class="sm-component-text" :style="[formatFontStyle, getBackgroundStyle, getTextColorStyle]">
    <span>{{ title }}</span>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmText',
  mixins: [Theme],
  props: {
    fontStyle: {
      type: Object
    },
    title: {
      type: String
    }
  },
  computed: {
    formatFontStyle() {
      let fontStyle = JSON.parse(JSON.stringify(this.fontStyle));
      fontStyle.fontSize &&
        (fontStyle.fontSize = parseFloat(fontStyle.fontSize) + 'px');
      fontStyle.lineHeight &&
        (fontStyle.lineHeight = parseFloat(fontStyle.lineHeight) + 'px');
      fontStyle.textIndent &&
        (fontStyle.textIndent = parseFloat(fontStyle.textIndent) + 'px');
      return fontStyle;
    }
  }
};
</script>

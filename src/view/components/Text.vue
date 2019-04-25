<template>
  <div class="sm-text" :style="[getBackgroundStyle, formatFontStyle, getTextColorStyle]">
    <span>{{title}}</span>
  </div>
</template>

<script>
import Widget from './Widget';
import Theme from '../mixin/Theme';
export default {
  name: 'SmText',
  extends: Widget,
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
      fontStyle.fontSize && (fontStyle.fontSize = parseFloat(fontStyle.fontSize) + 'px');
      fontStyle.lineHeight &&
        (fontStyle.lineHeight = parseFloat(fontStyle.lineHeight) + 'px');
      fontStyle.textIndent &&
        (fontStyle.textIndent = parseFloat(fontStyle.textIndent) + 'px');
      return fontStyle;
    }
  }
};
</script>



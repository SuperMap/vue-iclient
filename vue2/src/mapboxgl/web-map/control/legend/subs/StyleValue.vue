<template>
  <span class="sm-component-legend__fieldvalue add-ellipsis" :style="textStyle">
    {{ fieldLabel }}
  </span>
</template>

<script>
import { formatFontSize } from 'vue-iclient-core/utils/util';

export default {
  props: {
    styleData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    isTextShapeType() {
      return this.styleData.style.shape.toLowerCase() === 'text';
    },
    getTextShadow() {
      return (textHaloWidth, textHaloBlur, textHaloColor) => {
        const maxwidth = (textHaloBlur || 2) > (textHaloWidth || 2) ? textHaloBlur : textHaloWidth;
        const width = maxwidth || 2;
        textHaloColor = textHaloColor || '#242424';
        return `2px 1px ${width}px ${textHaloColor} , 0 0 ${width}px ${textHaloColor}, 0 0 ${width}px ${textHaloColor}`;
      };
    },
    textStyle() {
      if (!this.isTextShapeType) {
        return {};
      }
      const { textSize, textColor, textOpacity, textHaloColor, textHaloBlur, textHaloWidth, textFont } = this.styleData.style;
      return {
        fontSize: formatFontSize(textSize),
        color: textColor,
        opacity: textOpacity,
        textShadow: this.getTextShadow(textHaloWidth, textHaloBlur, textHaloColor),
        fontFamily: textFont
      };
    },
    fieldLabel() {
      if ('fieldValue' in this.styleData) {
        return this.styleData.fieldValue ?? this.$t('legend.themeDefault');
      }
      return this.rangeLabel;
    },
    rangeLabel() {
      const { start, end, integerType } = this.styleData;
      if (!start && !end) {
        return this.$t('legend.outOfRange');
      }
      if (start && end) {
        if (integerType) {
          return this.getIntegerRangeInfo(start, end);
        }
        return `${start} - ${end}`;
      }
      return start !== undefined ? `≥${start}` : `≤${end}`;
    }
  },
  methods: {
    getIntegerRangeInfo(start, end) {
      if (end - 1 === start || end === start) {
        return `${start}`;
      }
      return `${start} - ${end - 1}`;
    }
  }
};
</script>

<template>
  <div class="sm-component-text" :style="[customStyle, getBackgroundStyle, getTextColorStyle]">
    <span v-if="href">
      <a
        :target="target"
        :href="href"
        class="sm-component-text__href"
        :style="[getTextColorStyle]"
      >{{ finalValue }}</a>
    </span>
    <span v-else class="sm-component-text__span">{{ finalValue }}</span>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Timer from 'vue-iclient/src/common/_mixin/Timer';
import ThirdService from 'vue-iclient/src/common/_mixin/ThirdService';

export default {
  name: 'SmText',
  mixins: [Theme, Timer, ThirdService],
  props: {
    fontStyle: {
      type: Object
    },
    title: {
      type: String
    },
    href: {
      type: String,
      default: ''
    },
    target: {
      type: String,
      default: '_self'
    }
  },
  data() {
    return {
      finalValue: this.title
    };
  },
  computed: {
    customStyle() {
      let style = Object.assign({}, this.fontStyle);
      if (style.textAlign && !style.justifyContent && !style.display) {
        const textAlign = style.textAlign;
        style.justifyContent = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
      }
      if (!style.textAlign) {
        switch (style.justifyContent) {
          case 'flex-start':
            style.textAlign = 'left';
            break;
          case 'flex-end':
            style.textAlign = 'right';
            break;
          case 'center':
            style.textAlign = 'center';
            break;
        }
      }
      return style;
    }
  },
  watch: {
    title(val) {
      this.finalValue = val;
    }
  },
  beforeDestroy() {
    this.restService && this.restService.remove('getdatasucceeded');
  },
  methods: {
    timing() {
      this.getData();
    }
  }
};
</script>

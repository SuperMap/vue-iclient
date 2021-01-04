<template>
  <div class="sm-component-text" :style="[customStyle, getBackgroundStyle, getTextColorStyle]">
    <span v-if="href">
      <a :target="target" :href="href" class="sm-component-text__href" :style="[getTextColorStyle]">{{ finalValue }}</a>
    </span>
    <span v-else class="sm-component-text__span">{{ finalValue }}</span>
  </div>
</template>

<script>
import Theme from '../_mixin/Theme';
import Timer from '../_mixin/Timer';
import ThirdService from '../_mixin/ThirdService';

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
      if (style.textAlign && !style.justifyContent) {
        const textAlign = style.textAlign;
        style.justifyContent = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
        delete style.textAlign;
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

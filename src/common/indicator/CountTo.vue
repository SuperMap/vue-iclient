<template>
  <span>
    <div
      v-for="(numVale, index) in numDataList"
      :key="index"
      class="sm-component-count-to__numItem"
      :style="[calNumBackground(numVale),numInterval,numStyle]"
    >
      <span>{{ numVale }}</span>
    </div>
  </span>
</template>

<script>
import countTo from 'vue-count-to';
import { isTransparent } from '../_utils/util';

export default {
  name: 'SmCountTo',
  extends: countTo,
  props: {
    fontSize: {
      type: [String, Number]
    },
    numBackground: {
      type: Object,
      default: function() {
        return { color: 'rgba(0, 0, 0, 0)', image: '', padding: 0 };
      }
    },
    numSpacing: {
      type: Number,
      default: 0
    },
    separatorBackground: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    calNumBackground() {
      return value => {
        if (!this.numBackground) {
          return {};
        }
        if (value && !this.separatorBackground && (value === this.separator || value === this.decimal)) {
          return {};
        }
        const reg = /\d+(\.\d+)?([a-z]+)/gi;
        const fontUnit = this.fontSize && isNaN(this.fontSize) ? this.fontSize.replace(reg, '$2') : 'px';
        let styleObj = { backgroundColor: this.numBackground.color, padding: this.numBackground.padding };
        if (this.numBackground.image) {
          styleObj = Object.assign(styleObj, {
            backgroundImage: `url(${this.numBackground.image})`,
            backgroundSize: '100% 100%'
          });
        }
        if (this.numBackground.image || !isTransparent(this.numBackground.color)) {
          styleObj = Object.assign(styleObj, {
            textIndent: `${parseFloat(this.fontSize) * 0.16}${fontUnit}`,
            letterSpacing: `${parseFloat(this.fontSize) * 0.16}${fontUnit}`
          });
        } else {
          styleObj = Object.assign(styleObj, {
            textIndent: `${parseFloat(this.fontSize) * 0.06}${fontUnit}`,
            letterSpacing: `${parseFloat(this.fontSize) * 0.06}${fontUnit}`
          });
        }

        return styleObj;
      };
    },
    numInterval() {
      return { marginRight: `${this.numSpacing}px` };
    },
    numStyle() {
      return { fontSize: this.fontSize };
    },
    numDataList() {
      return this.displayValue.split('').map(num => num);
    }
  },
  watch: {
    separator() {
      this.start();
    },
    decimals() {
      this.start();
    }
  }
};
</script>

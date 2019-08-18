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

export default {
  name: 'SmCountTo',
  extends: countTo,
  props: {
    fontSize: {
      type: [String, Number]
    },
    numBackground: {
      type: Object
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
        const fontUnit = this.fontSize ? this.fontSize.replace(reg, '$2') : '';
        return {
          backgroundImage: `url(${this.numBackground.image})`,
          backgroundSize: '100% 100%',
          backgroundColor: this.numBackground.color,
          textIndent: `${parseFloat(this.fontSize) * 0.15}${fontUnit}`,
          letterSpacing: `${parseFloat(this.fontSize) * 0.15}${fontUnit}`
        };
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
  }
};
</script>

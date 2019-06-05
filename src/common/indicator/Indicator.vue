<template>
  <div class="sm-component-indicator" :style="[getBackgroundStyle]">
    <div class="sm-component-indicator__head">
      <span
        class="sm-component-indicator__title"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ title }}</span>
    </div>
    <div class="sm-component-indicator__content">
      <span
        class="sm-component-indicator__num"
        :style="[numStyle, indicatorStyle]"
      >{{ numberSymbol }}</span>
      <span
        class="sm-component-indicator__unit"
        :style="[unit_titleStyle, getTextColorStyle]"
      >{{ unit }}</span>
    </div>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmIndicator',
  mixins: [Theme],
  props: {
    title: {
      type: String,
      default: '指标标题'
    },
    unit: {
      type: String,
      default: '单位'
    },
    indicatorColor: {
      type: String
    },
    fontSize: {
      type: [String, Number]
    },
    num: {
      type: [Number, String],
      default: 0
    }
  },
  computed: {
    numberSymbol() {
      let numberSymbol = this.num;
      if (this.isNumber(parseFloat(this.num))) {
        numberSymbol = this.addNumberSymbol(this.num);
      }
      return numberSymbol;
    },
    numStyle() {
      return { fontSize: this.fontSize };
    },
    unit_titleStyle() {
      const reg = /\d+(\.\d+)?([a-z]+)/gi;
      const fontUnit = this.fontSize ? this.fontSize.replace(reg, '$2') : '';
      return {
        fontSize: parseFloat(this.fontSize) * 0.66 + fontUnit
      };
    },
    indicatorStyle() {
      return (this.indicatorColor && { color: this.indicatorColor }) || this.getColorStyle(0);
    }
  },
  methods: {
    // 给数字添加千位符并对.N个0的小数取整
    addNumberSymbol(num) {
      num = num.toString();
      let index = num.lastIndexOf('.');
      let integer = num;
      let decimal = '';
      if (index > 0) {
        integer = num.substring(0, index);
        decimal = num.substring(index);
      }
      integer = integer.replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,');
      num = integer + decimal; // 整数 + .小数
      if (/\.0+$/.test(decimal)) {
        // 判断 小数 是否为.N个0的形式
        num = integer;
      }
      return num;
    },
    // 判断是纯数字
    isNumber(str) {
      return /^\d+$/.test(str);
    }
  }
};
</script>

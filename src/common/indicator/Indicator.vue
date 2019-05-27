<template>
  <div class="sm-widget-indicator" :style="[getBackgroundStyle]">
    <div class="sm-widget-indicator__head">
      <span class="sm-widget-indicator__title" :style="[getTextColorStyle]">{{ title }}</span>
    </div>
    <div class="sm-widget-indicator__content">
      <span class="sm-widget-indicator__num" :style="[indicatorStyle]">{{ numberSymbol }}</span>
      <span class="sm-widget-indicator__unit" :style="[getTextColorStyle]">{{ unit }}</span>
    </div>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';
import Control from '../../mapboxgl/_mixin/control';

export default {
  name: 'SmIndicator',
  mixins: [Control, Theme],
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
    indicatorStyle() {
      return (
        (this.indicatorColor && { color: this.indicatorColor }) ||
        this.getColorStyle(0)
      );
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

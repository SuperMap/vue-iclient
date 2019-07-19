<template>
  <div :ref="borderId" :style="borderStyle" class="borders">
    <!-- 组件 -->
    <div :style="contentStyle" class="content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';
import borderConfigs from './assets/border.config.json';
import UniqueId from 'lodash.uniqueid';

export default {
  name: 'SmBorder',
  mixins: [Theme],
  props: {
    // border的类型
    type: {
      type: [String],
      default: 'border1'
    }
  },
  data() {
    return {
      borderId: UniqueId(`${this.$options.name.toLowerCase()}-`),
      // content的位置大小
      position: { top: 0, left: 0, width: 0, height: 0 },
      // 上右下左的边距
      borderEdge: [],
      // border的宽度
      borderWidth: [],
      // border组件的宽高
      width: 0,
      height: 0
    };
  },
  computed: {
    borderStyle() {
      let borderImageSlice = this.borderWidth.join(' ') + ' fill';
      let borderWidth = this.borderWidth.join('px ') + 'px';
      let borderImage = require(`./assets/image/${this.type}.png`);
      return {
        borderWidth,
        // 当图片大小超过8KB, webpack就不会转换成base64, 直接引入时路径出错（此时的图片路径在index.html下？）
        // borderImage: `url(./assets/image/${this.type}.png)`,
        borderImage: 'url(' + borderImage + ') ' + borderImageSlice + ' / 1 / 0 stretch'
      };
    },
    contentStyle() {
      let contentStyle = Object.assign({}, this.position);
      for (let key in contentStyle) {
        contentStyle[key] = contentStyle[key] + 'px';
      }
      return contentStyle;
    }
  },
  watch: {
    // type变化了，需要读取对应的配置，重新计算位置大小
    type() {
      this.setPosition();
    }
  },
  mounted() {
    this.setPosition();
  },
  updated() {
    // 避免style.width< borderWidth，引起的dom重绘, 宽高会改变, 需要重新计算组件的位置大小
    this.calcPosition();
  },
  methods: {
    // 设置content的位置大小
    setPosition() {
      let borderConfig = borderConfigs[this.type];
      this.borderEdge = borderConfig.borderEdge;
      this.borderWidth = borderConfig.borderWidth;
      this.calcPosition();
    },
    // 计算content的top,left,width,height
    calcPosition() {
      // 设置总宽高
      this.setWidthHeight();
      const { top, left, bottom, right } = this.borderEdge;
      // 由于定位是相当于content-width来定位， 所以要减去border的宽度(left和 top)
      this.position.left = left - this.borderWidth[3];
      this.position.top = top - this.borderWidth[0];
      // 内容的宽度 = 总的宽度 - 总的边距
      this.position.width = this.width - left - right;
      this.position.height = this.height - top - bottom;
    },
    // 设置宽高
    setWidthHeight() {
      if (this.$refs[this.borderId]) {
        this.width = this.$refs[this.borderId].offsetWidth;
        this.height = this.$refs[this.borderId].offsetHeight;
      }
    }
  }
};
</script>
<style>
.borders {
  /* 默认的宽高 */
  /* width: 400px;
  height: 260px; */
  position: relative;
  box-sizing: border-box;
  border-style: solid;
  /* border-image-width: 1;
  border-image-outset: 0; */
  /* border-image-width: 1;
  border-image-outset: 0;
  border-image-repeat: stretch;
  border-width: 88px 138px 134px 130px;
  border-image: url(./image/border7.png);
  border-image-slice: 88 138 134 130; */
}
.content {
  position: absolute;
}
/* 选择content的后代 E>F */
.content > * {
  width: 100% !important;
  height: 100% !important;
}

.sm-component-chart .sm-component-card__content {
  width: 100% !important;
  height: 100% !important;
}
/* 去除阴影效果 */
.sm-component-card__content {
  box-shadow: none !important;
}
</style>

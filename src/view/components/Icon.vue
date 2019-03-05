<template>
  <div :class="[`icon-${position}`,'icon-container']" @click="iconClicked">
    <div :style="iconStyle" :class="{[`${iconClass}`]:!iconUrl,['auto-rotate']:autoRotate}"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      transform: null
    };
  },
  props: {
    iconUrl: {
      type: String
    },
    collapsed: {
      type: Boolean,
      default: true
    },
    autoRotate: {
      type: Boolean,
      default: true
    },
    iconClass: {
      type: String,
      default: "el-icon-back"
    },
    wayOfExpansion: {
      type: String,
      default: "click"
    },
    position: {
      type: String,
      default: "top-left"
    }
  },
  mounted() {
    this.$nextTick(() => {
      let controlContainer = this.$el.parentElement.children[0];
      if (!this.collapsed) {
        this.autoRotate && (this.transform = this.rotateDeg[this.position][1]);
        controlContainer.classList.add("mbgl-ctrl-click-in");
      } else {
        controlContainer.style.visibility = "visible";
      }
    });
  },
  methods: {
    iconClicked() {
      let controlContainer = this.$el.parentElement.children[0];
      controlContainer.style.visibility = "visible";
      this.autoRotate && (this.transform = this.rotateDeg[this.position][ this.collapsed ? 0 : 1 ]);
      controlContainer.classList.remove( `mbgl-ctrl-click-${this.collapsed ? "out" : "in"}` );
      controlContainer.classList.add( `mbgl-ctrl-click-${this.collapsed ? "in" : "out"}` );
      this.collapsed = !this.collapsed;
    }
  },
  computed: {
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    rotateDeg() {
      return {
        "top-right": ["rotate(-45deg)", "rotate(135deg)"],
        "top-left": ["rotate(-135deg)", "rotate(45deg)"],
        "bottom-left": ["rotate(135deg)", "rotate(-45deg)"],
        "bottom-right": ["rotate(45deg)", "rotate(-135deg)"]
      };
    }
  }
};
</script>
<style lang='scss'>
.mbgl-ctrl-click-in,
.mbgl-ctrl-click-out {
  transition: all 0.5s;
}
.mbgl-ctrl-click-in {
  transform: scale(0);
}
.mbgl-ctrl-click-out {
  transform: scale(1);
}
.mbgl-ctrl-transform-top-left,
.mbgl-ctrl-transform-bottom-left,
.mbgl-ctrl-transform-bottom-right,
.mbgl-ctrl-transform-top-right {
  visibility: hidden;
}
.mbgl-ctrl-transform-top-left {
  transform-origin: top left;
}
.mbgl-ctrl-transform-bottom-left {
  transform-origin: bottom left;
}
.mbgl-ctrl-transform-bottom-right {
  transform-origin: bottom right;
}
.mbgl-ctrl-transform-top-right {
  transform-origin: top right;
}
.icon-container {
  z-index: 1111;
  background: #fff;
  border: 1px solid #dcdfe6;
  visibility: visible;
  color: #606266;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  padding: 6px;
  font-size: 16px !important;
  &:hover {
    background: #fff;
    border-color: #409eff;
    color: #409eff;
  }
  & .auto-rotate {
    transform-origin: 50% 50%;
  }
  & div{
    display: block;
  }
  &.icon-top-left {
    position: absolute;
    top: 10px;
    left: 10px;
    & > .auto-rotate {
      transform: rotate(45deg);
    }
  }
  &.icon-top-right {
    position: absolute;
    top: 10px;
    right: 10px;
    & > .auto-rotate {
      transform: rotate(135deg);
    }
  }
  &.icon-bottom-left {
    position: absolute;
    bottom: 10px;
    left: 10px;
    & > .auto-rotate {
      transform: rotate(-45deg);
    }
  }
  &.icon-bottom-right {
    position: absolute;
    bottom: 10px;
    right: 10px;
    & > .auto-rotate {
      transform: rotate(-135deg);
    }
  }
}
</style>



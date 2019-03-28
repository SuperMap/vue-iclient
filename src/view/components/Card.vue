<template>
  <div class="sm-card">
    <div
      v-if="iconClass"
      :class="{['sm-card__icon']:true,['is-'+position]:true,[`is-click-${isShow?'out':'in'}`]:true,['is-header']:headerName}"
      @click="iconClicked"
    >
      <div
        :style="iconStyle"
        :class="{[iconClass]:true,['is-auto-rotate']:autoRotate,['sm-card__widget-icon']:true}"
      ></div>
    </div>
    <transition name="sm-zoom-in">
      <div
        :class="{['sm-card__content']:true,['is-header']:headerName,['is-'+position]:true,['is-icon']:iconClass}"
        v-show="isShow"
      >
        <div class="sm-card__header" v-if="headerName">
          <span class="sm-card__header-name">{{headerName}}</span>
        </div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  name: "SmCard",
  props: {
    iconPosition: {
      type: String,
      default: "top-left"
    },
    iconClass: {
      type: String
    },
    autoRotate: {
      type: Boolean,
      default: false
    },
    headerName: {
      type: String
    },
    collapsed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: true,
      transform: null
    };
  },
  methods: {
    iconClicked() {
      this.autoRotate &&
        (this.transform = this.rotateDeg[this.position][!this.isShow ? 0 : 1]);
      this.isShow = !this.isShow;
    }
  },
  computed: {
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    position() {
      let isControl =
        this.$parent.$parent &&
        ["smwebmap", "smmap"].includes(
          this.$parent.$parent.$options.name &&
            this.$parent.$parent.$options.name.toLowerCase()
        );
      if (this.headerName && !isControl) {
        return "top-left";
      } else {
        return this.iconPosition;
      }
    },
    rotateDeg() {
      return {
        "top-right": ["rotate(-45deg)", "rotate(135deg)"],
        "top-left": ["rotate(-135deg)", "rotate(45deg)"],
        "bottom-left": ["rotate(-135deg)", "rotate(45deg)"],
        "bottom-right": ["rotate(-45deg)", "rotate(135deg)"]
      };
    }
  }
};
</script>
<style lang="scss">
</style>

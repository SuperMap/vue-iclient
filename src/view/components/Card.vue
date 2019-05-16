<template>
  <div class="sm-widget-card">
    <div
      v-if="iconClass"
      :class="{['sm-widget-card__icon']:true,['is-'+position]:true,[`is-click-${isShow?'out':'in'}`]:true,['is-header']:headerName}"
      :style="[getBackgroundStyle, getTextColorStyle]"
      @click="iconClicked"
    >
      <div
        :style="[iconStyle]"
        :class="{[iconClass]:true,['is-auto-rotate']:autoRotate,['sm-widget-card__widget-icon']:true}"
      ></div>
    </div>
    <transition name="sm-widget-zoom-in">
      <div
        v-show="isShow"
        :class="{['sm-widget-card__content']:true,['is-header']:headerName,['is-'+position]:true,['is-icon']:iconClass}"
        :style="[getCardStyle]"
      >
        <div v-if="headerName" class="sm-widget-card__header" :style="[getBackgroundStyle, getTextColorStyle]">
          <span class="sm-widget-card__header-name">{{ headerName }}</span>
        </div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
import Theme from '../mixin/theme';
export default {
  name: 'SmCard',
  mixins: [Theme],
  props: {
    iconPosition: {
      type: String,
      default: 'top-left'
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
  computed: {
    getCardStyle() {
      const style = { background: 'transparent' };
      return !this.iconClass && !this.headerName ? style : this.getBackgroundStyle;
    },
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    position() {
      let isControl =
        this.$parent.$parent &&
        ['smwebmap', 'smmap'].includes(
          this.$parent.$parent.$options.name &&
            this.$parent.$parent.$options.name.toLowerCase()
        );
      if (this.headerName && !isControl) {
        return 'top-left';
      } else {
        return this.iconPosition;
      }
    },
    rotateDeg() {
      return {
        'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
        'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
        'bottom-left': ['rotate(-135deg)', 'rotate(45deg)'],
        'bottom-right': ['rotate(-45deg)', 'rotate(135deg)']
      };
    }
  },
  methods: {
    iconClicked() {
      this.autoRotate &&
        (this.transform = this.rotateDeg[this.position][!this.isShow ? 1 : 0]);
      this.isShow = !this.isShow;
    }
  }
};
</script>
<style lang="scss">
</style>

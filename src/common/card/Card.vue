<template>
  <div class="sm-component-card">
    <div
      v-if="iconClass"
      :class="{['sm-component-card__icon']:true,['is-'+position]:true,[`is-click-${isShow?'out':'in'}`]:true,['is-not-header']:!headerName}"
      :style="[getBackgroundStyle, getTextColorStyle, iconStyleObject]"
      @click="iconClicked"
    >
      <div
        :style="[iconStyle]"
        :class="{[iconClass]:true,['is-auto-rotate']:autoRotate,['sm-component-card__component-icon']:true}"
      ></div>
    </div>
    <transition
      name="sm-component-zoom-in"
      @after-leave="toggleTransition('leave')"
      @enter="toggleTransition('enter')"
    >
      <div
        v-show="isShow"
        :class="{['sm-component-card__content']:true,['is-not-header']:!headerName,['is-'+position]:true,['is-icon']:iconClass}"
        :style="[getCardStyle]"
      >
        <div
          v-if="headerName"
          class="sm-component-card__header"
          :style="[getBackgroundStyle, getTextColorStyle]"
        >
          <span class="sm-component-card__header-name">{{ headerName }}</span>
        </div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';

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
    iconStyleObject() {
      return {
        '--icon-color--hover': this.colorGroupsData[0]
      };
    },
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    position() {
      let isControl =
        this.$parent.$parent &&
        this.$parent.$parent.$options.name &&
        this.$parent.$parent.$options.name.toLowerCase() === 'smwebmap';
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
        'bottom-left': ['rotate(135deg)', 'rotate(-45deg)'],
        'bottom-right': ['rotate(45deg)', 'rotate(-135deg)']
      };
    },
    hasHeaderRotateDeg() {
      return {
        'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
        'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
        'bottom-left': ['rotate(-135deg)', 'rotate(45deg)'],
        'bottom-right': ['rotate(-45deg)', 'rotate(135deg)']
      };
    }
  },
  created() {
    this.iconClass && (this.isShow = this.collapsed);
    let rotateDeg = this.headerName ? this.hasHeaderRotateDeg : this.rotateDeg;
    this.autoRotate && (this.transform = rotateDeg[this.position][this.isShow ? 1 : 0]);
  },
  mounted() {
    this.toggleTransition(this.collapsed ? 'enter' : 'leave');
  },
  methods: {
    iconClicked() {
      let rotateDeg = this.headerName ? this.hasHeaderRotateDeg : this.rotateDeg;
      this.autoRotate && (this.transform = rotateDeg[this.position][!this.isShow ? 1 : 0]);
      this.isShow = !this.isShow;
      this.$emit('content-show-state', this.isShow);
    },
    toggleTransition(type) {
      const iconDom = this.$el.querySelector('.sm-component-card__icon');
      if (iconDom) {
        iconDom.style.position = type === 'leave' ? 'relative' : 'absolute';
      }
    }
  }
};
</script>
<style lang="scss">
</style>

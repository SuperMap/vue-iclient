<template>
  <div class="sm-component-collapse-card" :style="getTextColorStyle">
    <div
      v-if="iconClass"
      :class="{
        ['sm-component-collapse-card__icon']: true,
        ['is-' + position]: true,
        [`is-click-${isShow ? 'out' : 'in'}`]: true,
        ['is-not-header']: !headerName
      }"
      :style="[collapseCardHeaderBgStyle, headingTextColorStyle]"
      @click="iconClicked"
    >
      <i :style="iconStyle" :class="{ [iconClass]: true, ['is-auto-rotate']: autoRotate }" />
    </div>
    <transition name="sm-component-zoom-in" @after-leave="toggleTransition('leave')" @enter="toggleTransition('enter')">
      <div
        v-show="isShow"
        :class="{
          ['sm-component-collapse-card__content']: true,
          ['is-not-header']: !headerName,
          ['is-' + position]: true,
          ['is-icon']: iconClass
        }"
        :style="getCardStyle"
      >
        <div
          v-if="headerName"
          :class="{'sm-component-collapse-card__header': true, 'with-split-line': splitLine}"
          :style="[collapseCardHeaderBgStyle, headingTextColorStyle]"
        >
          <span class="sm-component-collapse-card__header-name">{{ headerName }}</span>
        </div>
        <div :style="getCardStyle" class="sm-component-collapse-card__body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import Theme from '../_mixin/Theme';

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
    },
    splitLine: {
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
      return !this.iconClass && !this.headerName ? style : this.collapseCardBackgroundStyle;
    },
    iconStyle() {
      return {
        transform: this.transform
      };
    },
    position() {
      return this.iconPosition;
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
  watch: {
    iconClass(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.isShow = !this.collapsed;
        this.toggleTransition(this.collapsed ? 'leave' : 'enter');
      } else if (!newVal) {
        // 如果iconClass 为空 则默认显示内容
        this.isShow = true;
      }
    },
    iconPosition() {
      this.resetIconTransform();
    }
  },
  created() {
    this.iconClass && (this.isShow = !this.collapsed);
    this.resetIconTransform();
  },
  mounted() {
    this.toggleTransition(this.collapsed ? 'leave' : 'enter');
  },
  methods: {
    iconClicked() {
      this.isShow = !this.isShow;
      this.resetIconTransform();
      this.$emit('content-show-state', this.isShow);
    },
    toggleTransition(type) {
      this.$nextTick(() => {
        const iconDom = this.$el.querySelector('.sm-component-collapse-card__icon');
        if (iconDom) {
          iconDom.style.position = type === 'leave' ? 'relative' : 'absolute';
        }
      });
    },
    resetIconTransform() {
      let rotateDeg = this.headerName ? this.hasHeaderRotateDeg : this.rotateDeg;
      this.autoRotate && (this.transform = rotateDeg[this.position][this.isShow ? 1 : 0]);
    }
  }
};
</script>
<style lang="scss"></style>

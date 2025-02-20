<template>
  <div class="sm-component-collapse-card" :style="getTextColorStyle">
    <div
      v-if="iconClass"
      :class="{
        ['sm-component-collapse-card__icon']: true,
        ['is-' + position]: true,
        [`is-click-${isShow ? 'out' : 'in'}`]: true,
        ['is-not-header']: !headerName,
        ['icon-box-shadow']: !isShow
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
          :class="{'sm-component-collapse-card__header': true, 'with-split-line': splitLine, ['is-' + position]: true}"
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

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useTheme } from '@supermapgis/common/hooks'

const props = defineProps({
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
    default: true
  }
});

const { getTextColorStyle, headingTextColorStyle, collapseCardHeaderBgStyle, collapseCardBackgroundStyle } = useTheme()

const isShow = ref(true);
const transform = ref(null);

// 计算属性
const getCardStyle = computed(() => {
  const style = { background: 'transparent' };
  return !props.iconClass && !props.headerName ? style : collapseCardBackgroundStyle;
});

const iconStyle = computed(() => {
  return {
    transform: transform.value
  };
});

const position = computed(() => props.iconPosition);

const rotateDeg = computed(() => {
  return {
    'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
    'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-left': ['rotate(135deg)', 'rotate(-45deg)'],
    'bottom-right': ['rotate(45deg)', 'rotate(-135deg)']
  };
});

const hasHeaderRotateDeg = computed(() => {
  return {
    'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
    'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-right': ['rotate(-45deg)', 'rotate(135deg)']
  };
});

// watch 监听
watch(() => props.iconClass, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    isShow.value = !props.collapsed;
    toggleTransition(props.collapsed ? 'leave' : 'enter');
  } else if (!newVal) {
    // 如果iconClass 为空 则默认显示内容
    isShow.value = true;
  }
});

watch(() => props.iconPosition, () => {
  resetIconTransform();
});

if (props.iconClass) {
  isShow.value = !props.collapsed;
}
resetIconTransform();

onMounted(() => {
  toggleTransition(props.collapsed ? 'leave' : 'enter');
});

function iconClicked() {
  isShow.value = !isShow.value;
  resetIconTransform();
  emit('content-show-state', isShow.value);
};

function toggleTransition(type) {
  nextTick(() => {
    const iconDom = document.querySelector('.sm-component-collapse-card__icon');
    if (iconDom) {
      // @ts-ignore
      iconDom.style.position = type === 'leave' ? 'relative' : 'absolute';
    }
  });
};

function resetIconTransform() {
  let rotateDegObj = props.headerName ? hasHeaderRotateDeg.value : rotateDeg.value;
  if (props.autoRotate) {
    transform.value = rotateDegObj[position.value][isShow.value ? 1 : 0];
  }
};

const emit = defineEmits(['content-show-state']);
</script>
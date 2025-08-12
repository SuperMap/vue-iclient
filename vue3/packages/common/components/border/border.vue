
<template>
  <div :ref="borderId" :style="borderStyle" class="sm-component-border">
    <div :style="contentStyle" class="sm-component-border__content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUpdated, onBeforeUnmount } from 'vue';
import borderConfigs from './assets/border.config.json';
import UniqueId from 'lodash.uniqueid';
import { addListener, removeListener } from 'resize-detector';
import { debounce } from 'lodash-es'
import { borderPropsDefault } from './types'
import type { BorderProps, BorderConfig } from './types'

defineOptions({
  name: 'SmBorder'
})

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

const props = withDefaults(defineProps<BorderProps>(), borderPropsDefault)

const borderId = ref(UniqueId('smborder-'));
const position = ref<Position>({ top: 0, left: 0, width: 0, height: 0 });
const borderEdge = ref<BorderConfig['borderEdge']>();
const borderWidth = ref<number[]>([]);
const width = ref(0);
const height = ref(0);
const borderEl = ref<HTMLElement | null>(null);

const borderConfig = computed(() => {
  if (!props.customBorder && props.type) {
    return borderConfigs[props.type];
  } else {
    return props.customBorder;
  }
});

const borderImage = computed(() => {
  if ((!props.customBorder || !props.customBorder.src) && props.type) {
    return new URL(`./assets/image/${props.type}.png`, import.meta.url).href;
  } else {
    return props.customBorder?.src || '';
  }
});

const borderStyle = computed(() => {
  const slice = borderWidth.value.join(' ') + ' fill';
  const width = borderWidth.value.join('px ') + 'px';
  return {
    borderWidth: width,
    borderImage: `url(${borderImage.value}) ${slice} / 1 / 0 stretch`
  };
});

const contentStyle = computed(() => {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(position.value)) {
    style[key] = `${value}px`;
  }
  return style;
});

const setPosition = (config = borderConfig.value) => {
  if (!config) return;
  borderEdge.value = config.borderEdge;
  borderWidth.value = config.borderWidth;
  calcPosition();
};

const calcPosition = () => {
  setWidthHeight();
  if (!borderEdge.value) return;
  
  const { top, left, bottom, right } = borderEdge.value;
  position.value.left = left - borderWidth.value[3];
  position.value.top = top - borderWidth.value[0];
  position.value.width = width.value - left - right;
  position.value.height = height.value - top - bottom;
};

const setWidthHeight = () => {
  if (borderEl.value) {
    width.value = borderEl.value.offsetWidth;
    height.value = borderEl.value.offsetHeight;
  }
};

const resizeHandler = debounce(calcPosition, 500);

watch(() => props.type, setPosition);

onMounted(() => {
  setPosition();
  if (borderEl.value) {
    addListener(borderEl.value, resizeHandler);
  }
});

onUpdated(calcPosition);

onBeforeUnmount(() => {
  if (borderEl.value) {
    removeListener(borderEl.value, resizeHandler);
  }
});
</script>

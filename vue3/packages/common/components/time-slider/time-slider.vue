<template>
  <div class="sm-component-time-slider" dir="ltr" :style="[gisControlBgStyle, newThemeStyle]">
    <button class="sm-play-control sm-button sm-paused" :style="{ color, ...newThemeStyle }" @click="changePlayState">
      <i :class="['sm-icon-play', playState ? 'sm-components-icon-zanting' : 'sm-components-icon-bofang3']" />
    </button>
    <div class="sm-progress-control-wrapper" :style="lineStyleHeight">
      <div :class="['sm-progress-control', uniqueId]" :style="{ ...lineStyle, ...lineStyleHeight }"
        @click="handleMouseClick">
        <div class="sm-progress-holder">
          <div class="sm-load-progress" :style="{ width: sliderBarWidth }"></div>
          <div class="sm-mouse-display" :style="{ left: mouseLeft + 'px' }">
            <div v-show="mouseCurrent" class="sm-time-tooltip">
              <span class="sm-time-tooltip-content">{{ mouseCurrent }}</span>
            </div>
          </div>
          <div class="sm-play-progress sm-slider-bar" :style="{ ...playProgressStyle, width: sliderBarWidth }"></div>
          <div v-show="showLabel" class="sm-time-node" :style="newLabelStyle">
            <div class="sm-start-node">{{ startFormat }}</div>
            <div class="sm-end-node">{{ endFormat }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type {
  TimeSliderProps,
  TimeSliderEmits
} from './types';
import { timeSliderPropsDefault } from './types'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import interact from 'interactjs';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'
import { uniqueId as UniqueId } from 'lodash-es';

dayjs.extend(duration);

const props = withDefaults(defineProps<TimeSliderProps>(), timeSliderPropsDefault)
const emit = defineEmits(['timeplayerchanged', 'playing', 'pause', 'end', 'timeplayerplaychanged']) as unknown as TimeSliderEmits
const { textColorStyle, gisControlBgStyle, colorPrimary } = useTheme(props)

// 定义响应式数据
const mouseTime = ref<string | number>(0);
const mouseLeft = ref(0);
const currentTime = ref(0);
const playState = ref(false);
const sliderBarWidth = ref('0%');
const draggable = ref(false);
const updateInterval = ref<any>(null);
const rafIds_ = ref<Set<any>>(new Set());
const namedRafs_ = ref<any>();
const uniqueId = ref(UniqueId(`${'SmTimeSlider'.toLowerCase()}-`));
// 计算属性
const color = computed(() => colorPrimary.value);
const showLabel = computed(() => {
  if (!props.label || !Object.prototype.hasOwnProperty.call(props.label, 'show')) {
    return true;
  }
  return props.label.show;
});
const formatter = computed(() => (props.label || {}).formatter);
const newThemeStyle = computed(() => Object.assign(props.themeStyle || {}));
const newLabelStyle = computed(() => {
  const labelStyle = { color: textColorStyle, ...props.label };
  delete labelStyle.formatter;
  return Object.assign(labelStyle || {});
});
const isDataDuration = computed(() => !props.duration);
const startValue = computed(() => (isDataDuration.value ? props.data[0] : 0));
const endValue = computed(() => {
  if (!isDataDuration.value) {
    return props.duration;
  }
  const length = props.data.length;
  if (length < 1) {
    return '';
  }
  const end = props.data[length - 1];
  return end;
});
const startFormat = computed(() => {
  if (startValue.value === void 0) {
    return '';
  }
  return formatTime(startValue.value);
});
const endFormat = computed(() => formatTime(endValue.value));
const UPDATE_REFRESH_INTERVAL = computed(() => props.playInterval / 30);
const playbackRate = computed(() => {
  if (!isDataDuration.value) {
    return UPDATE_REFRESH_INTERVAL.value;
  }
  if (!props.data || props.data.length < 2) {
    return 0;
  }
  const length = props.data.length;
  const totalInterval = props.playInterval * (length - 1);
  const rate = dataDuration.value / (totalInterval / UPDATE_REFRESH_INTERVAL.value);
  return rate * 1000;
});
const mouseCurrent = computed(() => {
  if (isDataDuration.value && (!props.data || props.data.length === 0)) {
    return '';
  }
  const current = mouseTime.value + startValue.value;
  return formatTime(current);
});
const lineStyleHeight = computed(() => {
  if (props.lineStyle && Object.prototype.hasOwnProperty.call(props.lineStyle, 'height')) {
    return { height: props.lineStyle.height };
  }
  return { height: '6px' };
});
const sliderBarSize = computed(() => {
  const height: number = parseFloat(lineStyleHeight.value.height);
  return height <= 6 ? height * 2 : height * 1.5;
});
const playProgressStyle = computed(() => {
  const checkpointStyle = Object.assign(
    { 'border-color': color.value, background: color.value },
    props.checkpointStyle || {}
  );

  if (checkpointStyle && checkpointStyle.background) {
    return { background: checkpointStyle.background };
  }
  return {};
});
const checkPointStyle = computed(() => {
  let style = '';
  for (let key in props.checkpointStyle) {
    style += `${key}: ${props.checkpointStyle[key]} !important;`;
  }
  return style;
});
const dataDuration = computed(() => {
  if (isDataDuration.value) {
    const data = props.data || [];
    const start = parseInt(data[0]) || 0;
    const end = data.length > 1 ? parseInt(data[data.length - 1]) : start;
    return end - start || 0;
  }
  return 0;
});

// Methods
const bindMouseMove = (eventName, fn, className = uniqueId.value) => {
  const el = document.getElementsByClassName(className)[0];
  if (draggable.value) {
    el.removeEventListener(eventName, fn);
  } else {
    el.addEventListener(eventName, fn);
  }
};

const bindDrag = (className) => {
  interact(`.${className}`).draggable({
    startAxis: 'x',
    lockAxis: 'x',
    enabled: true,
    inertia: true,
    modifiers: [
      interact.modifiers.restrict({
        restriction: 'self'
      })
    ],
    cursorChecker: () => 'pointer',
    listeners: {
      start: () => { draggable.value = true; },
      move: (event) => { if (draggable.value) handleDragMove(event); },
      end: () => { draggable.value = false; }
    }
  });
};

const changePlayState = () => {
  playState.value = !playState.value;
  playState.value ? emitPlaying() : emitPause();
}

const updateDom = () => {
  // if (!$el) return '';
  const progress = getProgress();
  if (!draggable.value) {
    requestNamedAnimationFrame('Slider#update', () => {
      sliderBarWidth.value = (progress * 100).toFixed(2) + '%';
    });
  }
  sliderBarWidth.value = (progress * 100).toFixed(2) + '%';
  return progress;
};

const handleMouseClick = (event, offsetX) => {
  const newTime = getCurrentTime_(event, offsetX);
  setCurrentTime(newTime);
  handleMouseMove(event, offsetX);
  if (playState.value) {
    setTimeout(updateDom, 1000);
  } else {
    updateDom();
  }
};

const handleMouseMove = (event, offsetX) => {
  const newTime = getCurrentTime_(event, offsetX);
  mouseTime.value = newTime;
  mouseLeft.value = event.offsetX || offsetX * getTotalDistance();
};

const handleDragMove = (event) => {
  const totalDistance = getTotalDistance();
  const distance = event.dx / totalDistance + getProgress();
  handleMouseClick(event, distance);
  handleMouseMove(event, distance);
};

const setCurrentTime = (time) => {
  if (typeof time !== 'undefined') {
    if (time < 0) time = 0;
    currentTime.value = isDataDuration.value ? time * 1000 : time;
  }
};

const getTotalDistance = (className = uniqueId.value) => {
  // @ts-ignore
  return document.getElementsByClassName(className)[0].offsetWidth;
};

const getProgress = () => {
  return Number(clamp(getPercent(), 0, 1).toFixed(4));
};

const getPercent = () => {
  if (isDataDuration.value) {
    const currentTimeValue = currentTime.value / 1000;
    return currentTimeValue / dataDuration.value;
  }
  return currentTime.value / props.duration;
};

const getCurrentTime_ = (event, percent) => {
  const distance = event.offsetX;
  const totalDistance = getTotalDistance();
  percent = percent || distance / totalDistance;
  percent = Math.min(1, Math.max(0, percent));
  let newTime = percent * (isDataDuration.value ? dataDuration.value : props.duration);
  return newTime === Infinity ? '' : newTime;
};

const clamp = (number, min, max) => {
  number = Number(number);
  return Math.min(max, Math.max(min, isNaN(number) ? min : number));
};

const enableInterval_ = () => {
  console.log('进入paly监听')
  playState.value = true;
  if (updateInterval.value) return;

  updateInterval.value = setInterval(() => {
    currentTime.value += playbackRate.value;

    if (isDataDuration.value) {
      currentTime.value = currentTime.value / 1000 >= dataDuration.value
        ? dataDuration.value * 1000
        : currentTime.value;
    } else {
      currentTime.value = currentTime.value >= props.duration
        ? props.duration
        : currentTime.value;
    }
    updateDom();
  }, UPDATE_REFRESH_INTERVAL.value);
};

const disableInterval_ = () => {
  if (!updateInterval.value) return;
  clearInterval(updateInterval.value);
  updateInterval.value = null;
  playState.value = false;
};

const requestAnimationFrame = (fn: Function) => {
  let id: number;
  const wrappedFn = () => fn();

  id = window.requestAnimationFrame(() => {
    if (rafIds_.value.has(id)) {
      rafIds_.value.delete(id);
    }
    wrappedFn();
  });
  rafIds_.value.add(id);
  return id;
};

const requestNamedAnimationFrame = (name: string, fn: Function) => {
  if (!namedRafs_.value) {
    namedRafs_.value = {};
  }
  const id = requestAnimationFrame(() => {
    fn();
    if (Object.prototype.hasOwnProperty.call(namedRafs_.value, name)) {
      delete namedRafs_.value[name];
    }
  });
  namedRafs_.value[name] = id;
  return name;
};

const formatTime = (timestamp: number) => {
  if (formatter.value) return formatter.value(timestamp);

  const defaultFormat = isDataDuration.value ? 'YYYY-MM-DD HH:mm:ss' : 'HH:mm:ss';
  const date = isDataDuration.value
    ? timestamp2Date(timestamp)
    : duration2Date(props.duration);

  return dayjs(date, defaultFormat).isValid() ? date : timestamp;
};

const timestamp2Date = (timestamp: number) => {
  return timestamp ? dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '';
};

const duration2Date = (duration: number) => {
  const $moment = dayjs.duration(duration, 'milliseconds');
  const hours = getZeroPlaceholder($moment.hours());
  const minutes = getZeroPlaceholder($moment.minutes());
  const seconds = getZeroPlaceholder($moment.seconds());
  return [hours, minutes, seconds].join(':');
};

const getZeroPlaceholder = (val: number) => {
  if (val === 0) {
    return '00';
    // @ts-ignore
  } else if (parseInt(val / 10) <= 0) {
    return `0${val}`;
  } else {
    return val;
  }
};

const modifySliderBarStyle = (style, ruleName = `.${uniqueId.value}::before`) => {
  // @ts-ignore
  document.styleSheets[0].addRule(ruleName, style);
};

const emitPlaying = () => {
  emit('playing');
  enableInterval_();
};

const emitPause = () => {
  emit('pause');
  disableInterval_();
};

const emitEnd = () => {
  emit('end');
  disableInterval_();
};

const emitTimePlayerPlay = () => {
  emit('timeplayerplaychanged');
  return playState.value;
};

const timePlayerChange = () => {
  const currentTimeStamp = currentTime.value + startValue.value * 1000;
  if (isDataDuration.value) {
    const lastIndex: number = props.data.findIndex((val, index) => {
      if (index < props.data.length - 1) {
        const nextData = props.data[index + 1];
        const timestamp = val * 1000;
        const nextTimestamp = nextData * 1000;
        if (timestamp <= currentTimeStamp && nextTimestamp > currentTimeStamp) return true;
      }
      return false;
    });
    const nextIndex = lastIndex === -1 ? -1 : lastIndex + 1 <= props.data.length ? lastIndex + 1 : lastIndex;
    return { currentTimeStamp, lastIndex, nextIndex };
  } else {
    return { currentDuration: currentTimeStamp };
  }
};

const init = () => {
  props.autoPlay ? emitPlaying() : emitPause();
};

// Watchers
watch(() => draggable.value, () => {
  bindMouseMove('mousemove', handleMouseMove);
  bindMouseMove('click', handleMouseClick);
});

watch(() => sliderBarWidth.value, () => {
  const left = sliderBarWidth.value === '100.00%' ? `calc(100% - ${sliderBarSize.value}px)` : sliderBarWidth.value;
  modifySliderBarStyle(`left:${left} !important`);
});

watch(() => lineStyleHeight.value, () => {
  modifySliderBarStyle(`width:${sliderBarSize.value}px !important;height:${sliderBarSize.value}px !important`);
});

watch(() => props.checkpointStyle, () => {
  modifySliderBarStyle(checkPointStyle.value);
}, { immediate: true });

watch(() => currentTime.value, () => {
  if (
    (isDataDuration.value && currentTime.value >= dataDuration.value * 1000) ||
    (!isDataDuration.value && currentTime.value >= props.duration)
  ) {
    if (!props.loop) {
      updateDom();
      emitEnd();
    } else if (props.loop && playState.value) {
      currentTime.value = 0;
    }
  }
  const result = timePlayerChange();
  emit('timeplayerchanged', result);
}, { immediate: true });

watch(() => props.autoPlay, () => {
  props.autoPlay ? emitPlaying() : emitPause();
}, { immediate: true });

watch(() => playState.value, () => {
  emitTimePlayerPlay();
}, { immediate: true });

onMounted(() => {
  nextTick(() => bindDrag(uniqueId.value));
  bindMouseMove('mousemove', handleMouseMove);
  bindMouseMove('click', handleMouseClick);
  init();
});

</script>
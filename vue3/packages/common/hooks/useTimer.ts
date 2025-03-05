import type { TimerProps } from '@supermapgis/common/utils/index.common'
import { ref, watch, onBeforeUnmount } from 'vue';

export interface TimerCallback {
  timing: () => void;
  startTimer?: () => void;
  closeTimer?: () => void;
}

export function useTimer(props: TimerProps & { [k: string]: any }, timerCallback: TimerCallback) {
  const timer = ref<number>(null);

  const _start = () => {
    const time = 1000 * (Number(props.frequency) || 3);
    timerCallback.startTimer?.();
    timer.value = setInterval(timerCallback.timing, time);
  };

  const _close = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    timerCallback.closeTimer?.();
  };

  const resetTimer = () => {
    _close();
    _start();
  };

  // 监听逻辑
  watch(() => props.startTiming, (newVal) => {
    newVal ? _start() : _close();
  }, { immediate: true });

  watch(() => props.frequency, () => {
    if (props.startTiming) resetTimer();
  });

  // 生命周期
  onBeforeUnmount(() => {
    props.startTiming && _close();
  });

}
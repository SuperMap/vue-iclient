import { ref, watch, onBeforeUnmount } from 'vue';

export function useTimer(props, callback) {
  const timer = ref<any>(null);

  const startTimer = callback.startTimer || (() => { });
  const timing = callback.timing || (() => { });
  const closeTimer = callback.closeTimer || (() => { });

  const _start = () => {
    const time = 1000 * (Number(props.frequency) || 3);
    startTimer();
    timer.value = setInterval(timing, time);
  };

  const _close = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    closeTimer();
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
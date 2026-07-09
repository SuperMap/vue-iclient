import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash.debounce';

/**
 * Resize Mixin - 响应式监听
 */
export default {
  data() {
    return {
      resizeCallback: null
    };
  },
  methods: {
    addResizeListener(el, callback) {
      if (this.resizeCallback) {
        this.resizeCallback.cancel();
      }
      this.resizeCallback = debounce(el => {
        requestAnimationFrame(() => callback(el));
      }, 100, { leading: false, trailing: true });
      if (el) {
        addListener(el, this.resizeCallback);
      }
    },

    removeResizeListener(el) {
      if (el && this.resizeCallback) {
        removeListener(el, this.resizeCallback);
        this.resizeCallback.cancel();
        this.resizeCallback = null;
      }
    }
  }
};
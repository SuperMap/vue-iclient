import { addListener, removeListener } from 'resize-detector';

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
      this.resizeCallback = el => callback(el);
      if (el) {
        addListener(el, this.resizeCallback);
      }
    },

    removeResizeListener(el) {
      if (el && this.resizeCallback) {
        // resize-detector 不直接提供 removeListener
        // 如果需要，可以在组件销毁时清理监听器
        removeListener(el, this.resizeCallback);
        this.resizeCallback = null;
      }
    }
  }
};

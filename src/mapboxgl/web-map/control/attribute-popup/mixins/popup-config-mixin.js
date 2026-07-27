/**
 * Popup Config Mixin - 弹窗配置计算属性
 */
export default {
  computed: {
    popupStyle() {
      // backgroundColor TODO
      const { autoResize, maxWidth, maxHeight, width, height, keyWordWrap, valueWordWrap, ...params } =
        this.popupConfigValue || {};
      return params;
    },
    popupWidth() {
      const { autoResize, maxWidth, width } = this.popupConfigValue || {};
      if (!autoResize) {
        return { width };
      }
      return { maxWidth, width };
    },
    popupHeight() {
      const { autoResize, maxHeight, height } = this.popupConfigValue || {};
      if (!autoResize) {
        return { height };
      }
      // autoResize 只限制最大高度，高度由内容自然撑开；
      // 不要用 scrollHeight 回写 height，否则会与子元素 height:100% 形成抬高循环
      return height ? { maxHeight, height } : { maxHeight };
    },
    ellipsisStyle() {
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      };
    },
    attributeStyle() {
      const { keyWordWrap, valueWordWrap } = this.popupConfigValue || {};
      const style = { keyStyle: {}, valueStyle: {} };
      if (keyWordWrap === 'ellipsis') {
        style.keyStyle = { ...this.ellipsisStyle, height: '22px' };
      }
      if (valueWordWrap === 'ellipsis') {
        style.valueStyle = { ...this.ellipsisStyle };
      }
      return style;
    }
  }
};

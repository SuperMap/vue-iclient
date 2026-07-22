/**
 * Popup Config Mixin - 弹窗配置计算属性
 */
export default {
  computed: {
    popupStyle() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      return { maxHeight, height: height || this.contentHeight };
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

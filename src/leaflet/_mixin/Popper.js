export default {
  props: {
    content: {
      type: String,
      default: null,
      custom: true
    }
  },
  data() {
    return {
      isMap: false
    };
  },
  mounted() {
    this.popperOptions = {};
  },
  render(h) {
    if (this.$slots.default) {
      // 如果是其他bindpopup的layer，不要绑定style
      let style = this.isMap ? { style: { display: 'none' } } : {};
      return h('div', style, this.$slots.default);
    }
    return null;
  }
};

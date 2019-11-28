export default {
  props: {
    content: {
      type: String,
      default: null,
      custom: true
    }
  },
  mounted() {
    this.popperOptions = {};
  },
  render(h) {
    if (this.$slots.default) {
      return h('div', this.$slots.default);
    }
    return null;
  }
};

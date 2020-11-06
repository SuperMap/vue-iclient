<script lang="ts">
import { VNode } from 'vue';
import Theme from '../_mixin/theme';
import Layout from 'ant-design-vue/es/layout';
import { objectWithoutProperties } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  data() {
    return {
      suffix: 'layout',
      tagNameData: 'section',
      subComponentName: ''
    };
  },
  computed: {
    layoutProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: `sm-component-${this.suffix}`,
        tagName: this.tagNameData
      });
    },
    layoutListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    const Component = !this.subComponentName ? Layout : Layout[this.subComponentName];
    return h(
      Component,
      {
        props: this.layoutProps,
        on: this.layoutListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>

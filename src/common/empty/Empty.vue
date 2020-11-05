<script lang="ts">
import { VNode } from 'vue';
import Empty, { EmptyProps } from 'ant-design-vue/es/empty/index';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const emptyProps = {
  ...EmptyProps(),
  image: VueTypes.any.def(require('./assets/image/empty.png'))
};

export default {
  name: 'SmEmpty',
  mixins: [Theme],
  inheritAttrs: false,
  props: emptyProps,
  computed: {
    emptyProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-empty' });
    }
  },
  render(h): VNode {
    return h(
      Empty,
      {
        props: this.emptyProps,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>

<script lang="ts">
import Breadcrumb from 'ant-design-vue/es/breadcrumb/Breadcrumb';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';
import { VNode } from 'vue';

export const breadcrumbTypes = {
  routes: VueTypes.array,
  params: VueTypes.object,
  separator: VueTypes.any,
  itemRender: VueTypes.any
};

export default {
  name: 'SmBreadcrumb',
  mixins: [Theme],
  props: breadcrumbTypes,
  computed: {
    breadcrumbProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-breadcrumb' });
    },
    breadcrumbListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      Breadcrumb,
      {
        props: this.breadcrumbProps,
        scopedSlots: this.$scopedSlots,
        on: this.breadcrumbListeners
      },
      this.$slots['default']
    );
  }
};
</script>

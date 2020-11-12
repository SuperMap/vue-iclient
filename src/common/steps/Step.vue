<script lang="ts">
import { Step } from 'ant-design-vue/es/vc-steps';
import { VNode } from 'vue';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const stepTypes = {
  prefixCls: VueTypes.string,
  wrapperStyle: VueTypes.object,
  itemWidth: VueTypes.string,
  active: VueTypes.bool,
  disabled: VueTypes.bool,
  status: VueTypes.string,
  iconPrefix: VueTypes.string,
  icon: VueTypes.any,
  adjustMarginRight: VueTypes.string,
  stepNumber: VueTypes.string,
  stepIndex: VueTypes.number,
  description: VueTypes.any,
  title: VueTypes.any,
  subTitle: VueTypes.any,
  progressDot: VueTypes.oneOfType([VueTypes.bool, VueTypes.func]),
  tailContent: VueTypes.any,
  icons: VueTypes.any
};

export default {
  name: 'SmStep',
  mixins: [Theme],
  props: stepTypes,
  computed: {
    stepProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    stepListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      Step,
      {
        props: this.stepProps,
        scopedSlots: this.$scopedSlots,
        on: this.stepListeners
      },
      this.$slots['default']
    );
  }
};
</script>

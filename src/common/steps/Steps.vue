<script lang="ts">
import Steps from 'ant-design-vue/es/steps';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const stepTypes = {
  current: VueTypes.number,
  initial: VueTypes.number,
  labelPlacement: VueTypes.oneOf(['horizontal', 'vertical']).def('horizontal'),
  status: VueTypes.oneOf(['wait', 'process', 'finish', 'error']),
  size: VueTypes.oneOf(['default', 'small']),
  direction: VueTypes.oneOf(['horizontal', 'vertical']),
  progressDot: VueTypes.oneOfType([VueTypes.bool, VueTypes.func]),
  type: VueTypes.oneOf(['default', 'navigation'])
};

export default {
  name: 'SmSteps',
  defaultComponent: Steps,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'current',
    event: 'change'
  },
  props: stepTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        change: function (value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>

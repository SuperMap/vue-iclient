<script lang="ts">
import Steps from 'ant-design-vue/es/steps';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
  defaultComponent: Steps.Step,
  mixins: [Theme, AntdRender],
  props: stepTypes
};
</script>

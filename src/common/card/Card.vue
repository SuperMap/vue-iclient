<script lang="ts">
import Card from 'ant-design-vue/es/card/Card';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const cardTypes = {
  prefixCls: VueTypes.string,
  title: VueTypes.any,
  extra: VueTypes.any,
  bordered: VueTypes.bool.def(true),
  bodyStyle: VueTypes.object,
  headStyle: VueTypes.object,
  loading: VueTypes.bool.def(false),
  hoverable: VueTypes.bool.def(false),
  type: VueTypes.string,
  size: VueTypes.oneOf(['default', 'small']),
  actions: VueTypes.any,
  tabList: VueTypes.array,
  tabBarExtraContent: VueTypes.any,
  activeTabKey: VueTypes.string,
  defaultActiveTabKey: VueTypes.string
};

export default {
  name: 'SmCard',
  defaultComponent: Card,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: cardTypes
};
</script>

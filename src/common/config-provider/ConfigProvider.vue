<script lang="ts">
import ConfigProvider from 'ant-design-vue/es/config-provider';
import { CreateElement } from 'vue';
import { getComponentFromProp } from 'ant-design-vue/es/_util/props-util';
import defaultRenderEmpty from 'vue-iclient/src/common/empty/RenderEmpty';

export default {
  name: 'SmConfigProvider',
  mixins: [ConfigProvider],
  methods: {
    renderEmptyComponent: function renderEmptyComponent(h: CreateElement, name: string) {
      const renderEmpty = getComponentFromProp(this, 'renderEmpty', {}, false) || defaultRenderEmpty;
      return renderEmpty(h, name);
    },
    getPrefixCls: function getPrefixCls(suffixCls, customizePrefixCls) {
      const _$props$prefixCls = this.$props.prefixCls;
      const prefixCls = _$props$prefixCls === undefined ? 'sm-component' : _$props$prefixCls;
      if (customizePrefixCls) return customizePrefixCls;
      return suffixCls ? prefixCls + '-' + suffixCls : prefixCls;
    }
  }
};

export const ConfigConsumerProps = {
  getPrefixCls: function getPrefixCls(suffixCls, customizePrefixCls) {
    if (customizePrefixCls) return customizePrefixCls;
    return 'sm-component-' + suffixCls;
  },
  renderEmpty: defaultRenderEmpty
};
</script>

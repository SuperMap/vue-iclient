<script lang="ts">
import { VNode } from 'vue';
import Switch from 'ant-design-vue/es/switch';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const switchTypes = {
  autoFocus: VueTypes.bool,
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  checkedChildren: VueTypes.any,
  unCheckedChildren: VueTypes.any,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  tabIndex: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  disabled: VueTypes.bool,
  loading: VueTypes.bool
};

export default {
  name: 'SmSwitch',
  __ANT_SWITCH: true,
  components: {
    // Switch 属于保留字段 不能作为组件的 id
    SwitchElement: Switch
  },
  mixins: [Theme],
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: switchTypes,
  computed: {
    switchProps() {
      const props = objectWithoutProperties({ ...this.$props, ...this.$attrs });
      return Object.assign(props, { prefixCls: 'sm-component-switch' });
    },
    switchStyle() {
      const style = {
        '--normal-bg-color': this.switchBackgroundData
      };
      if (this.disabled || this.loading) {
        style['--disabled-bg-color'] = this.switchDisabledBgColorData;
        style['--disabled-after-color'] = this.switchDisabledAfterColorData;
        style['--disabled-opacity'] = this.switchDisabledOpacityData;
        style['--disabled-inner-opacity'] = this.switchDisabledOpacityData >= 1 ? 0.4 : 1;
      }
      return style;
    },
    switchListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        // 这里确保组件配合 `v-model` 的工作
        'change.value': function(value) {
          vm.$emit('change.value', value);
        }
      });
    }
  },
  render(h): VNode {
    return h(Switch, {
      props: this.switchProps,
      on: this.switchListeners,
      scopedSlots: this.$scopedSlots,
      style: this.switchStyle
    });
  }
};
</script>

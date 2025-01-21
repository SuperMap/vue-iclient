<script lang="ts">
import RadioGroup from 'ant-design-vue/es/radio/Group';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const radioGroupTypes = {
  defaultValue: VueTypes.any,
  value: VueTypes.any,
  disabled: VueTypes.bool,
  name: VueTypes.string,
  options: VueTypes.array,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']).def('default'),
  buttonStyle: VueTypes.string.def('outline')
};

export default {
  name: 'SmRadioGroup',
  defaultComponent: RadioGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'input'
  },
  props: radioGroupTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        input: function(value) {
          vm.$emit('input', value);
        }
      };
    },
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-radio-group-middle': this.size === 'middle'
      };
    }
  }
};
</script>

<script lang="ts">
import TimePicker, { TimePickerProps } from 'ant-design-vue/es/time-picker';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const timepickerTypes = {
  ...TimePickerProps,
  align: {
    type: Object,
    default: () => ({ points: ['tl', 'bl'], offset: [0, 4] })
  },
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
};

export default {
  name: 'SmTimePicker',
  defaultComponent: TimePicker,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: timepickerTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-time-picker-md': this.size === 'middle'
      };
    },
    extralListeners() {
      const vm = this;
      return {
        change: function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>

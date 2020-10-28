<script lang="ts">
import { VNode } from 'vue';
import DatePicker from 'ant-design-vue/es/date-picker';
import { RangePickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const rangePickerTypes = {
  ...RangePickerProps()
};

export default {
  name: 'SmRangePicker',
  mixins: [Base],
  props: rangePickerTypes,
  render(h): VNode {
    return h(
      DatePicker.RangePicker,
      {
        props: this.datePickerProps,
        on: this.datePickerListeners,
        scopedSlots: this.$scopedSlots,
        style: this.datePickerStyle
      },
      this.$slots['default']
    );
  }
};
</script>

<script lang="ts">
import { VNode } from 'vue';
import DatePicker from 'ant-design-vue/es/date-picker';
import { MonthPickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const monthPickerTypes = {
  ...MonthPickerProps()
};

export default {
  name: 'SmMonthPicker',
  mixins: [Base],
  props: monthPickerTypes,
  render(h): VNode {
    return h(
      DatePicker.MonthPicker,
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

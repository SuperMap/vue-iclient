<script lang="ts">
import { VNode } from 'vue';
import DatePicker from 'ant-design-vue/es/date-picker';
import { DatePickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const datePickerTypes = {
  ...DatePickerProps()
};

export default {
  name: 'SmDatePicker',
  mixins: [Base],
  props: datePickerTypes,
  render(h): VNode {
    return h(
      DatePicker,
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

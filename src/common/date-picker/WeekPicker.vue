<script lang="ts">
import { VNode } from 'vue';
import DatePicker from 'ant-design-vue/es/date-picker';
import { WeekPickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const weekPickerTypes = {
  ...WeekPickerProps()
};

export default {
  name: 'SmWeekPicker',
  mixins: [Base],
  props: weekPickerTypes,
  render(h): VNode {
    return h(
      DatePicker.WeekPicker,
      {
        props: this.datePickerProps,
        on: this.datePickerListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>

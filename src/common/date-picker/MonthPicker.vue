<script lang="ts">
import DatePicker from 'ant-design-vue/es/date-picker';
import { MonthPickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const monthPickerTypes = {
  ...MonthPickerProps()
};

export default {
  name: 'SmMonthPicker',
  defaultComponent: DatePicker.MonthPicker,
  mixins: [Base],
  props: monthPickerTypes
};
</script>

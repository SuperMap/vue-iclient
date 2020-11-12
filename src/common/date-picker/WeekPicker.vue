<script lang="ts">
import DatePicker from 'ant-design-vue/es/date-picker';
import { WeekPickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const weekPickerTypes = {
  ...WeekPickerProps()
};

export default {
  name: 'SmWeekPicker',
  defaultComponent: DatePicker.WeekPicker,
  mixins: [Base],
  props: weekPickerTypes
};
</script>

<script lang="ts">
import DatePicker from 'ant-design-vue/es/date-picker';
import { WeekPickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const weekPickerTypes = {
  ...WeekPickerProps(),
  align: {
    type: Object,
    default: () => ({ points: ['tl', 'bl'], offset: [0, 4] })
  }
};

export default {
  name: 'SmWeekPicker',
  defaultComponent: DatePicker.WeekPicker,
  mixins: [Base],
  props: weekPickerTypes
};
</script>

<script lang="ts">
import DatePicker from 'ant-design-vue/es/date-picker';
import { DatePickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const datePickerTypes = {
  ...DatePickerProps()
};

export default {
  name: 'SmDatePicker',
  defaultComponent: DatePicker,
  mixins: [Base],
  props: datePickerTypes
};
</script>

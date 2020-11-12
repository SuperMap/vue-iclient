<script lang="ts">
import DatePicker from 'ant-design-vue/es/date-picker';
import { RangePickerProps } from 'ant-design-vue/es/date-picker/interface';
import Base from './BaseMixin.vue';

export const rangePickerTypes = {
  ...RangePickerProps()
};

export default {
  name: 'SmRangePicker',
  defaultComponent: DatePicker.RangePicker,
  mixins: [Base],
  props: rangePickerTypes
};
</script>

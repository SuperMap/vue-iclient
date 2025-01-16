import DatePicker from './DatePicker';
import MonthPicker from './MonthPicker';
import RangePicker from './RangePicker';
import WeekPicker from './WeekPicker';
import init from 'vue-iclient/src/init';

DatePicker.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(DatePicker.options ? DatePicker.options.name : DatePicker.name, DatePicker);
  Vue.component(MonthPicker.options ? MonthPicker.options.name : MonthPicker.name, MonthPicker);
  Vue.component(RangePicker.options ? RangePicker.options.name : RangePicker.name, RangePicker);
  Vue.component(WeekPicker.options ? WeekPicker.options.name : WeekPicker.name, WeekPicker);
};

export default DatePicker;

import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmDatePicker from '../DatePicker.vue';
import DatePicker from '../index';
import SmMonthPicker from '../MonthPicker.vue';
import SmRangePicker from '../RangePicker.vue';
import SmWeekPicker from '../WeekPicker.vue';
import SmIcon from '../../icon/Icon.vue';
import moment from 'moment';
import { handleOpenChange } from 'vue-iclient/test/unit/mocks/baseComponentMock.js';
import {
  Input
} from 'ant-design-vue';
const localVue = createLocalVue();
localVue.use(Input);

describe('DatePicker.vue', () => {
  let wrapper;
  const locale = {
    lang: {
      placeholder: 'Избери дата',
      rangePlaceholder: ['Начална дата', 'Крайна дата'],
      today: 'Днес',
      now: 'Сега',
      backToToday: 'Към днес',
      ok: 'Добре',
      clear: 'Изчистване',
      month: 'Месец',
      year: 'Година',
      timeSelect: 'Избор на час',
      dateSelect: 'Избор на дата',
      monthSelect: 'Избор на месец',
      yearSelect: 'Избор на година',
      decadeSelect: 'Десетилетие',
      previousMonth: 'Предишен месец (PageUp)',
      nextMonth: 'Следващ месец (PageDown)',
      previousYear: 'Последна година (Control + left)',
      nextYear: 'Следваща година (Control + right)',
      previousDecade: 'Предишно десетилетие',
      nextDecade: 'Следващо десетилетие',
      previousCentury: 'Последен век',
      nextCentury: 'Следващ век',
      yearFormat: 'YYYY',
      dateFormat: 'D M YYYY',
      dayFormat: 'D',
      dateTimeFormat: 'D M YYYY HH:mm:ss',
      monthBeforeYear: true,
    },
    timePickerLocale: {
      placeholder: 'Избор на час',
    },
  };
  const birthday = moment('2000-01-01', 'YYYY-MM-DD');
  beforeEach(() => {
    wrapper = null;
    document.body.outerHTML = '';
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render index correctly', () => {
    wrapper = mount(DatePicker)
    expect(wrapper.find('.sm-component-calendar-picker').exists()).toBe(true);
  })

  it('prop locale should works', async () => {
    wrapper = mount({
      template: `
      <sm-date-picker open :locale='locale' :value='birthday' />`,
      components: {
        SmDatePicker,
      },
      data() {
        return {
          locale: locale,
          birthday: birthday
        }
      }
    }
  )
    expect(wrapper.find('.sm-component-calendar-picker').exists()).toBe(true);
    expect(wrapper.find('.sm-component-calendar-picker-input').attributes('placeholder')).toBe(locale.lang.placeholder);
  });

  it('prop openChange should works', (done) => {
    wrapper = mount({
      template: `
      <sm-date-picker
        :mode="mode"
        show-time
        @openChange="handleOpenChange"
      />`,
      components: {
        SmDatePicker,
      },
      data() {
        return {
          mode: 'time',
        }
      },
      methods: {
        handleOpenChange: handleOpenChange,
      }
    },
    { sync: false, attachTo: 'body' },
  )
    setTimeout(() => {
      wrapper.find('.sm-component-input').trigger('click');
      expect(wrapper.vm.mode).toBe('time');
      done();
    }, 0)
  });

  it('RangePicker should works', () => {
    wrapper = mount({
      template: `
      <sm-range-picker
        :show-time="{ format: 'HH:mm' }"
        format="YYYY-MM-DD HH:mm"
        :placeholder="['Start Time', 'End Time']"
      />`,
      components: {
        SmRangePicker,
      },
      data() {
        return {
          locale: locale,
          birthday: birthday
        }
      }
    }
  )
    const rangePicker = wrapper.findAll('.sm-component-calendar-range-picker-input');
    expect(rangePicker.length).toBe(2);
    expect(rangePicker.at(0).element.placeholder).toBe('Start Time');
    expect(rangePicker.at(1).element.placeholder).toBe('End Time');
    expect(wrapper.find('.sm-component-calendar-range-picker-separator').text()).toBe('~');
  });

  it('WeekPicker should works', async () => {
    wrapper = mount({
      template: `
      <sm-week-picker placeholder="Select week">
        <sm-icon slot="suffixIcon" type="smile" />
      </sm-week-picker>`,
      components: {
        SmWeekPicker,
        SmIcon
      }
    }
  )
  expect(wrapper.find('.sm-component-calendar-picker').exists()).toBe(true);
  expect(wrapper.find('.sm-component-calendar-picker-input').element.placeholder).toBe('Select week');
  });

  it('render MonthPicker', () => {
    wrapper = mount({
      template: `
      <sm-month-picker placeholder="Select month">
        <sm-icon slot="suffixIcon" type="smile" />
      </sm-month-picker>`,
      components: {
        SmMonthPicker,
        SmIcon
      }
    }
  )
    expect(wrapper.find('.sm-component-calendar-picker').exists()).toBe(true);
    expect(wrapper.find('.sm-component-calendar-picker-input').element.placeholder).toBe('Select month');
  });
})
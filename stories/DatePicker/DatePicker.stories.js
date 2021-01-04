import { toI18n } from '../../.storybook/lang';
import moment from 'moment';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/datePicker' };

export const BasicDatePicker = () => ({
  mixins: [theme],
  template: `
  <div>
    <sm-date-picker />
    <br />
    <sm-month-picker style="margin:10px 0" placeholder="Select month" />
    <br />
    <sm-range-picker style="margin-bottom:10px"  />
    <br />
    <sm-week-picker placeholder="Select week" />
  </div>
  `
});
BasicDatePicker.story = {
  name: toI18n('basicComponent.basic')
};

export const DisabledDatePicker = () => ({
  methods: {
    moment,
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },
    disabledDate(current) {
      // Can not select days before today and today
      return current && current < moment().endOf('day');
    },
    disabledDateTime() {
      return {
        disabledHours: () => this.range(0, 24).splice(4, 20),
        disabledMinutes: () => this.range(30, 60),
        disabledSeconds: () => [55, 56]
      };
    },
    disabledRangeTime(_, type) {
      if (type === 'start') {
        return {
          disabledHours: () => this.range(0, 60).splice(4, 20),
          disabledMinutes: () => this.range(30, 60),
          disabledSeconds: () => [55, 56]
        };
      }
      return {
        disabledHours: () => this.range(0, 60).splice(20, 4),
        disabledMinutes: () => this.range(0, 31),
        disabledSeconds: () => [55, 56]
      };
    }
  },
  template: `
  <div>
    <sm-date-picker
      format="YYYY-MM-DD HH:mm:ss"
      :disabled-date="disabledDate"
      :disabled-time="disabledDateTime"
      :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }"
    />
    <br />
    <sm-month-picker style="margin:10px 0" :disabled-date="disabledDate" placeholder="Select month" />
    <br />
    <sm-range-picker
      :disabled-date="disabledDate"
      :disabled-time="disabledRangeTime"
      :show-time="{
        hideDisabledOptions: true,
        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
      }"
      format="YYYY-MM-DD HH:mm:ss"
    />
  </div>
  `
});
DisabledDatePicker.story = {
  name: toI18n('basicComponent.datePicker.disabledDateTime')
};

export const FooterDatePicker = () => ({
  template: `
  <div>
    <sm-date-picker>
      <template slot="renderExtraFooter">
        extra footer
      </template>
    </sm-date-picker>
    <sm-date-picker show-time>
      <template slot="renderExtraFooter">
        extra footer
      </template>
    </sm-date-picker>
    <br />
    <sm-range-picker style="margin: 10px 0">
      <template slot="renderExtraFooter">
        extra footer
      </template>
    </sm-range-picker>
    <br />
    <sm-range-picker show-time>
      <template slot="renderExtraFooter">
        extra footer
      </template>
    </sm-range-picker>
    <sm-month-picker placeholder="Select month">
      <template slot="renderExtraFooter">
        extra footer
      </template>
    </sm-month-picker>
  </div>
  `
});
FooterDatePicker.story = {
  name: toI18n('basicComponent.datePicker.extraFooter')
};

export const ControlDatePicker = () => ({
  data() {
    return {
      mode1: 'time',
      mode2: ['month', 'month'],
      value: []
    };
  },
  methods: {
    handleOpenChange1(open) {
      if (open) {
        this.mode1 = 'time';
      }
    },
    handleChange(value) {
      this.value = value;
    },
    handlePanelChange1(value, mode) {
      this.mode1 = mode;
    },
    handlePanelChange2(value, mode) {
      this.value = value;
      this.mode2 = [mode[0] === 'date' ? 'month' : mode[0], mode[1] === 'date' ? 'month' : mode[1]];
    }
  },
  template: `
  <div>
    <sm-date-picker
      :mode="mode1"
      show-time
      v-on:openChange="handleOpenChange1"
      v-on:panelChange="handlePanelChange1"
    />
    <br />
    <sm-range-picker
      :placeholder="['Start month', 'End month']"
      format="YYYY-MM"
      :value="value"
      :mode="mode2"
      style="margin-top: 10px"
      v-on:panelChange="handlePanelChange2" 
      v-on:change="handleChange"
    />
  </div>
  `
});
ControlDatePicker.story = {
  name: toI18n('basicComponent.datePicker.controlledPanels')
};

export const SizeDatePicker = () => ({
  data() {
    return {
      size: 'default'
    };
  },
  template: `
  <div>
    <sm-radio-group v-model="size">
      <sm-radio-button value="large">
        Large
      </sm-radio-button>
      <sm-radio-button value="default">
        Default
      </sm-radio-button>
      <sm-radio-button value="small">
        Small
      </sm-radio-button>
    </sm-radio-group>
    <br /><br />
    <sm-date-picker :size="size" />
    <br />
    <sm-month-picker :size="size" style="margin: 10px 0" placeholder="Select Month" />
    <br />
    <sm-range-picker :size="size" style="margin-bottom: 10px"/>
    <br />
    <sm-week-picker :size="size" placeholder="Select Week" />
  </div>
  `
});
SizeDatePicker.story = {
  name: toI18n('basicComponent.datePicker.size')
};

export const TimeDatePicker = () => ({
  template: `
  <div>
    <sm-date-picker show-time placeholder="Select Time"  />
    <br />
    <sm-range-picker
      :show-time="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm"
      :placeholder="['Start Time', 'End Time']"
      style="margin-top: 10px"
    />
  </div>
  `
});
TimeDatePicker.story = {
  name: toI18n('basicComponent.datePicker.chooseTime')
};

export const IconDatePicker = () => ({
  template: `
  <div>
    <sm-date-picker >
      <sm-icon slot="suffixIcon" type="smile" style="padding: 0" />
    </sm-date-picker>
    <br />
    <sm-month-picker style="margin: 10px 0" placeholder="Select month" >
      <sm-icon slot="suffixIcon" type="smile" style="padding: 0" />
    </sm-month-picker>
    <br />
    <sm-range-picker style="margin-bottom: 10px" >
      <sm-icon slot="suffixIcon" type="smile" style="padding: 0" />
    </sm-range-picker>
    <br />
    <sm-week-picker style="margin: 10px 0" placeholder="Select week" >
      <sm-icon slot="suffixIcon" type="smile" style="padding: 0" />
    </sm-week-picker>
    <br />
    <sm-date-picker style="margin-bottom: 10px" suffix-icon="ab"  />
    <br />
    <sm-month-picker style="margin: 10px 0" suffix-icon="ab" placeholder="Select month"  />
    <br />
    <sm-range-picker style="margin-bottom: 10px" suffix-icon="ab"  />
    <br />
    <sm-week-picker suffix-icon="ab" placeholder="Select week"  />
  </div>
  `
});
IconDatePicker.story = {
  name: toI18n('basicComponent.datePicker.suffix')
};

export const CustomDatePicker = () => ({
  methods: {
    getCurrentStyle(current, today) {
      const style = {};
      if (current.date() === 1) {
        style.border = '1px solid #1890ff';
        style.borderRadius = '50%';
      }
      return style;
    }
  },
  template: `
    <div>
      <sm-date-picker>
        <template slot="dateRender" slot-scope="current, today">
          <div class="ant-calendar-date" :style="getCurrentStyle(current, today)">
            {{ current.date() }}
          </div>
        </template>
      </sm-date-picker>
      <br />
      <sm-range-picker style="margin: 10px 0">
        <template slot="dateRender" slot-scope="current">
          <div class="ant-calendar-date" :style="getCurrentStyle(current)">
            {{ current.date() }}
          </div>
        </template>
      </sm-range-picker>
      <br />
      <sm-week-picker>
        <template slot="dateRender" slot-scope="current">
          <div class="ant-calendar-date" :style="getCurrentStyle(current)">
            {{ current.date() }}
          </div>
        </template>
      </sm-week-picker>
    </div>
  `
});
CustomDatePicker.story = {
  name: toI18n('basicComponent.datePicker.customizedDateRendering')
};

export const DisabledAllDatePicker = () => ({
  data() {
    this.dateFormat = 'YYYY-MM-DD';
    return {};
  },
  methods: {
    moment
  },
  template: `
  <div>
    <sm-date-picker :default-value="moment('2015-06-06', dateFormat)" disabled />
    <br />
    <sm-month-picker style="margin: 10px 0" :default-value="moment('2015-06', 'YYYY-MM')" disabled />
    <br />
    <sm-range-picker
      :default-value="[moment('2015-06-06', dateFormat), moment('2015-06-06', dateFormat)]"
      disabled
    />
  </div>
  `
});
DisabledAllDatePicker.story = {
  name: toI18n('basicComponent.disabled')
};

export const FormatDatePicker = () => ({
  data() {
    return {
      dateFormat: 'YYYY/MM/DD',
      monthFormat: 'YYYY/MM',
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY']
    };
  },
  methods: {
    moment
  },
  template: `
  <div>
    <sm-date-picker :default-value="moment('2015/01/01', dateFormat)" :format="dateFormat" />
    <br />
    <sm-date-picker
      :default-value="moment('01/01/2015', dateFormatList[0])"
      :format="dateFormatList"
      style="margin: 10px 0"
    />
    <br />
    <sm-month-picker style="margin-bottom: 10px" :default-value="moment('2015/01', monthFormat)" :format="monthFormat" />
    <br />
    <sm-range-picker
      :default-value="[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]"
      :format="dateFormat"
    />
  </div>
  `
});
FormatDatePicker.story = {
  name: toI18n('basicComponent.datePicker.format')
};

export const PresetDatePicker = () => ({
  data() {
    return {
      dateFormat: 'YYYY/MM/DD',
      monthFormat: 'YYYY/MM'
    };
  },
  methods: {
    moment
  },
  template: `
  <div>
    <sm-range-picker
      :ranges="{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }"
      style="margin-bottom: 10px"
      
    />
    <br />
    <sm-range-picker
      :ranges="{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }"
      show-time
      format="YYYY/MM/DD HH:mm:ss"
      
    />
  </div>
  `
});
PresetDatePicker.story = {
  name: toI18n('basicComponent.datePicker.presetRanges')
};

export const CustomScopeDatePicker = () => ({
  data() {
    return {
      startValue: null,
      endValue: null,
      endOpen: false
    };
  },
  watch: {
    startValue(val) {
      console.log('startValue', val);
    },
    endValue(val) {
      console.log('endValue', val);
    }
  },
  methods: {
    disabledStartDate(startValue) {
      const endValue = this.endValue;
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > endValue.valueOf();
    },
    disabledEndDate(endValue) {
      const startValue = this.startValue;
      if (!endValue || !startValue) {
        return false;
      }
      return startValue.valueOf() >= endValue.valueOf();
    },
    handleStartOpenChange(open) {
      if (!open) {
        this.endOpen = true;
      }
    },
    handleEndOpenChange(open) {
      this.endOpen = open;
    }
  },
  template: `
  <div>
    <sm-date-picker
      v-model="startValue"
      :disabled-date="disabledStartDate"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
      placeholder="Start"
      v-on:openChange="handleStartOpenChange"
    />
    <sm-date-picker
      v-model="endValue"
      :disabled-date="disabledEndDate"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
      placeholder="End"
      :open="endOpen"
      v-on:openChange="handleEndOpenChange"
    />
  </div>
  `
});
CustomScopeDatePicker.story = {
  name: toI18n('basicComponent.datePicker.customizedRangePicker')
};

export const CustomStyleDatePicker = () => ({
  data() {
    return {
      time1: undefined,
      time2: undefined
    };
  },
  methods: {
    clearTime() {
      this.time1 = undefined;
    }
  },
  template: `
  <div>
    <sm-date-picker v-model="time1" placeholder="Select Time" >
      <span>{{ time1 ? time1 : 'SelectTime' }}</span>
    </sm-date-picker>
    <br />
    <sm-range-picker v-model="time2">
      <span>
        {{ time2 ? time2 : '请选择' }}
      </span>
    </sm-range-picker>
  </div>
  `
});
CustomStyleDatePicker.story = {
  name: toI18n('basicComponent.custom')
};

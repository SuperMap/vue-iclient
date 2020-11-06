import { withKnobs } from '@storybook/addon-knobs';
import moment from 'moment';

export default { title: 'BasicComponent/dataPicker', decorators: [withKnobs] };

export const BasicDataPicker = () => ({
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
BasicDataPicker.story = {
  name: '基本用法'
};

export const DisabledDataPicker = () => ({
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
DisabledDataPicker.story = {
  name: '不可选择日期和时间'
};

export const FooterDataPicker = () => ({
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
FooterDataPicker.story = {
  name: '额外的页脚'
};

export const ControlDataPicker = () => ({
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
      @openChange="handleOpenChange1"
      @panelChange="handlePanelChange1"
    />
    <br />
    <sm-range-picker
      :placeholder="['Start month', 'End month']"
      format="YYYY-MM"
      :value="value"
      :mode="mode2"
      style="margin-top: 10px"
      @panelChange="handlePanelChange2" 
      @change="handleChange"
    />
  </div>
  `
});
ControlDataPicker.story = {
  name: '受控面板'
};

export const SizeDataPicker = () => ({
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
SizeDataPicker.story = {
  name: '三种大小'
};

export const TimeDataPicker = () => ({
  methods: {
    onChange(value, dateString) {
      console.log('Selected Time: ', value);
      console.log('Formatted Selected Time: ', dateString);
    },
    onOk(value) {
      console.log('onOk: ', value);
    }
  },
  template: `
  <div>
    <sm-date-picker show-time placeholder="Select Time" @change="onChange" @ok="onOk" />
    <br />
    <sm-range-picker
      :show-time="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm"
      :placeholder="['Start Time', 'End Time']"
      style="margin-top: 10px"
      @change="onChange"
      @ok="onOk"
    />
  </div>
  `
});
TimeDataPicker.story = {
  name: '日期时间选择'
};

export const IconDataPicker = () => ({
  methods: {
    onChange(date, dateString) {
      console.log(date, dateString);
    }
  },
  template: `
  <div>
    <sm-date-picker @change="onChange">
      <sm-icon slot="suffixIcon" type="smile" />
    </sm-date-picker>
    <br />
    <sm-month-picker style="margin: 10px 0" placeholder="Select month" @change="onChange">
      <sm-icon slot="suffixIcon" type="smile" />
    </sm-month-picker>
    <br />
    <sm-range-picker style="margin-bottom: 10px" @change="onChange">
      <sm-icon slot="suffixIcon" type="smile" />
    </sm-range-picker>
    <br />
    <sm-week-picker style="margin: 10px 0" placeholder="Select week" @change="onChange">
      <sm-icon slot="suffixIcon" type="smile" />
    </sm-week-picker>
    <br />
    <sm-date-picker style="margin-bottom: 10px" suffix-icon="ab" @change="onChange" />
    <br />
    <sm-month-picker style="margin: 10px 0" suffix-icon="ab" placeholder="Select month" @change="onChange" />
    <br />
    <sm-range-picker style="margin-bottom: 10px" suffix-icon="ab" @change="onChange" />
    <br />
    <sm-week-picker suffix-icon="ab" placeholder="Select week" @change="onChange" />
  </div>
  `
});
IconDataPicker.story = {
  name: '后缀图标'
};

export const CustomDataPicker = () => ({
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
CustomDataPicker.story = {
  name: '定制日期单元格'
};

export const DisabledAllDataPicker = () => ({
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
DisabledAllDataPicker.story = {
  name: '禁用日期选择器'
};

export const FormatDataPicker = () => ({
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
FormatDataPicker.story = {
  name: '日期格式'
};

export const PresetDataPicker = () => ({
  data() {
    return {
      dateFormat: 'YYYY/MM/DD',
      monthFormat: 'YYYY/MM'
    };
  },
  methods: {
    moment,
    onChange(dates, dateStrings) {
      console.log('From: ', dates[0], ', to: ', dates[1]);
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    }
  },
  template: `
  <div>
    <sm-range-picker
      :ranges="{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }"
      style="margin-bottom: 10px"
      @change="onChange"
    />
    <br />
    <sm-range-picker
      :ranges="{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }"
      show-time
      format="YYYY/MM/DD HH:mm:ss"
      @change="onChange"
    />
  </div>
  `
});
PresetDataPicker.story = {
  name: '预设范围'
};

export const CustomScopeDataPicker = () => ({
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
      @openChange="handleStartOpenChange"
    />
    <sm-date-picker
      v-model="endValue"
      :disabled-date="disabledEndDate"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
      placeholder="End"
      :open="endOpen"
      @openChange="handleEndOpenChange"
    />
  </div>
  `
});
CustomScopeDataPicker.story = {
  name: '自定义日期范围选择'
};

export const CustomStyleDataPicker = () => ({
  data() {
    return {
      time1: undefined,
      time2: undefined
    };
  },
  methods: {
    onChange(value, dateString) {
      console.log('Selected Time: ', value);
      console.log('Formatted Selected Time: ', dateString);
    },
    onOk(value) {
      console.log('onOk: ', value);
    },
    clearTime() {
      this.time1 = undefined;
    }
  },
  template: `
  <div>
    <sm-date-picker v-model="time1" placeholder="Select Time" @change="onChange" @ok="onOk">
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
CustomStyleDataPicker.story = {
  name: '自定义渲染'
};

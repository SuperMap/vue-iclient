import { toI18n } from '../../.storybook/lang';
import moment from 'moment';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.timePicker.title')}`,
  id: 'BasicComponents/timePicker'
};
export const TimePicker12hours = () => ({
  mixins: [theme],
  template: `
  <div>
    <sm-time-picker use12-hours/>
    <sm-time-picker use12-hours format="h:mm:ss A"/>
    <sm-time-picker use12-hours format="h:mm a"/>
  </div>
  `
});
TimePicker12hours.story = {
  name: toI18n('basicComponent.timePicker.use12hours')
};

export const BasicTimePicker = () => ({
  mixins: [theme],
  methods: {
    moment
  },
  template: `
  <div>
    <sm-time-picker :default-open-value="moment('00:00:00', 'HH:mm:ss')" />
  </div>
  `
});
BasicTimePicker.story = {
  name: toI18n('basicComponent.basic')
};

export const TimePickerSelectMinsAndHours = () => ({
  methods: {
    moment
  },
  template: `
  <div>
    <sm-time-picker :default-value="moment('12:08', 'HH:mm')" format="HH:mm" />
  </div>
  `
});
TimePickerSelectMinsAndHours.story = {
  name: toI18n('basicComponent.timePicker.selectMinsAndHours')
};

export const SizeTimePicker = () => ({
  methods: {
    moment
  },
  template: `
  <div>
    <sm-time-picker :default-value="moment('12:08:23', 'HH:mm:ss')" size="large" />
    <sm-time-picker :default-value="moment('12:08:23', 'HH:mm:ss')" />
    <sm-time-picker :default-value="moment('12:08:23', 'HH:mm:ss')" size="middle" />
    <sm-time-picker :default-value="moment('12:08:23', 'HH:mm:ss')" size="small" />
  </div>
  `
});
SizeTimePicker.story = {
  name: toI18n('basicComponent.timePicker.size')
};

export const SuffixTimePicker = () => ({
  methods: {
    moment
  },
  template: `
  <div>
    <sm-time-picker :default-open-value="moment('00:00:00', 'HH:mm:ss')">
      <sm-icon slot="suffixIcon" type="smile" />
    </sm-time-picker>
  </div>
  `
});
SuffixTimePicker.story = {
  name: toI18n('basicComponent.timePicker.suffix')
};

export const ExtraFooterTimePicker = () => ({
  data() {
    return {
      currentTime: '',
      open: false,
      open2: false
    };
  },
  methods: {
    moment,
    handleOpenChange(open) {
      console.log('open', open);
      this.open = open;
    },
    handleClose() {
      this.open = false;
      this.open2 = false;
    },
    getCurrentTime() {
      this.currentTime = moment(Date.now());
    }
  },
  template: `
  <div>
    <sm-time-picker :open="open" @openChange="handleOpenChange">
      <div slot="addon" slot-scope="panel">
        <span> {{ panel.prefixCls }} </span>
        <sm-button  size="small" type="primary" @click="handleClose">确定</sm-button>
      </div>
    </sm-time-picker>
    <sm-time-picker v-model="currentTime" :open.sync="open2">
    <div slot="addon" style="display: flex;justify-content: space-between">
      <a style="padding: 2px 8px" @click="getCurrentTime">此刻</a>
      <sm-button  size="small" type="primary" @click="handleClose">确定</sm-button>
    </div>
  </sm-time-picker>
  </div>
  `
});
ExtraFooterTimePicker.story = {
  name: toI18n('basicComponent.timePicker.extraFooter')
};

export const DisabledTimePicker = () => ({
  methods: {
    moment
  },
  template: `
  <div>
    <sm-time-picker :default-value="moment('12:08:23', 'HH:mm:ss')" disabled />
  </div>
  `
});
DisabledTimePicker.story = {
  name: toI18n('basicComponent.timePicker.disabled')
};

export const StepsTimeTimePicker = () => ({
  template: `
  <div>
    <sm-time-picker :minute-step="15" :second-step="10" />
  </div>
  `
});
StepsTimeTimePicker.story = {
  name: toI18n('basicComponent.timePicker.steps')
};

export const ControlTimePicker = () => ({
  data() {
    return {
      value: null,
      value2: moment()
    };
  },
  methods: {
    onChange(time) {
      console.log(time);
      this.value = time;
    }
  },
  template: `
  <div>
    <p>use value and @change</p>
    <sm-time-picker :value="value" @change="onChange" />
    <br />
    <br />
    <p>v-model</p>
    <sm-time-picker v-model="value" />
    <br />
    <br />
    <p>Do not change</p>
    <sm-time-picker :value="value2" />
  </div>
  `
});
ControlTimePicker.story = {
  name: toI18n('basicComponent.timePicker.controlled')
};

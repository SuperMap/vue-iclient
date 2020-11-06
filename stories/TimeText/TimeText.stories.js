import { withKnobs, select, object } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/time-text', decorators: [withKnobs] };

export const BasicTimeText = () => ({
  props: {
    timeType: {
      default: select('timeType', ['date', 'date+second', 'date+second+week'], 'date+second+week')
    }
  },
  template: '<SmTimeText  v-bind="$props"></SmTimeText>'
});
BasicTimeText.story = {
  name: '时间'
};

export const SmallTimeText = () => ({
  props: {
    fontStyle: {
      default: object('fontStyle', { fontSize: '14px', fontFamily: '微软雅黑' })
    }
  },
  data() {
    return {
      middleStyle: { fontSize: '18px', fontFamily: '微软雅黑' },
      largeStyle: { fontSize: '24px', fontFamily: '微软雅黑' }
    };
  },
  template:
    '<div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content: space-between"><sm-time-text v-bind="$props"></sm-time-text><sm-time-text v-bind="$props" :fontStyle="middleStyle"></sm-time-text><sm-time-text v-bind="$props" :fontStyle="largeStyle"></sm-time-text></div>'
});
SmallTimeText.story = {
  name: '不同大小的时间'
};

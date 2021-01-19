import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.timeRange.title')}`,
  id: 'BasicComponents/time-range'
};

export const BasicTimeRange = () => ({
  mixins: [theme],
  data() {
    return {
      data: [
        '2020-04-25 01:00:00',
        '2020-04-25 02:00:00',
        '2020-04-25 03:00:00',
        '2020-04-25 04:00:00',
        '2020-04-25 05:00:00',
        '2020-04-25 06:00:00',
        '2020-04-25 07:00:00',
        '2020-04-25 08:00:00',
        '2020-04-25 09:00:00',
        '2020-04-25 10:00:00'
      ]
    };
  },
  methods: {
    changed(e) {
      console.log(e);
    }
  },
  template: `
  <SmTimeRange :data="data" style="width:100%" @datazoom="changed"></SmTimeRange>
  `
});
BasicTimeRange.story = {
  name: toI18n('basicComponent.basic')
};

export const StyleTimeRange = () => ({
  data() {
    return {
      timeRangeProps: {
        data: [
          '2020-04-25 01:00:00',
          '2020-04-25 02:00:00',
          '2020-04-25 03:00:00',
          '2020-04-25 04:00:00',
          '2020-04-25 05:00:00',
          '2020-04-25 06:00:00',
          '2020-04-25 07:00:00',
          '2020-04-25 08:00:00',
          '2020-04-25 09:00:00',
          '2020-04-25 10:00:00'
        ],
        handleStyle: { color: '#fff' },
        textStyle: {
          color: '#fff',
          fontSize: 12,
          fontWeight: 'normal',
          fontFamily: '微软雅黑'
        },
        backgroundColor: 'red',
        borderColor: 'yellow',
        fillerColor: 'green'
      }
    };
  },
  template: `<SmTimeRange v-bind="timeRangeProps" style="width:100%"></SmTimeRange>`
});
StyleTimeRange.story = {
  name: toI18n('basicComponent.timeRange.style')
};

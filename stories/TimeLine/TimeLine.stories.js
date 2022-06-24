import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.timeLine.title')}`,
  id: 'BasicComponents/time-line'
};

export const BasicTimeLine = () => ({
  mixins: [theme],
  data() {
    return {
      data: ['3月15号数据', '3月16号数据', '3月17号数据']
    };
  },
  methods: {
    changed(e) {
      console.log(e);
    },
    playChanged(e) {
      console.log('play state', e);
    }
  },
  template: `
  <SmTimeLine :data="data" style="width:100%" @timelinechanged="changed" @timelineplaychanged="playChanged"></SmTimeLine>
  `
});
BasicTimeLine.story = {
  name: toI18n('basicComponent.basic')
};

export const StyleTimeLine = () => ({
  data() {
    return {
      timeLineProps: {
        playInterval: 3000,
        autoPlay: false,
        data: [
          {
            value: '3月15日数据'
          },
          {
            value: '4月1日数据'
          },
          {
            value: '4月15日数据'
          }
        ],
        lineStyle: {
          color: '#8C8C8C',
          width: 2,
          type: 'solid'
        },
        label: {
          interval: 'auto',
          fontSize: 14,
          color: '#91A4C4',
          fontWeight: 'normal',
          fontFamily: '微软雅黑',
          backgroundColor: 'transparent',
          formatter(val, index) {
            const data = [
              {
                value: '3月15日数据'
              },
              {
                value: '4月1日数据'
              },
              {
                value: '4月15日数据'
              }
            ];
            return data[index].value;
          }
        },
        itemStyle: {
          color: '#fff',
          borderColor: '#CB7C3F'
        },
        controlStyle: {
          show: true,
          color: '#5A9B9C',
          borderColor: '#5A9B9C'
        },
        checkpointStyle: { color: '#CB7C3F', borderColor: '#fff' }
      }
    };
  },
  template: `<SmTimeLine v-bind="timeLineProps" style="width:100%"></SmTimeLine>`
});
StyleTimeLine.story = {
  name: toI18n('basicComponent.timeLine.style')
};

import { mount } from '@vue/test-utils';
import SmTimeLine from '../TimeLine.vue';
import TimeLine from '../index';

describe('TimeLine.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount({
      template: `
      <SmTimeLine :data="data" style="width:100%" @timelinechanged="changed" @timelineplaychanged="playChanged"></SmTimeLine>`,
      components: {
        SmTimeLine
      },
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
      }
    });
  });

  it('render index correctly', () => {
    wrapper = mount(TimeLine);
    expect(wrapper.find('.sm-component-time-line').exists()).toBe(true);
  });

  it('render timeLineProps correctly', () => {
    wrapper = mount({
      template: `
      <SmTimeLine v-bind="timeLineProps" style="width:100%"></SmTimeLine> `,
      components: {
        SmTimeLine
      },
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
      }
    });
  });
});

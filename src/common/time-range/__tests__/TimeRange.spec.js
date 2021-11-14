import { mount } from '@vue/test-utils';
import SmTimeRange from '../TimeRange.vue';
import TimeRange from '../index';

describe('TimeRange.vue', () => {
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
      <SmTimeRange :data="data" style="width:100%" @datazoom="changed"></SmTimeRange>`,
      components: {
        SmTimeRange
      },
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
      }
    });
  });

  it('render index correctly', () => {
    wrapper = mount(TimeRange);
    expect(wrapper.find('.sm-component-time-range').exists()).toBe(true);
  });

  it('render timeRangeProps correctly', () => {
    wrapper = mount({
      template: `
      <SmTimeRange v-bind="timeRangeProps" style="width:100%"></SmTimeRange>`,
      components: {
        SmTimeRange
      },
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
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: '微软雅黑'
            },
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: '#91A4C4',
            fillerColor: '#5A9B9C'
          }
        };
      }
    });
  });
});

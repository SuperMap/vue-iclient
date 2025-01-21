import { mount } from '@vue/test-utils';
import SmTimeSlider from '../TimeSlider.vue';
import TimeSlider from '../index';

Object.defineProperties(document, {
  styleSheets: {
    get: function () {
      return [{ addRule: jest.fn() }];
    },
    set: function (val) {
      this.styleSheets = val;
    }
  },
  getElementsByClassName: {
    get: function () {
      return () => [{ removeEventListener: jest.fn(), addEventListener: jest.fn() }];
    },
    set: function (val) {
      this.getElementsByClassName = val;
    }
  }
});
describe('TimeSlider.vue', () => {
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
    wrapper = mount(TimeSlider);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
  });

  it('render data correctly', async done => {
    wrapper = mount({
      template: `
      <SmTimeSlider :data="data" style="width:100%" @timeplayerchanged="changed" @timeplayerplaychanged="playChanged"></SmTimeSlider>`,
      components: {
        SmTimeSlider
      },
      data() {
        return {
          data: [1599810915, 1599810920, 1599810925, 1599810930, 1599810935, 1599810940, 1599810945]
        };
      },
      methods: {
        changed() {},
        playChanged() {}
      }
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.find('.sm-start-node').html()).toBe('<div class="sm-start-node">2020-09-11 15:55:15</div>');
    expect(wrapper.find('.sm-end-node').html()).toBe('<div class="sm-end-node">2020-09-11 15:55:45</div>');
    done();
  });
  it('render duration correctly', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000,
        lineStyle: { height: '10px' }
      }
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.find('.sm-start-node').html()).toBe('<div class="sm-start-node">00:00:00</div>');
    expect(wrapper.find('.sm-end-node').html()).toBe('<div class="sm-end-node">00:00:05</div>');
    done();
  });

  it('render timeSliderProps correctly', () => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        playInterval: 3000,
        autoPlay: false,
        loop: false,
        timeType: 'time',
        duration: 5000,
        lineStyle: { color: '#CB7C3F', height: '5px', type: 'solid' },
        label: {
          show: false,
          color: '#91A4C4',
          interval: 'auto',
          fontSize: 12,
          fontWeight: 'normal',
          fontFamily: '微软雅黑',
          backgroundColor: 'transparent'
        },
        checkpointStyle: { color: '#CB7C3F', background: '#5A9B9C' },
        themeStyle: { color: '#A44A5D' }
      }
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.playInterval).toBe(3000);
    expect(wrapper.vm.autoPlay).toBe(false);
    expect(wrapper.vm.loop).toBe(false);
    expect(wrapper.vm.lineStyle.color).toBe('#CB7C3F');
    expect(wrapper.vm.label.show).toBe(false);
    expect(wrapper.vm.checkpointStyle.color).toBe('#CB7C3F');
    expect(wrapper.vm.themeStyle.color).toBe('#A44A5D');
  });

  it('change lineheight', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000,
        lineStyle: { height: '10px' }
      }
    });
    await wrapper.setProps({
      lineStyle: { height: '5px' }
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.lineStyle.height).toBe('5px');
    expect(wrapper.vm.lineStyleHeight.height).toBe('5px');
    done();
  });

  it('change sliderBarWidth', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    await wrapper.setData({
      sliderBarWidth: '50.00%'
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.sliderBarWidth).toBe('50.00%');
    done();
  });
  it('change draggable', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    await wrapper.setData({
      draggable: true
    });
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.draggable).toBe(true);
    done();
  });

  it('duration change to play ', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    await wrapper.find('.sm-play-control').trigger('click');
    jest.advanceTimersByTime(1000);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.playState).toBe(true);
    jest.useRealTimers();
    done();
  });
  it('data change to play ', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmTimeSlider, {
      propsData: {
        data: [1599810915, 1599810920, 1599810925, 1599810930, 1599810935, 1599810940, 1599810945]
      }
    });
    await wrapper.find('.sm-play-control').trigger('click');
    jest.advanceTimersByTime(1000);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    expect(wrapper.vm.playState).toBe(true);
    jest.useRealTimers();
    done();
  });

  it('theme-style-change', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    await wrapper.vm.$emit('theme-style-changed');
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    done();
  });

  it('handleMouseClick', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmTimeSlider, {
      propsData: {
        autoPlay: true,
        duration: 5000
      }
    });
    await wrapper.find('.sm-progress-control').trigger('click');
    jest.advanceTimersByTime(1000);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    jest.useRealTimers();
    done();
  });

  it('handleMouseClick not play', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    await wrapper.find('.sm-progress-control').trigger('click');
    jest.advanceTimersByTime(1000);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    jest.useRealTimers();
    done();
  });

  it('handleDragMove', async done => {
    jest.useFakeTimers();
    wrapper = mount(SmTimeSlider, {
      propsData: {
        autoPlay: true,
        duration: 5000
      }
    });
    await wrapper.vm.handleDragMove({ dx: 10, offsetX: 10 });
    jest.advanceTimersByTime(1000);
    expect(wrapper.find('.sm-component-time-slider').exists()).toBe(true);
    jest.useRealTimers();
    done();
  });

  it('cancelAnimationFrame rafIds_null', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    const id = wrapper.vm.cancelAnimationFrame('name');
    expect(id).toBe('name');
    done();
  });
  it('cancelAnimationFrame rafIds_', async done => {
    wrapper = mount(SmTimeSlider, {
      propsData: {
        duration: 5000
      }
    });
    wrapper.rafIds_ = { id: 'name' };
    const id = wrapper.vm.cancelAnimationFrame('name');
    expect(id).toBe('name');
    done();
  });
});

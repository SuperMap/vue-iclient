import { mount, config } from '@vue/test-utils';
import SmFlyTo from '../FlyTo.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('FlyTo.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  })

  it('render', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525],
          [103.93169934861643, 33.25624201104978]
        ],
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('no data', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.data).toBe(undefined);
    done();
  });

  it('change props', async done => {
    const newData = [[103.93303602365336, 33.04646925591396]];
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525]
        ],
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      data: newData
    });
    expect(wrapper.vm.data).toBe(newData);
    done();
  });

  it('click pre-next-pause goto', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [104.90771770744831, 34.163703206300525],
          [105.90771770744831, 35.163703206300525],
          [106.90771770744831, 36.163703206300525]
        ],
        mapTarget: 'map',
        autoplay:true,
        defaultActiveIndex:1,
        immediate:true,
        loop:false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.playStatus).toBe(true);
    await wrapper.find('.sm-components-icon-zanting').trigger('click')
    expect(wrapper.vm.playStatus).toBe(false);

    expect(wrapper.vm.currentIndex).toBe(1);
    await wrapper.find('.sm-components-icon-solid-triangle-left').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(0);
    await wrapper.find('.sm-components-icon-solid-triangle-right').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(1);
    await wrapper.vm.viewModel.goto(3)
    expect(wrapper.vm.currentIndex).toBe(3);

    await wrapper.find('.sm-components-icon-bofang3').trigger('click')
    expect(wrapper.vm.currentIndex).toBe(1);
    done();
  });

  it('watch props change', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [104.90771770744831, 34.163703206300525],
          [105.90771770744831, 35.163703206300525],
          [106.90771770744831, 36.163703206300525]
        ],
        mapTarget: 'map',
        autoplay:true,
        defaultActiveIndex:1,
        immediate:true,
        loop:false,
        interval:5000,
        activeIndex:0
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      immediate: false,
      loop:true,
      interval:4000,
      defaultActiveIndex:2,
      activeIndex:2,
    });
    expect(wrapper.vm.immediate).toBe(false);

    await wrapper.setProps({ activeIndex:"str"});
    await wrapper.setProps({ activeIndex:-1});
    expect(wrapper.vm.currentIndex).toBe(3);
    await wrapper.setProps({ activeIndex:100});
    expect(wrapper.vm.currentIndex).toBe(0);
    done();
  });

  it('_playSlides & _changeActiveIndex', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [104.90771770744831, 34.163703206300525],
          [105.90771770744831, 35.163703206300525],
          [106.90771770744831, 36.163703206300525]
        ],
        mapTarget: 'map',
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.currentIndex).toBe(null);
    await wrapper.vm.viewModel._playSlidesFn()
    expect(wrapper.vm.currentIndex).toBe(0);

    await wrapper.setProps({activeIndex:2 });
    await wrapper.vm.viewModel._playSlidesFn()
    expect(wrapper.vm.currentIndex).toBe(3);
    
    done();
  });

  it('_setActiveItem', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [104.90771770744831, 34.163703206300525],
          [105.90771770744831, 35.163703206300525],
          [106.90771770744831, 36.163703206300525]
        ],
        mapTarget: 'map',
        loop:false,
        defaultActiveIndex:2
      }
    });
    await mapSubComponentLoaded(wrapper);

    await wrapper.vm.viewModel._playSlidesFn()
    expect(wrapper.vm.currentIndex).toBe(2);
    await wrapper.setProps({ activeIndex:100});
    expect(wrapper.vm.currentIndex).toBe(3);
    await wrapper.setProps({ activeIndex:-1});
    expect(wrapper.vm.currentIndex).toBe(0);
    done();
  });

  it('_flyTo -flyOptions is invalid', async done => {
    const data = [
        [103.93303602365336, 33.04646925591396],
        [104.90771770744831, 34.163703206300525],
        [105.90771770744831, 35.163703206300525],
        [106.90771770744831, 36.163703206300525]
      ],
    wrapper = mount(SmFlyTo, {
      propsData: {
        mapTarget: 'map',
        activeIndex:10
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.vm.viewModel._flyTo()
    function throwErr() { 
      wrapper.setProps({ data:data});
      wrapper.vm.viewModel._flyTo()
    }
    expect(throwErr).toThrow()
    done();
  });
});

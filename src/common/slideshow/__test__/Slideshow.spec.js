import { mount } from '@vue/test-utils';
import SmSlideshow from '../Slideshow.vue';
import SmSlideshowItem from '../SlideshowItem.vue';
import SmButton from '../../button/Button.vue';
import Slideshow from '../index';

describe('Slideshow.vue', () => {
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
    wrapper = mount(SmSlideshow);
  });

  it('change props', async () => {
    wrapper = mount(Slideshow);
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
    expect(wrapper.vm.mousewheel).toBeFalsy();
    await wrapper.setProps({ mousewheel: true });
    expect(wrapper.vm.mousewheel).toBeTruthy();
    await wrapper.setProps({ keyboard: true });
    expect(wrapper.vm.keyboard).toBeTruthy();
    await wrapper.setProps({ mousewheel: false });
    expect(wrapper.vm.mousewheel).toBeFalsy();
    await wrapper.setProps({ keyboard: false });
    expect(wrapper.vm.keyboard).toBeFalsy();
    await wrapper.setProps({ autoresize: false });
    expect(wrapper.vm.autoresize).toBeFalsy();
  });

  it('Dynamic change props', async () => {
    wrapper = mount(
      {
        template: `
        <div style="width:100px;height:100px">
          <sm-slideshow
            :collapsed="false"
            style="position: absolute; top: 40px; left: 30px; width: 400px; height: 390px; border-radius: 4px"
            :direction="direction"
          >
            <sm-slideshow-item v-for="(item, index) of 10" :key="index">
              <h3>{{ item }}</h3>
            </sm-slideshow-item>
          </sm-slideshow>
          <sm-button @click="changeDirection">changeDirection</sm-button>
        </div>`,
        components: {
          SmSlideshow,
          SmSlideshowItem,
          SmButton
        },
        data() {
          return {
            direction: 'horizontal'
          };
        },
        methods: {
          changeDirection() {
            this.direction = 'vertical';
          }
        }
      },
      {
        sync: false
      }
    );
    const slideshowWrapper = wrapper.find('.sm-component-slideshow');
    expect(slideshowWrapper.exists()).toBe(true);
    expect(wrapper.find('.sm-component-btn').exists()).toBe(true);
    await wrapper.find('.sm-component-btn').trigger('click');
    expect(slideshowWrapper.exists()).toBe(true);
  });

  it('change activeIndex', async () => {
    wrapper = mount({
      template: `
        <div style="width:100px;height:100px">
          <sm-slideshow
            :collapsed="false"
            style="position: absolute; top: 40px; left: 30px; width: 400px; height: 390px; border-radius: 4px"
            :activeIndex="activeIndex"
          >
            <sm-slideshow-item v-for="(item) of 8" :key="item">
              <h3>{{ item }}</h3>
            </sm-slideshow-item>
          </sm-slideshow>
        </div>`,
      components: {
        SmSlideshow,
        SmSlideshowItem,
        SmButton
      },
      data() {
        return {
          activeIndex: 0
        };
      },
      methods: {
        changeActiveIndex(index) {
          this.activeIndex = index;
        }
      }
    });
    const slideshowWrapper = wrapper.find('.sm-component-slideshow');
    expect(slideshowWrapper.exists()).toBe(true);
    await wrapper.vm.changeActiveIndex(1);
    expect(slideshowWrapper.vm.activeIndex).toBe(1);
    await wrapper.vm.changeActiveIndex(5);
    expect(slideshowWrapper.vm.activeIndex).toBe(5);
    await wrapper.vm.changeActiveIndex(2);
    expect(slideshowWrapper.vm.activeIndex).toBe(2);
    await wrapper.vm.changeActiveIndex(3);
    expect(slideshowWrapper.vm.activeIndex).toBe(3);
    await wrapper.vm.changeActiveIndex(4);
    expect(slideshowWrapper.vm.activeIndex).toBe(4);
    await wrapper.vm.changeActiveIndex(3);
    expect(slideshowWrapper.vm.activeIndex).toBe(3);
    await wrapper.vm.changeActiveIndex(2);
    expect(slideshowWrapper.vm.activeIndex).toBe(2);
    await wrapper.vm.changeActiveIndex(7);
    expect(slideshowWrapper.vm.activeIndex).toBe(7);
    await wrapper.vm.changeActiveIndex(0);
    expect(slideshowWrapper.vm.activeIndex).toBe(0);
    await wrapper.vm.changeActiveIndex(7);
    expect(slideshowWrapper.vm.activeIndex).toBe(7);
    await wrapper.vm.changeActiveIndex(0);
    expect(slideshowWrapper.vm.activeIndex).toBe(0);
    await wrapper.vm.changeActiveIndex(9);
    expect(slideshowWrapper.vm.activeIndex).toBe(9);
  });

  it('change activeIndex when loop is false', async () => {
    wrapper = mount({
      template: `
        <div style="width:100px;height:100px">
          <sm-slideshow
            :collapsed="false"
            style="position: absolute; top: 40px; left: 30px; width: 400px; height: 390px; border-radius: 4px"
            :activeIndex="activeIndex"
            :loop="false"
          >
            <sm-slideshow-item v-for="(item, index) of 10" :key="index">
              <h3>{{ item }}</h3>
            </sm-slideshow-item>
          </sm-slideshow>
        </div>`,
      components: {
        SmSlideshow,
        SmSlideshowItem,
        SmButton
      },
      data() {
        return {
          activeIndex: 0
        };
      },
      methods: {
        changeActiveIndex(index) {
          this.activeIndex = index;
        }
      }
    });
    const slideshowWrapper = wrapper.find('.sm-component-slideshow');
    expect(slideshowWrapper.exists()).toBe(true);
    expect(slideshowWrapper.vm.loop).toBeFalsy();
    await wrapper.vm.changeActiveIndex(1);
    expect(slideshowWrapper.vm.activeIndex).toBe(1);
    await wrapper.vm.changeActiveIndex(5);
    expect(slideshowWrapper.vm.activeIndex).toBe(5);
    await wrapper.vm.changeActiveIndex(2);
    expect(slideshowWrapper.vm.activeIndex).toBe(2);
    await wrapper.vm.changeActiveIndex(7);
    expect(slideshowWrapper.vm.activeIndex).toBe(7);
    await wrapper.vm.changeActiveIndex(0);
    expect(slideshowWrapper.vm.activeIndex).toBe(0);
  });

  it('about slot', (done) => {
    wrapper = mount({
      template: `
        <div style="width:100px;height:100px">
          <sm-slideshow
            :collapsed="false"
            :pagination="pagination"
            :scrollbar="scrollbar"
            :navigation="navigation"
            style="position: absolute; top: 40px; left: 30px; width: 400px; height: 390px; border-radius: 4px"
          >
            <sm-slideshow-item v-for="(item) of 7" :key="item">
              <h3>{{ item }}</h3>
            </sm-slideshow-item>
          </sm-slideshow>
        </div>`,
      components: {
        SmSlideshow,
        SmSlideshowItem,
        SmButton
      },
      data() {
        return {
          pagination: {
            el: '.swiper-pagination'
          },
          scrollbar: {
            el: '.swiper-scrollbar'
          },
          navigation: {
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next'
          },
        };
      },
      methods: {
        changeActiveIndex(index) {
          this.activeIndex = index;
        }
      }
    });
    wrapper.vm.$nextTick(()=> {
      expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
      expect(wrapper.find('.swiper-pagination').exists()).toBe(true);
      expect(wrapper.find('.swiper-scrollbar').exists()).toBe(true);
      expect(wrapper.find('.swiper-button-prev').exists()).toBe(true);
      expect(wrapper.find('.swiper-button-next').exists()).toBe(true);
      done();
    })
  });
});

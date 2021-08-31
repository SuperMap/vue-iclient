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

  it('render index correctly', () => {
    wrapper = mount(Slideshow);
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
  });

  it('Dynamic change props', done => {
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
          <sm-button @click="changeDirection">深色主题</sm-button>
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
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
    expect(wrapper.find('.sm-component-btn').exists()).toBe(true);
    wrapper.find('.sm-component-btn').trigger('click');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
      expect(wrapper.find('.sm-component-slideshow').vm.direction).toBe('vertical');
      done();
    });
  });
});

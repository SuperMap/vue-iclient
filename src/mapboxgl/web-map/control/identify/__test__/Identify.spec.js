import {
  mount
} from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../Identify.vue';
import SmWebMap from '../../../WebMap.vue';

describe('Identify.vue', () => {
  let wrapper;
  let identifyWrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', (done) => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" mapId="123" serverUrl="https://fakeiportal.supermap.io/iportal">
        <sm-identify :layers="['民航数据']" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
      </sm-web-map> `,
      components: {
        SmIdentify,
        SmWebMap
      }
    });
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', () => {
      try {
        expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
        identifyWrapper.getWidthStyle;
        expect(identifyWrapper.keyMaxWidth).toBe(110);
        expect(identifyWrapper.valueMaxWidth).toBe(170);
        done();
      } catch (exception) {
        console.log("'readfile'案例失败：" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        done();
      }
    })
  })

  it('render index correctly', () => {
    wrapper = mount(Identify);
  })
})
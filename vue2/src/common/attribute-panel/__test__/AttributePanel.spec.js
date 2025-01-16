import { mount, createLocalVue } from '@vue/test-utils';
import SmAttributePanel from '../AttributePanel.vue';
const localVue = createLocalVue();

describe('AttributePanel.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render', async done => {
    let attr = [
      {
          "title": "video",
          "value": "https://www.runoob.com/try/demo_source/mov_bbb.mp4",
      },
      {
          "title": "image",
          "value": "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960",
      }
    ];
    wrapper = mount(SmAttributePanel, {
      localVue,
      propsData: {
        attributes: attr
      },
      attachToDocument: 'body'
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.tablePopupProps.data).toEqual(attr);
    done();
  });
});

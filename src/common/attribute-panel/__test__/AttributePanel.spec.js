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
          "attribute": "video",
          "alias": "sdsad",
          "attributeValue": "https://www.runoob.com/try/demo_source/mov_bbb.mp4",
          "slotName": "cbb14af2926911ef890f1b2f76bec1a4"
      },
      {
          "attribute": "image",
          "alias": "sdsad",
          "attributeValue": "http://gips2.baidu.com/it/u=195724436,3554684702&fm=3028&app=3028&f=JPEG&fmt=auto?w=1280&h=960",
          "slotName": "cbb14af3926911ef890f1b2f76bec1a4"
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
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.attrIndex).toBe(1);
    done();
  });
});

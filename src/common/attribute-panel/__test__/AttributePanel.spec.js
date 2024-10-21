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
    wrapper = mount(SmAttributePanel, {
      localVue,
      propsData: {
        attributeStyle: {
          "keyStyle":
          {
            "fontFamily": "微软雅黑",
            "color": "",
            "textAlign": "left",
            "width": "110",
            "fontSize": "0.296296rem",
            "fontWeight": "normal",
            "height": "unset",
            "flex": "unset"
          },
          "valueStyle": {
            "fontFamily": "微软雅黑",
            "color": "",
            "textAlign": "left",
            "width": "170",
            "fontSize": "0.296296rem",
            "fontWeight": "normal",
            "height": "unset",
            "flex": "unset"
          }
        },
        attributes: {
          "链接": "www.test.com",
          "text": "weidapao2",
        },
        fields: [
          { "slotName": "11", "linkTitle": "", "field": "链接", "linkTarget": "_blank", "repeatOption": "left", "title": "链接", "type": "text" },
          { "slotName": "13", "linkTitle": "", "field": "text", "linkTarget": "_blank", "repeatOption": "left", "title": "text", "type": "text" }]
      },
      attachToDocument: 'body'
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.fieldsMap).toEqual({ "链接": "11", "text": "13" });
    expect(wrapper.vm.formatStyle).toEqual({ "keyStyle": { "fontFamily": "微软雅黑", "color": "", "textAlign": "left", "width": "110px", "fontSize": "0.296296rem", "fontWeight": "normal", "height": "unset", "flex": "unset" }, "valueStyle": { "fontFamily": "微软雅黑", "color": "", "textAlign": "left", "width": "170px", "fontSize": "0.296296rem", "fontWeight": "normal", "height": "unset", "flex": "unset" } });
    wrapper.vm.changeIndex(1);
    expect(wrapper.vm.attrIndex).toBe(1);
    done();
  });
});

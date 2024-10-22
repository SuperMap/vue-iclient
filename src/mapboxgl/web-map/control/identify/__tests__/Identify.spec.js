import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';

describe('Identify.vue', () => {
  let wrapper, mapWrapper;
  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render index correctly', done => {
    wrapper = mount(Identify);
    expect(wrapper.find('.sm-component-layer-highlight').exists()).toBeTruthy();
    done();
  });

  it('fields is array object', async done => {
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: [
          [
            {
              slotName: '6',
              linkTitle: '',
              field: '机场',
              title: '机场22',
              linkTarget: '_blank',
              repeatOption: 'left',
              type: 'text'
            }
          ]
        ],
        autoResize: false
      }
    });
    expect(wrapper.vm.displayFieldsMap['民航数据']).toEqual([
      {
        field: '机场',
        title: '机场22',
        slotName: '6'
      }
    ]);
    done();
  });

  it('fields is object', async done => {
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: {
          slotName: '6',
          linkTitle: '',
          field: '机场',
          title: '机场22',
          linkTarget: '_blank',
          repeatOption: 'left',
          type: 'text'
        },
        autoResize: false
      }
    });
    expect(wrapper.vm.displayFieldsMap['民航数据']).toEqual([
      {
        field: '机场',
        title: '机场22',
        slotName: '6'
      }
    ]);
    done();
  });

  it('fields is string', async done => {
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: ['机场']
      }
    });
    expect(wrapper.vm.displayFieldsMap['民航数据']).toEqual([
      {
        field: '机场',
        title: '机场',
        slotName: undefined
      }
    ]);
    done();
  });
});


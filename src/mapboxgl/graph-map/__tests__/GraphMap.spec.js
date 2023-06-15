import { mount } from '@vue/test-utils';
import SmGraphMap from '../GraphMap.vue';

jest.mock('../GraphMapViewModel.ts', () => {
  const originalModule = jest.requireActual('../GraphMapViewModel.ts');
  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    initGraphMap: jest.fn(),
    resize: jest.fn()
  };
});

const factory = (props) => {
  const wrapper = mount(SmGraphMap, {
    propsData: props
  });
  return wrapper;
};

const commonProps = {
  zoom: 2,
  center: [20, 30],
  serviceUrl: 'http://fakeiserver.com/iserver/services/knowledgeGraph-test/restjsr/graph/graphmaps/test'
};

describe('SmGraphMap', () => {
  let wrapper = null;

  afterEach(() => {
    wrapper?.destroy();
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('render default container', () => {
    wrapper = factory();
    expect(wrapper.find('#knowledgeGraph').exists()).toBe(true);
  });

  it('render specified container', () => {
    const speicifiedMap = 'graphMap';
    wrapper = factory({
      options: {
        container: speicifiedMap
      }
    });
    expect(wrapper.find(`#${speicifiedMap}`).exists()).toBe(true);
  });

  it('watch root dom resize', () => {
    wrapper = factory(commonProps);
    wrapper.vm.viewModel.fire('loaded');
    expect(wrapper.emitted().loaded).toBeTruthy();
  });
});

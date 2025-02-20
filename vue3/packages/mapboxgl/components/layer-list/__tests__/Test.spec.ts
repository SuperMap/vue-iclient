import { mount } from '@vue/test-utils';
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue';
import { statisticsFeatures } from 'vue-iclient-core/utils/statistics';

describe('WebMap', () => {
  it('renders properly', () => {
    const wrapper = mount(WebMap, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
  it('should work with core module', () => {
    expect(statisticsFeatures([], [], [], [])).not.toBeUndefined()
  })
})

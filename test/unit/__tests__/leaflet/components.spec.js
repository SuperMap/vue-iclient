import { mount, createLocalVue } from '@vue/test-utils';
import components from '@leaflet/components.ts';

describe('leaflet_components', () => {
  it('init', () => {
    const localVue = createLocalVue();
    localVue.use(components);
    expect(localVue.component('SmWebMap')).not.toBeNull();
  });
});

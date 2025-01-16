import { mount } from '@vue/test-utils';
import SmLiquidFill from '../LiquidFill.vue';
import LiquidFill from '../index';
import { setTheme } from '../../_utils/style/theme/set-theme';

describe('LiquidFill.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    // TODO, removeListener报错
    // if (wrapper) {
    //   wrapper.destroy();
    // }
  });

  it('render default correctly', () => {
    wrapper = mount(
      {
        template: `
      <div style="width:100px;height:100px">
         <sm-liquid-fill style="width:200px; height:200px" value="0.5"></sm-liquid-fill>
      </div>`,
        components: {
          SmLiquidFill
        }
      },
      {
        sync: false
      }
    );
  });

  it('render index correctly', () => {
    wrapper = mount(LiquidFill);
    expect(wrapper.find('.sm-component-liquidfill').exists()).toBe(true);
  });

  it('render waveAnimation', () => {
    wrapper = mount(
      {
        template: `
        <sm-liquid-fill 
          style="width:200px; height:200px" 
          :waveCount="2"
          :waveAnimation="true"
          value="0.5">
        </sm-liquid-fill>`,
        components: {
          SmLiquidFill
        }
      },
      {
        sync: false
      }
    );
  });

  it('render watch props correctly', async () => {
    wrapper = mount(SmLiquidFill);
    const liquidFillArr = wrapper.findAll(SmLiquidFill);
    liquidFillArr.setProps({
      waveColor: 'blue',
      borderColor: 'red',
      labelColor: '#626c91',
      waveCount: 2,
      backgroundColor: '#626c91',
      insideLabelColor: '#fff',
      waveAnimation: true
    });
    await expect(liquidFillArr.at(0).vm.waveColor).toBe('blue');
  });

  it('set theme change liquidFill', () => {
    wrapper = mount(LiquidFill);
    setTheme('dark');
    expect(wrapper.find('.sm-component-liquidfill').exists()).toBe(true);
  });
});

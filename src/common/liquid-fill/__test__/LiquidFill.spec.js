import {
  mount
} from '@vue/test-utils';
import SmLiquidFill from '../LiquidFill.vue';
 
describe('LiquidFill.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount({
      template: `
      <sm-liquid-fill style="width:200px; height:200px" value="0.5"></sm-liquid-fill>`,
      components: {
        SmLiquidFill
      }
    },
    {
      sync: false,
    }
  )
  })

  it('render waveAnimation', () => {
    wrapper = mount({
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
      sync: false,
    }
  )
  })

  it('render other style correctly', () => {
    wrapper = mount({
      template: `
      <sm-liquid-fill 
        style="width:200px; height:200px" 
        waveColor="red"
        borderColor="blue"
        labelColor="#626c91"
        insideLabelColor="#fff"
        backgroundColor="yellow"
        value="0.5">
      </sm-liquid-fill>`,
      components: {
        SmLiquidFill
      }
    },
    {
      sync: false,
    }
  )
  })
})
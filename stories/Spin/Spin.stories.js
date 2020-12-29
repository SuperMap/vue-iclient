import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/spin'
};

export const spin = () => ({
  mixins: [theme],
  template: `
  <sm-spin />
  `
});
spin.story = {
  name: toI18n('basicComponent.basic')
};

export const InsideContainerSpin = () => ({
  template: `
  <div style="text-align: center; background: rgba(0, 0, 0, 0.25);border-radius: 4px;margin: 20px 0;padding: 30px 50px ">
    <sm-spin />
  </div>
    `
});
InsideContainerSpin.story = {
  name: toI18n('basicComponent.spin.insideContainer')
};

export const CustomizedDescriptionSpin = () => ({
  template: `
  <sm-spin tip="Loading...">
    <div style="border: 1px solid #91d5ff; background: rgba(0, 0, 0, 0.25); padding:30px">
        我的描述文案是自定义的。。。
    </div>
  </sm-spin>
  `
});
CustomizedDescriptionSpin.story = {
  name: toI18n('basicComponent.spin.customizedDescription')
};

export const SizeSpin = () => ({
  template: `
  <div>
    <sm-spin size="small" />
    <sm-spin />
    <sm-spin size="large" />
  </div>
    `
});
SizeSpin.story = {
  name: toI18n('basicComponent.spin.size')
};

export const EmbeddedModeSpin = () => ({
  data() {
    return {
      spinning: false
    };
  },
  methods: {
    changeSpinning() {
      this.spinning = !this.spinning;
    }
  },
  template: `
  <div>
    <sm-spin :spinning="spinning">
      <div style="border: 1px solid #91d5ff; background: rgba(0, 0, 0, 0.25); padding: 30px">
        可以点击‘切换’按钮，控制本区域的spin展示。
      </div>
    </sm-spin>
    Loading state：<sm-switch v-model="spinning" />
  </div>
    `
});
EmbeddedModeSpin.story = {
  name: toI18n('basicComponent.spin.embeddedMode')
};

export const DelaySpin = () => ({
  data() {
    return {
      spinning: false,
      delayTime: 500
    };
  },
  methods: {
    changeSpinning() {
      this.spinning = !this.spinning;
    }
  },
  template: `
  <div>
    <sm-spin :spinning="spinning" :delay="delayTime">
      <div style="border: 1px solid #91d5ff; background: rgba(0, 0, 0, 0.25); padding: 30px">
      可以点击‘切换’按钮，延迟显示 loading 效果。当 spinning 状态在 'delay' 时间内结束，则不显示loading 状态。
      </div>
    </sm-spin>
    Loading state：<sm-switch v-model="spinning" />
  </div>
    `
});
DelaySpin.story = {
  name: toI18n('basicComponent.spin.delay')
};

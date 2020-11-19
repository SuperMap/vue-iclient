import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'Basic/tooltip', decorators: [withKnobs] };

export const BasicTooltip = () => ({
  template: `
  <sm-tooltip>
    <template slot="title">
      prompt text
    </template>
    Tooltip will show when mouse enter.
  </sm-tooltip>
  `
});
BasicTooltip.story = {
  name: '基本用法'
};

export const ArrowTooltip = () => ({
  template: `
  <div>
    <sm-tooltip placement="topLeft" title="Prompt Text">
      <sm-button>Align edge / 边缘对齐</sm-button>
    </sm-tooltip>
    <sm-tooltip placement="topLeft" title="Prompt Text" arrow-point-at-center>
      <sm-button>Arrow points to center / 箭头指向中心</sm-button>
    </sm-tooltip>
  </div>
  `
});
ArrowTooltip.story = {
  name: '箭头指向'
};

export const LocationTooltip = () => ({
  template: `
  <div>
    <div :style="{ marginLeft: '70px', whiteSpace: 'nowrap' }">
      <sm-tooltip placement="topLeft" >
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">TL</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="top">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">Top</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="topRight">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">TR</sm-button>
      </sm-tooltip>
    </div>
    <div :style="{ width: '70px', float: 'left' }">
      <sm-tooltip placement="leftTop">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">LT</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="left">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">Left</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="leftBottom">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">LB</sm-button>
      </sm-tooltip>
    </div>
    <div :style="{ width: '70px', marginLeft: '304px' }">
      <sm-tooltip placement="rightTop">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">RT</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="right">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">Right</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="rightBottom">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">RB</sm-button>
      </sm-tooltip>
    </div>
    <div :style="{ marginLeft: '70px', clear: 'both', whiteSpace: 'nowrap' }">
      <sm-tooltip placement="bottomLeft">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">BL</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="bottom">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">Bottom</sm-button>
      </sm-tooltip>
      <sm-tooltip placement="bottomRight">
        <template slot="title">
          <span>prompt text</span>
        </template>
        <sm-button style="width: 70px; text-align: center; padding: 0; margin-right: 8px; margin-bottom: 8px;">BR</sm-button>
      </sm-tooltip>
    </div>
  </div>
  `
});
LocationTooltip.story = {
  name: '位置'
};

export const AutomaticTooltip = () => ({
  data() {
    return {
      wrapStyles: {
        overflow: 'hidden',
        position: 'relative',
        padding: '24px',
        border: '1px solid #e9e9e9'
      }
    };
  },
  methods: {
    getPopupContainer(trigger) {
      return trigger.parentElement;
    }
  },
  template: `
  <div :style="wrapStyles">
    <sm-tooltip placement="left" title="Prompt Text" :get-popup-container="getPopupContainer">
      <sm-button>Adjust automatically / 自动调整</sm-button>
    </sm-tooltip>
    <br />
    <sm-tooltip
      style="marginTop: 10px"
      placement="left"
      title="Prompt Text"
      :get-popup-container="getPopupContainer"
      :auto-adjust-overflow="false"
    >
      <sm-button>Ingore / 不处理</sm-button>
    </sm-tooltip>
  </div>
  `
});
AutomaticTooltip.story = {
  name: '自动调整位置'
};

import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/steps', decorators: [withKnobs] };

export const BasicSteps = () => ({
  template: `
  <sm-steps :current="1">
    <sm-step>
      <!-- <span slot="title">Finished</span> -->
      <template slot="title">
        Finished
      </template>
      <span slot="description">This is a description.</span>
    </sm-step>
    <sm-step title="In Progress" sub-title="Left 00:00:08" description="This is a description." />
    <sm-step title="Waiting" description="This is a description." />
  </sm-steps>
   `
});
BasicSteps.story = {
  name: '基本用法'
};

export const SmallSteps = () => ({
  template: `
  <sm-steps :current="1" size="small">
    <sm-step title="Finished" />
    <sm-step title="In Progress" />
    <sm-step title="Waiting" />
  </sm-steps>
   `
});
SmallSteps.story = {
  name: '迷你版'
};

export const IconSteps = () => ({
  template: `
  <sm-steps>
    <sm-step status="finish" title="Login">
      <sm-icon slot="icon" type="user" />
    </sm-step>
    <sm-step status="finish" title="Verification">
      <sm-icon slot="icon" type="solution" />
    </sm-step>
    <sm-step status="process" title="Pay">
      <sm-icon slot="icon" type="loading" />
    </sm-step>
    <sm-step status="wait" title="Done">
      <sm-icon slot="icon" type="smile-o" />
    </sm-step>
  </sm-steps>
   `
});
IconSteps.story = {
  name: '带图标的步骤条'
};

export const ChangeSteps = () => ({
  data() {
    return {
      current: 0,
      steps: [
        {
          title: 'First',
          content: 'First-content'
        },
        {
          title: 'Second',
          content: 'Second-content'
        },
        {
          title: 'Last',
          content: 'Last-content'
        }
      ]
    };
  },
  methods: {
    next() {
      this.current++;
    },
    prev() {
      this.current--;
    }
  },
  template: `
  <div>
    <sm-steps :current="current">
      <sm-step v-for="item in steps" :key="item.title" :title="item.title" />
    </sm-steps>
    <div style="margin-top: 16px; border: 1px dashed #e9e9e9; border-radius: 6px; min-height: 200px; text-align: center; padding-top: 80px;">
      {{ steps[current].content }}
    </div>
    <div style="margin-top: 24px">
      <sm-button v-if="current < steps.length - 1" type="primary" @click="next">
        Next
      </sm-button>
      <sm-button
        v-if="current == steps.length - 1"
        type="primary"
        @click="$message.success('Processing complete!')"
      >
        Done
      </sm-button>
      <sm-button v-if="current > 0" style="margin-left: 8px" @click="prev">
        Previous
      </sm-button>
    </div>
  </div>
   `
});
ChangeSteps.story = {
  name: '步骤切换'
};

export const VerticalSteps = () => ({
  template: `
 <sm-steps direction="vertical" :current="1">
    <sm-step title="Finished" description="This is a description." />
    <sm-step title="In Progress" description="This is a description." />
    <sm-step title="Waiting" description="This is a description." />
  </sm-steps>
   `
});
VerticalSteps.story = {
  name: '竖直方向的步骤条'
};

export const VerticalSmallSteps = () => ({
  template: `
  <sm-steps direction="vertical" size="small" :current="1">
    <sm-step title="Finished" description="This is a description." />
    <sm-step title="In Progress" description="This is a description." />
    <sm-step title="Waiting" description="This is a description." />
  </sm-steps>
   `
});
VerticalSmallSteps.story = {
  name: '竖直方向的小型步骤条'
};

export const RunErrorSteps = () => ({
  template: `
  <sm-steps :current="1" status="error">
    <sm-step title="Finished" description="This is a description." />
    <sm-step title="In Progress" description="This is a description." />
    <sm-step title="Waiting" description="This is a description." />
  </sm-steps>
   `
});
RunErrorSteps.story = {
  name: '步骤运行错误'
};

export const PointSteps = () => ({
  template: `
  <div>
    <sm-steps progress-dot :current="1" style="margin-bottom: 50px">
      <sm-step title="Finished" description="This is a description." />
      <sm-step title="In Progress" description="This is a description." />
      <sm-step title="Waiting" description="This is a description." />
    </sm-steps>
    <sm-divider />
    <sm-steps progress-dot :current="1" direction="vertical">
      <sm-step title="Finished" description="This is a description. This is a description." />
      <sm-step title="Finished" description="This is a description. This is a description." />
      <sm-step title="In Progress" description="This is a description. This is a description." />
      <sm-step title="Waiting" description="This is a description." />
      <sm-step title="Waiting" description="This is a description." />
    </sm-steps>
  </div>
   `
});
PointSteps.story = {
  name: '点状步骤条'
};

export const CustomPointSteps = () => ({
  template: `
  <div>
    <sm-steps :current="1">
      <sm-popover slot="progressDot" slot-scope="{ index, status, prefixCls }">
        <template slot="content">
          <span>step {{ index }} status: {{ status }}</span>
        </template>
        <span/>
      </sm-popover>
      <sm-step title="Finished" description="You can hover on the dot." />
      <sm-step title="In Progress" description="You can hover on the dot." />
      <sm-step title="Waiting" description="You can hover on the dot." />
      <sm-step title="Waiting" description="You can hover on the dot." />
    </sm-steps>
  </div>
   `
});
CustomPointSteps.story = {
  name: '自定义点状步骤条'
};

import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/steps' };

export const BasicSteps = () => ({
  mixins: [theme],
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
  name: toI18n('basicComponent.basic')
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
  name: toI18n('basicComponent.steps.mini')
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
  name: toI18n('basicComponent.steps.withIcon')
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
      <sm-button v-if="current < steps.length - 1" type="primary" v-on:click="next">
        Next
      </sm-button>
      <sm-button
        v-if="current == steps.length - 1"
        type="primary"
        v-on:click="$message.success('Processing complete!')"
      >
        Done
      </sm-button>
      <sm-button v-if="current > 0" style="margin-left: 8px" v-on:click="prev">
        Previous
      </sm-button>
    </div>
  </div>
  `
});
ChangeSteps.story = {
  name: toI18n('basicComponent.steps.switchStep')
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
  name: toI18n('basicComponent.steps.vertical')
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
  name: toI18n('basicComponent.steps.verticalMiniVersion')
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
  name: toI18n('basicComponent.steps.errorStatus')
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
  name: toI18n('basicComponent.steps.dotStyle')
};

export const ClickableSteps = () => ({
  data() {
    return {
      current: 0
    };
  },
  methods: {
    onChange(current) {
      console.log('onChange:', current);
      this.current = current;
    }
  },
  template: `
  <div>
    <sm-steps :current="current" @change="onChange">
      <sm-step title="Step 1" description="This is a description." />
      <sm-step title="Step 2" description="This is a description." />
      <sm-step title="Step 3" description="This is a description." />
    </sm-steps>
    <sm-divider />
    <sm-steps v-model="current" direction="vertical">
      <sm-step title="Step 1" description="This is a description." />
      <sm-step title="Step 2" description="This is a description." />
      <sm-step title="Step 3" description="This is a description." />
    </sm-steps>
  </div>
  `
});
ClickableSteps.story = {
  name: toI18n('basicComponent.steps.clickable')
};

export const NavigationSteps = () => ({
  data() {
    return {
      current: 0,
      stepStyle: {
        marginBottom: '60px',
        boxShadow: '0px -1px 0 0 #e8e8e8 inset'
      }
    };
  },
  template: `
  <div>
    <sm-steps v-model="current" type="navigation" size="small" :style="stepStyle">
      <sm-step
        title="Step 1"
        sub-title="00:00:05"
        status="finish"
        description="This is a description."
      />
      <sm-step
        title="Step 2"
        sub-title="00:01:02"
        status="process"
        description="This is a description."
      />
      <sm-step
        title="Step 3"
        sub-title="waiting for longlong time"
        status="wait"
        description="This is a description."
      />
    </sm-steps>
    <sm-steps v-model="current" type="navigation" :style="stepStyle">
      <sm-step status="finish" title="Step 1" />
      <sm-step status="process" title="Step 2" />
      <sm-step status="wait" title="Step 3" />
      <sm-step status="wait" title="Step 4" />
    </sm-steps>
    <sm-steps v-model="current" type="navigation" size="small" :style="stepStyle">
      <sm-step status="finish" title="finish 1" />
      <sm-step status="finish" title="finish 2" />
      <sm-step status="process" title="current process" />
      <sm-step status="wait" title="wait" disabled />
    </sm-steps>
  </div>
  `
});
NavigationSteps.story = {
  name: toI18n('basicComponent.steps.navigationSteps')
};

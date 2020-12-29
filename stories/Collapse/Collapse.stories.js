import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/collapse'
};

export const BasicCollapse = () => ({
  mixins: [theme],
  data() {
    return {
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`
    };
  },
  template: `
  <sm-collapse>
    <sm-collapse-panel key="1" header="This is panel header 1">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="2" header="This is panel header 2" :disabled="false">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="3" header="This is panel header 3" disabled>
      <p>{{ text }}</p>
    </sm-collapse-panel>
  </sm-collapse>
  `
});
BasicCollapse.story = {
  name: toI18n('basicComponent.basic')
};

export const Accordion = () => ({
  data() {
    return {
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`
    };
  },
  template: `
  <sm-collapse accordion>
    <sm-collapse-panel key="1" header="This is panel header 1">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="2" header="This is panel header 2" :disabled="false">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="3" header="This is panel header 3" disabled>
      <p>{{ text }}</p>
    </sm-collapse-panel>
  </sm-collapse>
  `
});
Accordion.story = {
  name: toI18n('basicComponent.collapse.accordion')
};

export const NestedPanel = () => ({
  data() {
    return {
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`
    };
  },
  template: `
  <sm-collapse>
    <sm-collapse-panel key="1" header="This is panel header 1">
      <sm-collapse default-active-key="4">
        <sm-collapse-panel key="4" header="This is panel nest panel">
          <p>{{ text }}</p>
        </sm-collapse-panel>
      </sm-collapse>
    </sm-collapse-panel>
    <sm-collapse-panel key="2" header="This is panel header 2" :disabled="false">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="3" header="This is panel header 3">
      <p>{{ text }}</p>
    </sm-collapse-panel>
  </sm-collapse>
  `
});

NestedPanel.story = {
  name: toI18n('basicComponent.collapse.nestedPanel')
};

export const CustomPanel = () => ({
  data() {
    return {
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`,
      customStyle: 'border-radius: 4px;margin-bottom: 24px;border: 0;overflow: hidden'
    };
  },
  template: `
  <sm-collapse>
    <sm-collapse-panel key="1" header="This is panel header 1" :style="customStyle">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="2" header="This is panel header 2" :style="customStyle">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel key="3" header="This is panel header 3" :style="customStyle">
      <p>{{ text }}</p>
    </sm-collapse-panel>
  </sm-collapse>
  `
});

CustomPanel.story = {
  name: toI18n('basicComponent.collapse.customPanel')
};

export const HideArrow = () => ({
  data() {
    return {
      text: `A dog is a type of domesticated animal.Known for its loyalty and faithfulness,it can be found as a welcome guest in many households across the world.`
    };
  },
  template: `
  <sm-collapse default-active-key="1">
    <sm-collapse-panel key="1" header="This is panel header with arrow icon">
      <p>{{ text }}</p>
    </sm-collapse-panel>
    <sm-collapse-panel
      key="2"
      header="This is panel header with no arrow icon"
      :show-arrow="false"
    >
      <p>{{ text }}</p>
    </sm-collapse-panel>
  </sm-collapse>
  `
});

HideArrow.story = {
  name: toI18n('basicComponent.collapse.hideArrow')
};

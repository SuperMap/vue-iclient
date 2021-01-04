import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/tabs' };

export const BasicTabs = () => ({
  mixins: [theme],
  template: `
  <div>
    <sm-tabs default-active-key="1">
      <sm-tab-pane key="1" tab="Tab 1">
        Content of Tab Pane 1
      </sm-tab-pane>
      <sm-tab-pane key="2" tab="Tab 2" force-render>
        Content of Tab Pane 2
      </sm-tab-pane>
      <sm-tab-pane key="3" tab="Tab 3">
        Content of Tab Pane 3
      </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
BasicTabs.story = {
  name: toI18n('basicComponent.basic')
};

export const DisabledTabs = () => ({
  template: `
  <sm-tabs default-active-key="1">
    <sm-tab-pane key="1" tab="Tab 1">
      Tab 1
    </sm-tab-pane>
    <sm-tab-pane key="2" tab="Tab 2" disabled>
      Tab 2
    </sm-tab-pane>
    <sm-tab-pane key="3" tab="Tab 3">
      Tab 3
    </sm-tab-pane>
  </sm-tabs>
  `
});
DisabledTabs.story = {
  name: toI18n('basicComponent.disabled')
};

export const IconTabs = () => ({
  template: `
  <sm-tabs default-active-key="2">
    <sm-tab-pane key="1">
      <span slot="tab">
        <sm-icon type="apple" />
        Tab 1
      </span>
      Tab 1
    </sm-tab-pane>
    <sm-tab-pane key="2">
      <span slot="tab">
        <sm-icon type="android" />
        Tab 2
      </span>
      Tab 2
    </sm-tab-pane>
  </sm-tabs>
  `
});
IconTabs.story = {
  name: toI18n('basicComponent.tabs.icon')
};

export const SlideTabs = () => ({
  data() {
    return {
      mode: 'top'
    };
  },
  template: `
  <div style="width: 500px">
    <sm-radio-group v-model="mode" :style="{ marginBottom: '8px' }">
      <sm-radio-button value="top">
        Horizontal
      </sm-radio-button>
      <sm-radio-button value="left">
        Vertical
      </sm-radio-button>
    </sm-radio-group>
    <sm-tabs
      default-active-key="1"
      :tab-position="mode"
      :style="{ height: '200px' }"
    >
      <sm-tab-pane v-for="i in 30" :key="i" :tab="i"> Content of tab {{ i }} </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
SlideTabs.story = {
  name: toI18n('basicComponent.tabs.slide')
};

export const TabsContent = () => ({
  template: `
  <sm-tabs>
    <sm-tab-pane key="1" tab="Tab 1">
      Content of tab 1
    </sm-tab-pane>
    <sm-tab-pane key="2" tab="Tab 2">
      Content of tab 2
    </sm-tab-pane>
    <sm-tab-pane key="3" tab="Tab 3">
      Content of tab 3
    </sm-tab-pane>
    <sm-button slot="tabBarExtraContent">
      Extra Action
    </sm-button>
  </sm-tabs>
  `
});
TabsContent.story = {
  name: toI18n('basicComponent.tabs.extraContent')
};

export const TabsSize = () => ({
  data() {
    return {
      size: 'small'
    };
  },
  template: `
  <div>
    <sm-radio-group v-model="size" style="margin-bottom: 16px">
      <sm-radio-button value="small">
        Small
      </sm-radio-button>
      <sm-radio-button value="default">
        Default
      </sm-radio-button>
      <sm-radio-button value="large">
        Large
      </sm-radio-button>
    </sm-radio-group>
    <sm-tabs default-active-key="2" :size="size">
      <sm-tab-pane key="1" tab="Tab 1">
        Content of tab 1
      </sm-tab-pane>
      <sm-tab-pane key="2" tab="Tab 2">
        Content of tab 2
      </sm-tab-pane>
      <sm-tab-pane key="3" tab="Tab 3">
        Content of tab 3
      </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
TabsSize.story = {
  name: toI18n('basicComponent.tabs.size')
};

export const TabsLocation = () => ({
  data() {
    return {
      tabPosition: 'top'
    };
  },
  template: `
   <div style="width: 500px">
    <sm-radio-group v-model="tabPosition" style="margin:8px">
      <sm-radio-button value="top">
        top
      </sm-radio-button>
      <sm-radio-button value="bottom">
        bottom
      </sm-radio-button>
      <sm-radio-button value="left">
        left
      </sm-radio-button>
      <sm-radio-button value="right">
        right
      </sm-radio-button>
    </sm-radio-group>
    <sm-tabs default-active-key="1" :tab-position="tabPosition">
      <sm-tab-pane key="1" tab="Tab 1">
        Content of Tab 1
      </sm-tab-pane>
      <sm-tab-pane key="2" tab="Tab 2">
        Content of Tab 2
      </sm-tab-pane>
      <sm-tab-pane key="3" tab="Tab 3">
        Content of Tab 3
      </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
TabsLocation.story = {
  name: toI18n('basicComponent.tabs.position')
};

export const CardTabs = () => ({
  template: `
  <sm-tabs type="card" >
    <sm-tab-pane key="1" tab="Tab 1">
      Content of Tab Pane 1
    </sm-tab-pane>
    <sm-tab-pane key="2" tab="Tab 2">
      Content of Tab Pane 2
    </sm-tab-pane>
    <sm-tab-pane key="3" tab="Tab 3">
      Content of Tab Pane 3
    </sm-tab-pane>
  </sm-tabs>
  `
});
CardTabs.story = {
  name: toI18n('basicComponent.tabs.cardTypeTab')
};

export const AddDeleteTabs = () => ({
  data() {
    const panes = [{
      title: 'Tab 1',
      content: 'Content of Tab 1',
      key: '1'
    },
    {
      title: 'Tab 2',
      content: 'Content of Tab 2',
      key: '2'
    },
    {
      title: 'Tab 3',
      content: 'Content of Tab 3',
      key: '3',
      closable: false
    }
    ];
    return {
      activeKey: panes[0].key,
      panes,
      newTabIndex: 0
    };
  },
  methods: {
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    add() {
      const panes = this.panes;
      const activeKey = `newTab${this.newTabIndex++}`;
      panes.push({
        title: 'New Tab',
        content: 'Content of new Tab',
        key: activeKey
      });
      this.panes = panes;
      this.activeKey = activeKey;
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.panes.filter(pane => pane.key !== targetKey);
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key;
        } else {
          activeKey = panes[0].key;
        }
      }
      this.panes = panes;
      this.activeKey = activeKey;
    }
  },
  template: `
  <sm-tabs v-model="activeKey" type="editable-card" v-on:edit="onEdit">
    <sm-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
      {{ pane.content }}
    </sm-tab-pane>
  </sm-tabs>
  `
});
AddDeleteTabs.story = {
  name: toI18n('basicComponent.tabs.addCloseTab')
};

export const CardTabsContainer = () => ({
  data() {
    return {};
  },
  template: `
  <div style="background: rgba(250,250,252,.1);">
    <sm-tabs type="card">
      <sm-tab-pane key="1" tab="Tab Title 1">
        <p>Content of Tab Pane 1</p>
        <p>Content of Tab Pane 1</p>
        <p>Content of Tab Pane 1</p>
      </sm-tab-pane>
      <sm-tab-pane key="2" tab="Tab Title 2">
        <p>Content of Tab Pane 2</p>
        <p>Content of Tab Pane 2</p>
        <p>Content of Tab Pane 2</p>
      </sm-tab-pane>
      <sm-tab-pane key="3" tab="Tab Title 3">
        <p>Content of Tab Pane 3</p>
        <p>Content of Tab Pane 3</p>
        <p>Content of Tab Pane 3</p>
      </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
CardTabsContainer.story = {
  name: toI18n('basicComponent.tabs.containerTypeTab')
};

export const CustomAddTabs = () => ({
  data() {
    const panes = [{
      title: 'Tab 1',
      content: 'Content of Tab 1',
      key: '1'
    },
    {
      title: 'Tab 2',
      content: 'Content of Tab 2',
      key: '2'
    }
    ];
    return {
      activeKey: panes[0].key,
      panes,
      newTabIndex: 0
    };
  },
  methods: {
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    add() {
      const panes = this.panes;
      const activeKey = `newTab${this.newTabIndex++}`;
      panes.push({
        title: `New Tab ${activeKey}`,
        content: `Content of new Tab ${activeKey}`,
        key: activeKey
      });
      this.panes = panes;
      this.activeKey = activeKey;
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.panes.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.panes.filter(pane => pane.key !== targetKey);
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].key;
        } else {
          activeKey = panes[0].key;
        }
      }
      this.panes = panes;
      this.activeKey = activeKey;
    }
  },
  template: `
  <div>
    <div :style="{ marginBottom: '16px' }">
      <sm-button v-on:click="add">
        ADD
      </sm-button>
    </div>
    <sm-tabs v-model="activeKey" hide-add type="editable-card" v-on:edit="onEdit">
      <sm-tab-pane v-for="pane in panes" :key="pane.key" :tab="pane.title" :closable="pane.closable">
        {{ pane.content }}
      </sm-tab-pane>
    </sm-tabs>
  </div>
  `
});
CustomAddTabs.story = {
  name: toI18n('basicComponent.tabs.customizedTrigger')
};

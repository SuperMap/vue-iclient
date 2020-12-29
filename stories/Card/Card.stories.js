import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/card'
};

export const card = () => ({
  mixins: [theme],
  template: `
  <div>
    <sm-card title="Default size card" style="width: 300px">
      <a slot="extra" >more</a>
      <p>card content</p>
      <p>card content</p>
      <p>card content</p>
    </sm-card>
    <br />
    <sm-card size="small" title="Small size card" style="width: 300px">
      <a slot="extra" >more</a>
      <p>card content</p>
      <p>card content</p>
      <p>card content</p>
    </sm-card>
  </div>
    `
});
card.story = {
  name: toI18n('basicComponent.basic')
};

export const CustomizedContentCard = () => ({
  template: `
  <sm-card hoverable style="width: 240px">
    <img
    slot="cover"
    alt="example"
    src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
    />
    <sm-card-meta title="Europe Street beat">
    <template slot="description">
        www.instagram.com
    </template>
    </sm-card-meta>
  </sm-card>
    `
});
CustomizedContentCard.story = {
  name: toI18n('basicComponent.card.customizedContent')
};

export const LoadingCard = () => ({
  data() {
    return {
      loading: true
    };
  },
  methods: {
    handleClick() {
      this.loading = !this.loading;
    }
  },
  template: `
  <div>
    <sm-card :loading="loading" title="Card title">
      whatever content
    </sm-card>
    <sm-button style="marginTop: 16px" v-on:click="handleClick">
      Toggle loading
    </sm-button>
  </div>
    `
});
LoadingCard.story = {
  name: toI18n('basicComponent.card.loadingCard')
};

export const SimpleCard = () => ({
  template: `
  <sm-card style="width: 300px">
    <p>Card content</p>
    <p>Card content</p>
    <p>Card content</p>
  </sm-card>
    `
});
SimpleCard.story = {
  name: toI18n('basicComponent.card.simple')
};

export const NoBorderCard = () => ({
  template: `
  <div style="background: rgba(0, 0, 0, 0.25); padding:30px">
    <sm-card title="Card title" :bordered="false" style="width: 300px">
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </sm-card>
  </div>
    `
});
NoBorderCard.story = {
  name: toI18n('basicComponent.card.noBorder')
};

export const GridCard = () => ({
  template: `
  <sm-card title="Card Title">
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center" :hoverable="false">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
    <sm-card-grid style="width:25%;text-align:center">
      Content
    </sm-card-grid>
  </sm-card>
    `
});
GridCard.story = {
  name: toI18n('basicComponent.card.grid')
};

export const InnerCard = () => ({
  template: `
  <sm-card title="Card title">
    <p style="fontSize: 14px;color: rgba(0, 0, 0, 0.85); marginBottom: 16px;fontWeight: 500">
      Group title
    </p>
    <sm-card title="Inner card title">
      <a slot="extra" href="#">More</a>
      Inner Card content
    </sm-card>
    <sm-card title="Inner card title" :style="{ marginTop: '16px' }">
      <a slot="extra" href="#">More</a>
      Inner Card content
    </sm-card>
  </sm-card>
    `
});
InnerCard.story = {
  name: toI18n('basicComponent.card.inner')
};

export const SupportMoreContentCard = () => ({
  template: `
  <sm-card hoverable style="width: 300px">
    <img
      slot="cover"
      alt="example"
      src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
    />
    <template slot="actions" class="ant-card-actions">
      <sm-icon key="setting" type="setting" />
      <sm-icon key="edit" type="edit" />
      <sm-icon key="ellipsis" type="ellipsis" />
    </template>
    <sm-card-meta title="Card title" description="This is the description">
      <sm-avatar
        slot="avatar"
        src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
      />
    </sm-card-meta>
  </sm-card>
    `
});
SupportMoreContentCard.story = {
  name: toI18n('basicComponent.card.supportMoreContent')
};

export const WithTabsCard = () => ({
  data() {
    return {
      tabList: [
        {
          key: 'tab1',
          scopedSlots: { tab: 'customRender' }
        },
        {
          key: 'tab2',
          tab: 'tab2'
        }
      ],
      contentList: {
        tab1: 'content1',
        tab2: 'content2'
      },
      tabListNoTitle: [
        {
          key: 'article',
          tab: 'article'
        },
        {
          key: 'app',
          tab: 'app'
        },
        {
          key: 'project',
          tab: 'project'
        }
      ],
      key: 'tab1',
      noTitleKey: 'app'
    };
  },
  methods: {
    onTabChange(key, type) {
      this[type] = key;
    }
  },
  template: `
  <div>
    <sm-card
      style="width:100%"
      title="Card title"
      :tab-list="tabList"
      :active-tab-key="key"
      @tabChange="key => onTabChange(key, 'key')"
    >
      <span slot="customRender" slot-scope="item"> <sm-icon type="home" />{{ item.key }} </span>
      <a slot="extra">More</a>
      {{ contentList[key] }}
    </sm-card>
    <br /><br />
    <sm-card
      style="width:100%"
      :tab-list="tabListNoTitle"
      :active-tab-key="noTitleKey"
      @tabChange="key => onTabChange(key, 'noTitleKey')"
    >
      <p v-if="noTitleKey === 'article'">
        article content
      </p>
      <p v-else-if="noTitleKey === 'app'">
        app content
      </p>
      <p v-else="noTitleKey === 'project'">
        project content
      </p>
      <a slot="tabBarExtraContent">More</a>
    </sm-card>
  </div>
    `
});
WithTabsCard.story = {
  name: toI18n('basicComponent.card.WithTabs')
};

import { mount } from '@vue/test-utils';
import SmCard from '../Card.vue';
import Card from '../index';
import SmCardGrid from '../Grid.vue';
import SmCardMeta from '../Meta.vue';

describe('Card.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount(SmCard);
    expect(wrapper.find('.sm-component-card').exists()).toBe(true);
    expect(wrapper.find('.sm-component-card-bordered').exists()).toBe(true);
  });

  it('render index correctly', () => {
    wrapper = mount(Card);
    expect(wrapper.find('.sm-component-card').exists()).toBe(true);
  });

  it('onTabChange should work', () => {
    const tabList = [
      {
        key: 'tab1',
        tab: 'tab1'
      },
      {
        key: 'tab2',
        tab: 'tab2'
      }
    ];
    const contentList = {
      tab1: 'content1',
      tab2: 'content2'
    };
    const onTabChange = jest.fn();
    wrapper = mount(
      {
        template: `
      <sm-card @tabChange="onTabChange" :tabList="tabList" title="Card title">
        Card
      </sm-card>`,
        components: {
          SmCard
        },
        data() {
          return {
            tabList: tabList,
            contentList: contentList
          };
        },
        methods: {
          onTabChange: onTabChange
        }
      },
      {
        sync: false
      }
    );
    const tabBtn = wrapper.findAll('.sm-component-tabs-tab');
    tabBtn.at(0).trigger('click');
    expect(onTabChange).toHaveBeenCalledWith('tab1');
    tabBtn.at(1).trigger('click');
    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });

  it('render correctly', () => {
    wrapper = mount(
      {
        template: `
      <sm-card title="Card Title">
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
      </sm-card>`,
        components: {
          SmCard,
          SmCardGrid
        }
      },
      {
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-card').exists()).toBe(true);
    const cardGrid = wrapper.findAll('.sm-component-card-grid');
    expect(cardGrid.length).toBe(4);
  });

  it('render correctly', () => {
    wrapper = mount(
      {
        template: `
        <sm-card hoverable style="width: 240px">
        <img
          slot="cover"
          alt="example"
          src="https://test.png"
        />
        <sm-card-meta title="Card Meta Test">
          <template slot="description">
            www.test.com
          </template>
        </sm-card-meta>
      </sm-card>`,
        components: {
          SmCard,
          SmCardMeta
        }
      },
      {
        sync: false
      }
    );
    expect(wrapper.find('.sm-component-card').exists()).toBe(true);
    expect(wrapper.find('.sm-component-card-meta-title').text()).toBe('Card Meta Test');
    expect(wrapper.find('.sm-component-card-meta-description').text()).toBe('www.test.com');
  });
});

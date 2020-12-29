import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/pagination' };

export const BasicPagination = () => ({
  mixins: [theme],
  template: `
  <sm-pagination :total="50" />
  `
});
BasicPagination.story = {
  name: toI18n('basicComponent.basic')
};

export const MorePagination = () => ({
  template: `
  <sm-pagination :default-current="6" :total="500" />
  `
});
MorePagination.story = {
  name: toI18n('basicComponent.pagination.more')
};

export const ChangePagination = () => ({
  data() {
    return {
      pageSize: 20,
      current: 4
    };
  },
  template: `
  <div>
    <sm-pagination
      show-size-changer
      :default-current="3"
      :total="500"
    />
    <br />
    <sm-pagination
      v-model="current"
      show-size-changer
      :page-size.sync="pageSize"
      :total="500"
      disabled
    />
  </div>
  `
});
ChangePagination.story = {
  name: toI18n('basicComponent.pagination.changer')
};

export const CustomDropdownOptionsPagination = () => ({
  data() {
    return {
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      current: 1,
      pageSize: 10,
      total: 50
    };
  },
  methods: {
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
    }
  },
  template: `
  <sm-pagination
    v-model="current"
    :page-size-options="pageSizeOptions"
    :total="total"
    show-size-changer
    :page-size="pageSize"
    @showSizeChange="onShowSizeChange"
  >
    <template slot="buildOptionText" slot-scope="props">
      <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
      <span v-if="props.value === '50'">全部</span>
    </template>
  </sm-pagination>
  `
});
CustomDropdownOptionsPagination.story = {
  name: toI18n('basicComponent.pagination.customDropdownOptions')
};

export const JumpPagination = () => ({
  template: `
  <div>
    <sm-pagination show-quick-jumper :default-current="2" :total="500" />
    <br />
    <sm-pagination
      show-quick-jumper
      :default-current="2"
      :total="500"
      disabled
      show-less-items
    />
  </div>
  `
});
JumpPagination.story = {
  name: toI18n('basicComponent.pagination.jumper')
};

export const SmallPagination = () => ({
  data() {
    return {
      total: ''
    };
  },
  methods: {
    showTotal(total) {
      return total => `Total ${total} items`;
    }
  },
  template: `
  <div>
    <sm-pagination size="small" :total="50" />
    <sm-pagination style="margin:10px 0" size="small" :total="50" show-size-changer show-quick-jumper />
    <sm-pagination size="small" :total="50" :show-total="showTotal(total)" />
  </div>
  `
});
SmallPagination.story = {
  name: toI18n('basicComponent.pagination.mini')
};

export const SimplePagination = () => ({
  template: `
  <sm-pagination simple :default-current="2" :total="50" />
  `
});
SimplePagination.story = {
  name: toI18n('basicComponent.pagination.simple')
};

export const ControlledPagination = () => ({
  data() {
    return {
      current: 3
    };
  },
  methods: {
    onChange(current) {
      this.current = current;
    }
  },
  template: `
  <sm-pagination :current="current" :total="50" @change="onChange" />
  `
});
ControlledPagination.story = {
  name: toI18n('basicComponent.pagination.controlled')
};

export const ShowSumPagination = () => ({
  data() {
    return {
      total: '',
      range: ''
    };
  },
  methods: {
    showTotal(total) {
      return total => `Total ${total} items`;
    },
    showRangeTotal(total, range) {
      return (total, range) => `${range[0]}-${range[1]} of ${total} items`;
    }
  },
  template: `
  <div>
    <sm-pagination
      :total="85"
      :show-total="showTotal(total)"
      :page-size="20"
      :default-current="1"
    />
    <br />
    <sm-pagination
      :total="85"
      :show-total="showRangeTotal(total, range)"
      :page-size="20"
      :default-current="1"
    />
  </div>
  `
});
ShowSumPagination.story = {
  name: toI18n('basicComponent.pagination.totalNumber')
};

export const PrevNextPagination = () => ({
  methods: {
    itemRender(current, type, originalElement) {
      if (type === 'prev') {
        return 'Previous';
      } else if (type === 'next') {
        return 'Next';
      }
      return originalElement;
    }
  },
  template: `
  <sm-pagination :total="500" :item-render="itemRender" />
  `
});
PrevNextPagination.story = {
  name: toI18n('basicComponent.pagination.prevAndNext')
};

import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'Basic/pagination', decorators: [withKnobs] };

export const BasicPagination = () => ({
  template: `
    <sm-pagination :total="50" />
  `
});
BasicPagination.story = {
  name: '基本分页'
};

export const MorePagination = () => ({
  template: `
  <sm-pagination :default-current="6" :total="500" />
  `
});
MorePagination.story = {
  name: '更多分页'
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
  name: '改变分页'
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
  name: '可跳转的分页'
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
  name: '迷你分页'
};

export const SimplePagination = () => ({
  template: `
    <sm-pagination simple :default-current="2" :total="50" />
  `
});
SimplePagination.story = {
  name: '简单分页'
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
  name: '通过showTotal展示总数的分页'
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
  name: '上/下一步改为文字的分页'
};

import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/table'
};

export const BasicTable = () => ({
  mixins: [theme],
  data() {
    return {
      data: [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          address: 'New York No. 1 Lake Park',
          tags: ['nice', 'developer']
        },
        {
          key: '2',
          name: 'Jim Green',
          age: 42,
          address: 'London No. 1 Lake Park',
          tags: ['loser']
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          address: 'Sidney No. 1 Lake Park',
          tags: ['cool', 'teacher']
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: 'Age',
          dataIndex: 'age',
          key: 'age'
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address'
        },
        {
          title: 'Tags',
          key: 'tags',
          dataIndex: 'tags',
          scopedSlots: { customRender: 'tags' }
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="data">
  </sm-table>
  `
});
BasicTable.story = {
  name: toI18n('basicComponent.basic')
};

export const EllipsisTable = () => ({
  data() {
    return {
      data: [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          address: 'New York No. 1 Lake Park, New York No. 1 Lake Park',
          tags: ['nice', 'developer']
        },
        {
          key: '2',
          name: 'Jim Green',
          age: 42,
          address: 'London No. 1 Lake Park, New York No. 1 Lake Park',
          tags: ['loser']
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          address: 'Sidney No. 1 Lake Park, New York No. 1 Lake Park',
          tags: ['cool', 'teacher']
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: 'Age',
          dataIndex: 'age',
          key: 'age'
        },
        {
          title: 'Address',
          dataIndex: 'address',
          key: 'address',
          ellipsis: true
        },
        {
          title: 'Tags',
          key: 'tags',
          dataIndex: 'tags',
          scopedSlots: { customRender: 'tags' },
          ellipsis: true
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="data">
    <a slot="name" slot-scope="text">{{ text }}</a>
  </sm-table>
  `
});
EllipsisTable.story = {
  name: toI18n('basicComponent.table.cellAutoEllipsis')
};

export const Border = () => ({
  data() {
    return {
      data: [
        {
          key: '1',
          name: 'John Brown',
          money: '￥300,000.00',
          address: 'New York No. 1 Lake Park'
        },
        {
          key: '2',
          name: 'Jim Green',
          money: '￥1,256,000.00',
          address: 'London No. 1 Lake Park'
        },
        {
          key: '3',
          name: 'Joe Black',
          money: '￥120,000.00',
          address: 'Sidney No. 1 Lake Park'
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: 'Cash Assets',
          className: 'column-money',
          dataIndex: 'money'
        },
        {
          title: 'Address',
          dataIndex: 'address'
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="data" bordered>
    <template slot="name" slot-scope="text">
      <a>{{ text }}</a>
    </template>
    <template slot="title" slot-scope="currentPageData">
      Header
    </template>
    <template slot="footer" slot-scope="currentPageData">
      Footer
    </template>
  </sm-table>
  `
});
Border.story = {
  name: toI18n('basicComponent.table.border')
};

export const ColumnRowMerge = () => ({
  data() {
    return {
      data: [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          tel: '0571-22098909',
          phone: 18889898989,
          address: 'New York No. 1 Lake Park'
        },
        {
          key: '2',
          name: 'Jim Green',
          tel: '0571-22098333',
          phone: 18889898888,
          age: 42,
          address: 'London No. 1 Lake Park'
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          tel: '0575-22098909',
          phone: 18900010002,
          address: 'Sidney No. 1 Lake Park'
        },
        {
          key: '4',
          name: 'Jim Red',
          age: 18,
          tel: '0575-22098909',
          phone: 18900010002,
          address: 'London No. 2 Lake Park'
        },
        {
          key: '5',
          name: 'Jake White',
          age: 18,
          tel: '0575-22098909',
          phone: 18900010002,
          address: 'Dublin No. 2 Lake Park'
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          customRender(text, row, index) {
            if (index < 4) {
              return `${text}`;
            }
            return {
              children: `${text}`,
              attrs: {
                colSpan: 5
              }
            };
          }
        },
        {
          title: 'Age',
          dataIndex: 'age',
          customRender(value, row, index) {
            const obj = {
              children: value,
              attrs: {}
            };
            if (index === 4) {
              obj.attrs.colSpan = 0;
            }
            return obj;
          }
        },
        {
          title: 'Home phone',
          colSpan: 2,
          dataIndex: 'tel',
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {}
            };
            if (index === 2) {
              obj.attrs.rowSpan = 2;
            }
            // These two are merged into above cell
            if (index === 3) {
              obj.attrs.rowSpan = 0;
            }
            if (index === 4) {
              obj.attrs.colSpan = 0;
            }
            return obj;
          }
        },
        {
          title: 'Phone',
          colSpan: 0,
          dataIndex: 'phone',
          customRender(value, row, index) {
            const obj = {
              children: value,
              attrs: {}
            };
            if (index === 4) {
              obj.attrs.colSpan = 0;
            }
            return obj;
          }
        },
        {
          title: 'Address',
          dataIndex: 'address',
          customRender(value, row, index) {
            const obj = {
              children: value,
              attrs: {}
            };
            if (index === 4) {
              obj.attrs.colSpan = 0;
            }
            return obj;
          }
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="data" bordered>
    <template slot="name" slot-scope="text">
      <a>{{ text }}</a>
    </template>
  </sm-table>
  `
});
ColumnRowMerge.story = {
  name: toI18n('basicComponent.table.columnRowMerge')
};

const fixHeaderData = [];
for (let i = 0; i < 100; i++) {
  fixHeaderData.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`
  });
}

export const FixHeaderAndColumn = () => ({
  data() {
    return {
      fixHeaderData,
      columns: [
        { title: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left' },
        { title: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left' },
        { title: 'Column 1', dataIndex: 'address', key: '1', width: 150 },
        { title: 'Column 2', dataIndex: 'address', key: '2', width: 150 },
        { title: 'Column 3', dataIndex: 'address', key: '3', width: 150 },
        { title: 'Column 4', dataIndex: 'address', key: '4', width: 150 },
        { title: 'Column 5', dataIndex: 'address', key: '5', width: 150 },
        { title: 'Column 6', dataIndex: 'address', key: '6', width: 150 },
        { title: 'Column 7', dataIndex: 'address', key: '7', width: 150 },
        { title: 'Column 8', dataIndex: 'address', key: '8' },
        {
          title: 'Action',
          key: 'operation',
          fixed: 'right',
          width: 100,
          scopedSlots: { customRender: 'action' }
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="fixHeaderData" :scroll="{ x: 1500, y: 300 }">
    <a slot="action" slot-scope="text">action</a>
  </sm-table>
  `
});
FixHeaderAndColumn.story = {
  name: toI18n('basicComponent.table.fixHeaderAndColumn')
};

export const FilterAndSort = () => ({
  data() {
    return {
      data: [
        {
          key: '1',
          name: 'John Brown',
          age: 32,
          address: 'New York No. 1 Lake Park'
        },
        {
          key: '2',
          name: 'Jim Green',
          age: 42,
          address: 'London No. 1 Lake Park'
        },
        {
          key: '3',
          name: 'Joe Black',
          age: 32,
          address: 'Sidney No. 1 Lake Park'
        },
        {
          key: '4',
          name: 'Jim Red',
          age: 32,
          address: 'London No. 2 Lake Park'
        }
      ],
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          filters: [
            {
              text: 'Joe',
              value: 'Joe'
            },
            {
              text: 'Jim',
              value: 'Jim'
            },
            {
              text: 'Submenu',
              value: 'Submenu',
              children: [
                {
                  text: 'Green',
                  value: 'Green'
                },
                {
                  text: 'Black',
                  value: 'Black'
                }
              ]
            }
          ],
          onFilter: (value, record) => record.name.indexOf(value) === 0,
          sorter: (a, b) => a.name.length - b.name.length,
          sortDirections: ['descend']
        },
        {
          title: 'Age',
          dataIndex: 'age',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.age - b.age
        },
        {
          title: 'Address',
          dataIndex: 'address',
          filters: [
            {
              text: 'London',
              value: 'London'
            },
            {
              text: 'New York',
              value: 'New York'
            }
          ],
          filterMultiple: false,
          onFilter: (value, record) => record.address.indexOf(value) === 0,
          sorter: (a, b) => a.address.length - b.address.length,
          sortDirections: ['descend', 'ascend']
        }
      ]
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <sm-table :columns="columns" :data-source="data" />
  `
});
FilterAndSort.story = {
  name: toI18n('basicComponent.table.filterAndSort')
};

import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/tree'
};

export const BasicTree = () => ({
  mixins: [theme],
  data() {
    return {
      treeData: [{
        title: 'parent 1',
        key: '0-0',
        children: [{
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [{
            title: 'leaf',
            key: '0-0-0-0',
            disableCheckbox: true
          },
          {
            title: 'leaf',
            key: '0-0-0-1'
          }
          ]
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [{
            key: '0-0-1-0',
            scopedSlots: {
              title: 'title0010'
            }
          }]
        }
        ]
      }]
    };
  },
  template: `
  <sm-tree
    checkable
    :tree-data="treeData"
    :default-expanded-keys="['0-0-0', '0-0-1']"
    :default-selected-keys="['0-0-0', '0-0-1']"
    :default-checked-keys="['0-0-0', '0-0-1']"
  >
    <span slot="title0010" style="color: #1890ff">sss</span>
  </sm-tree>
  `
});
BasicTree.story = {
  name: toI18n('basicComponent.basic')
};

export const ControlledTree = () => ({
  data() {
    return {
      treeData: [{
        title: '0-0',
        key: '0-0',
        children: [{
          title: '0-0-0',
          key: '0-0-0',
          children: [{
            title: '0-0-0-0',
            key: '0-0-0-0'
          },
          {
            title: '0-0-0-1',
            key: '0-0-0-1'
          },
          {
            title: '0-0-0-2',
            key: '0-0-0-2'
          }
          ]
        },
        {
          title: '0-0-1',
          key: '0-0-1',
          children: [{
            title: '0-0-1-0',
            key: '0-0-1-0'
          },
          {
            title: '0-0-1-1',
            key: '0-0-1-1'
          },
          {
            title: '0-0-1-2',
            key: '0-0-1-2'
          }
          ]
        },
        {
          title: '0-0-2',
          key: '0-0-2'
        }
        ]
      },
      {
        title: '0-1',
        key: '0-1',
        children: [{
          title: '0-1-0-0',
          key: '0-1-0-0'
        },
        {
          title: '0-1-0-1',
          key: '0-1-0-1'
        },
        {
          title: '0-1-0-2',
          key: '0-1-0-2'
        }
        ]
      },
      {
        title: '0-2',
        key: '0-2'
      }
      ],
      expandedKeys: ['0-0-0', '0-0-1'],
      autoExpandParent: true,
      checkedKeys: ['0-0-0'],
      selectedKeys: []
    };
  },
  watch: {
    checkedKeys(val) {
      console.log('onCheck', val);
    }
  },
  methods: {
    onExpand(expandedKeys) {
      console.log('onExpand', expandedKeys);
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onCheck(checkedKeys) {
      console.log('onCheck', checkedKeys);
      this.checkedKeys = checkedKeys;
    },
    onSelect(selectedKeys, info) {
      console.log('onSelect', info);
      this.selectedKeys = selectedKeys;
    }
  },
  template: `
  <sm-tree
    v-model="checkedKeys"
    checkable
    :expanded-keys="expandedKeys"
    :auto-expand-parent="autoExpandParent"
    :selected-keys="selectedKeys"
    :tree-data="treeData"
    v-on:expand="onExpand"
    v-on:select="onSelect"
  />
  `
});
ControlledTree.story = {
  name: toI18n('basicComponent.tree.controlled')
};

export const ReplaceFieldsTree = () => ({
  data() {
    return {
      replaceFields: {
        children: 'child',
        title: 'name'
      },
      treeData: [
        {
          name: 'parent 1',
          key: '0-0',
          child: [
            {
              name: '张晨成',
              key: '0-0-0',
              disabled: true,
              child: [
                { name: 'leaf', key: '0-0-0-0', disableCheckbox: true },
                { name: 'leaf', key: '0-0-0-1' }
              ]
            },
            {
              name: 'parent 1-1',
              key: '0-0-1',
              child: [{ key: '0-0-1-0', name: 'zcvc' }]
            }
          ]
        }
      ]
    };
  },
  template: `
  <sm-tree
    checkable
    :tree-data="treeData"
    :default-expanded-keys="['0-0-0', '0-0-1']"
    :default-selected-keys="['0-0-0', '0-0-1']"
    :default-checked-keys="['0-0-0', '0-0-1']"
    :replace-fields="replaceFields"
  />
  `
});
ReplaceFieldsTree.story = {
  name: toI18n('basicComponent.tree.replaceFields')
};

export const DraggableTree = () => ({
  data() {
    return {
      gData: [],
      expandedKeys: ['0-0', '0-0-0', '0-0-0-0']
    };
  },
  created() {
    this.generateData(1);
  },
  methods: {
    generateData(_level, _preKey, _tns) {
      const x = 3;
      const y = 2;
      const gData = this.gData;
      const preKey = _preKey || '0';
      const tns = _tns || gData;
      const children = [];
      for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({ title: key, key });
        if (i < y) {
          children.push(key);
        }
      }
      if (_level < 0) {
        return tns;
      }
      const level = _level - 1;
      children.forEach((key, index) => {
        tns[index].children = [];
        return this.generateData(level, key, tns[index].children);
      });
    },
    onDragEnter(info) {
      console.log(info);
      // expandedKeys 需要受控时设置
      // this.expandedKeys = info.expandedKeys
    },
    onDrop(info) {
      console.log(info);
      const dropKey = info.node.eventKey;
      const dragKey = info.dragNode.eventKey;
      const dropPos = info.node.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const loop = (data, key, callback) => {
        data.forEach((item, index, arr) => {
          if (item.key === key) {
            return callback(item, index, arr);
          }
          if (item.children) {
            return loop(item.children, key, callback);
          }
        });
      };
      const data = [...this.gData];

      // Find dragObject
      let dragObj;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });
      if (!info.dropToGap) {
        // Drop on the content
        loop(data, dropKey, item => {
          item.children = item.children || [];
          // where to insert 示例添加到尾部，可以是随意位置
          item.children.push(dragObj);
        });
      } else if (
        (info.node.children || []).length > 0 && // Has children
        info.node.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
      ) {
        loop(data, dropKey, item => {
          item.children = item.children || [];
          // where to insert 示例添加到尾部，可以是随意位置
          item.children.unshift(dragObj);
        });
      } else {
        let ar;
        let i;
        loop(data, dropKey, (item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i, 0, dragObj);
        } else {
          ar.splice(i + 1, 0, dragObj);
        }
      }
      this.gData = data;
    }
  },
  template: `
  <sm-tree
    class="draggable-tree"
    :default-expanded-keys="expandedKeys"
    draggable
    :tree-data="gData"
    v-on:dragenter="onDragEnter"
    v-on:drop="onDrop"
  />
  `
});
DraggableTree.story = {
  name: toI18n('basicComponent.tree.draggable')
};

export const WithLineTree = () => ({
  data() {
    return {
      showLine: true,
      showIcon: false
    };
  },
  template: `
  <div>
    <div style="margin-bottom: 16px">
      showLine: <sm-switch v-model="showLine" />
      <br />
      <br />
      showIcon: <sm-switch v-model="showIcon" />
    </div>
    <sm-tree
      :show-line="showLine"
      :show-icon="showIcon"
      :default-expanded-keys="['0-0-0', '0-0-1', '0-0-2']"
    >
      <sm-icon slot="icon" type="carry-out" />
      <sm-tree-node key="0-0">
        <sm-icon slot="icon" type="carry-out" />
        <span slot="title" style="color: #1890ff">parent 1</span>
        <sm-tree-node key="0-0-0" title="parent 1-0">
          <sm-icon slot="icon" type="carry-out" />
          <sm-tree-node key="0-0-0-0" title="leaf">
            <sm-icon slot="icon" type="carry-out" />
          </sm-tree-node>
          <sm-tree-node key="0-0-0-1" title="leaf">
            <sm-icon slot="icon" type="carry-out" />
          </sm-tree-node>
          <sm-tree-node key="0-0-0-2" title="leaf">\
            <sm-icon slot="icon" type="carry-out" />
          </sm-tree-node>
        </sm-tree-node>
        <sm-tree-node key="0-0-1" title="parent 1-1">
          <sm-icon slot="icon" type="carry-out" />
          <sm-tree-node key="0-0-1-0" title="leaf">
            <sm-icon slot="icon" type="carry-out" />
          </sm-tree-node>
        </sm-tree-node>
        <sm-tree-node key="0-0-2" title="parent 1-2">
          <sm-icon slot="icon" type="carry-out" />
          <sm-tree-node key="0-0-2-0" title="leaf">
            <sm-icon slot="icon" type="carry-out" />
          </sm-tree-node>
          <sm-tree-node key="0-0-2-1" title="leaf">
            <sm-icon slot="icon" type="carry-out" />
            <sm-icon slot="switcherIcon" type="form" />
          </sm-tree-node>
        </sm-tree-node>
      </sm-tree-node>
    </sm-tree>
  </div>
  `
});
WithLineTree.story = {
  name: toI18n('basicComponent.tree.withLine')
};

export const DirectoryTree = () => ({
  data() {
    return {
      showLine: true,
      showIcon: false
    };
  },
  template: `
  <sm-directory-tree multiple default-expand-all>
    <sm-tree-node key="0-0" title="parent 0">
      <sm-tree-node key="0-0-0" title="leaf 0-0" is-leaf />
      <sm-tree-node key="0-0-1" title="leaf 0-1" is-leaf />
    </sm-tree-node>
    <sm-tree-node key="0-1" title="parent 1">
      <sm-tree-node key="0-1-0" title="leaf 1-0" is-leaf />
      <sm-tree-node key="0-1-1" title="leaf 1-1" is-leaf />
    </sm-tree-node>
  </sm-directory-tree>
  `
});
DirectoryTree.story = {
  name: toI18n('basicComponent.tree.directory')
};

export const CustomizeIconTree = () => ({
  data() {
    return {
      treeData: [
        {
          title: 'parent 1',
          key: '0-0',
          slots: {
            icon: 'smile'
          },
          children: [
            { title: 'leaf', key: '0-0-0', slots: { icon: 'meh' } },
            { title: 'leaf', key: '0-0-1', scopedSlots: { icon: 'custom' } }
          ]
        }
      ]
    };
  },
  template: `
  <sm-tree :tree-data="treeData" show-icon default-expand-all :default-selected-keys="['0-0-0']">
    <sm-icon slot="switcherIcon" type="down" />
    <sm-icon slot="smile" type="smile-o" />
    <sm-icon slot="meh" type="smile-o" />
    <template slot="custom" slot-scope="{ selected }">
      <sm-icon :type="selected ? 'frown' : 'frown-o'" />
    </template>
  </sm-tree>
  `
});
CustomizeIconTree.story = {
  name: toI18n('basicComponent.tree.customizeIcon')
};

export const LoadDataAsynchronouslyTree = () => ({
  data() {
    return {
      treeData: [
        { title: 'Expand to load', key: '0' },
        { title: 'Expand to load', key: '1' },
        { title: 'Tree Node', key: '2', isLeaf: true }
      ]
    };
  },
  methods: {
    onLoadData(treeNode) {
      return new Promise(resolve => {
        if (treeNode.dataRef.children) {
          resolve();
          return;
        }
        setTimeout(() => {
          treeNode.dataRef.children = [
            { title: 'Child Node', key: `${treeNode.eventKey}-0` },
            { title: 'Child Node', key: `${treeNode.eventKey}-1` }
          ];
          this.treeData = [...this.treeData];
          resolve();
        }, 1000);
      });
    }
  },
  template: `
  <sm-tree :load-data="onLoadData" :tree-data="treeData" />
  `
});
LoadDataAsynchronouslyTree.story = {
  name: toI18n('basicComponent.tree.loadDataAsynchronously')
};

export const SearchableTree = () => ({
  data() {
    return {
      gData: [],
      dataList: [],
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      treeData: [
        { title: 'Expand to load', key: '0' },
        { title: 'Expand to load', key: '1' },
        { title: 'Tree Node', key: '2', isLeaf: true }
      ]
    };
  },
  created() {
    this.generateData(2);
  },
  methods: {
    generateData(_level, _preKey, _tns) {
      const x = 3;
      const y = 2;
      const preKey = _preKey || '0';
      const tns = _tns || this.gData;
      const children = [];
      for (let i = 0; i < x; i++) {
        const key = `${preKey}-${i}`;
        tns.push({ title: key, key, scopedSlots: { title: 'title' } });
        if (i < y) {
          children.push(key);
        }
      }
      if (_level < 0) {
        return tns;
      }
      const level = _level - 1;
      children.forEach((key, index) => {
        tns[index].children = [];
        return this.generateData(level, key, tns[index].children);
      });
    },
    generateList(data) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const key = node.key;
        this.dataList.push({ key, title: key });
        if (node.children) {
          this.generateList(node.children);
        }
      }
    },
    getParentKey(key, tree) {
      let parentKey;
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
          if (node.children.some(item => item.key === key)) {
            parentKey = node.key;
          } else if (this.getParentKey(key, node.children)) {
            parentKey = this.getParentKey(key, node.children);
          }
        }
      }
      return parentKey;
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onChange(e) {
      const value = e.target.value;
      const expandedKeys = this.dataList
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return this.getParentKey(item.key, this.gData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      });
    }
  },
  template: `
  <div>
  <sm-input-search style="margin-bottom: 8px" placeholder="Search" @change="onChange" />
    <sm-tree
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :tree-data="gData"
      @expand="onExpand"
    >
      <template slot="title" slot-scope="{ title }">
        <span v-if="title.indexOf(searchValue) > -1">
          {{ title.substr(0, title.indexOf(searchValue)) }}
          <span style="color: #f50">{{ searchValue }}</span>
          {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ title }}</span>
      </template>
    </sm-tree>
  </div>
  `
});
SearchableTree.story = {
  name: toI18n('basicComponent.tree.searchable')
};

export const CustomizeCollapseExpandIconTree = () => ({
  template: `
  <sm-tree show-line :default-expanded-keys="['0-0-0']" >
    <sm-icon slot="switcherIcon" type="down" />
    <sm-tree-node key="0-0" title="parent 1">
      <sm-tree-node key="0-0-0" title="parent 1-0">
        <sm-tree-node key="0-0-0-0" title="leaf" />
        <sm-tree-node key="0-0-0-1" title="leaf" />
        <sm-tree-node key="0-0-0-2" title="leaf" />
      </sm-tree-node>
      <sm-tree-node key="0-0-1" title="parent 1-1">
        <sm-tree-node key="0-0-1-0" title="leaf" />
      </sm-tree-node>
      <sm-tree-node key="0-0-2" title="parent 1-2">
        <sm-tree-node key="0-0-2-0" title="leaf" />
        <sm-tree-node key="0-0-2-1" title="leaf" />
      </sm-tree-node>
    </sm-tree-node>
  </sm-tree>
  `
});
CustomizeCollapseExpandIconTree.story = {
  name: toI18n('basicComponent.tree.customizeCollapseExpandIcon')
};

<template>
  <SmCascader
    :options="options"
    :popupClassName="popupClassName"
    :changeOnSelect="changeOnSelect"
    :placeholder="$t('cascader.placeholder')"
    :popupStyle="popupStyle"
    class="sm-component-feature-cascader"
    @change="onChange"
  />
</template>
<script>
import SmCascader from 'vue-iclient/src/common/cascader/Cascader.vue';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import getFeatures from 'vue-iclient/src/common/_utils/get-features';
import uniqBy from 'lodash.uniqby';
import isEqual from 'lodash.isequal';
import omit from 'omit.js';

const ROOT_VALUE = 'root';
export default {
  name: 'SmFeatureCascader',
  components: {
    SmCascader
  },
  mixins: [Theme],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    // {idField, titleField, dataset, parentField, children}
    config: {
      type: Object
    },
    popupClassName: {
      type: String,
      default: 'sm-component-feature-cascader__dropdown'
    },
    changeOnSelect: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array
    },
    popupStyle: {
      type: Object
    }
  },
  data() {
    return {
      options: []
    };
  },
  watch: {
    config: {
      handler(newVal, oldVal) {
        if(!isEqual(newVal, oldVal)) {
          this.createOptions();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async requestData(config) {
      const { dataset, idField, titleField, parentField, children } = config;
      const data = await getFeatures({ ...dataset, hasGeometry: false });
      const features = data.features;
      const fields = data.fields;
      const keyIndex = fields.indexOf(idField);
      const nameIndex = fields.indexOf(titleField);
      const parentValueIdx = parentField ? fields.indexOf(parentField) : -1;

      const values = data.fieldValues;
      let result = features.map((f, featureIndex) => {
        return {
          value: values[keyIndex][featureIndex],
          label: values[nameIndex][featureIndex],
          parentValue: parentField ? values[parentValueIdx][featureIndex] : ROOT_VALUE,
          dataset,
          idField
        };
      });
      if(children) {
        const childOptions = await this.requestData(children);
        result = result.concat(childOptions);
      }
      return uniqBy(result, 'value');
    },
    formatOptions(allData, nodesMap) {
      const result = [];
      nodesMap.forEach((children, parentId) => {
        const target = allData.find(v => v.parentValue === parentId);
        result.push({
          value: target.parentValue,
          label: target.parentValue,
          children: this.formatChildren(children)
        });
      }, this);
      return result;
    },
    formatChildren(childs) {
      return childs.map(v => {
        const option = {
          label: v.label,
          value: v.value
        };
        if (v.children) {
          const newChilds = this.formatChildren(v.children);
          this.$set(option, 'children', newChilds);
        }
        return option;
      }, this);
    },
    findChildNodes(nodesMap, children) {
      for (const child of children) {
        const value = child.value;
        const childrenMap = nodesMap.get(value);
        if (!childrenMap) continue;

        child.children = childrenMap;
        nodesMap.delete(value);
        this.findChildNodes(nodesMap, childrenMap);
      }
    },
    assembleOptions(array) {
      const allData = array.flat();
      // 创建parentId到子项数组的映射
      const nodesMap = new Map();

      // 初始化映射表
      allData.forEach(item => {
        const parentId = item.parentValue ?? ROOT_VALUE;
        if (!nodesMap.has(parentId)) {
          nodesMap.set(parentId, []);
        }
        nodesMap.get(parentId).push(item);
      });

      // 将子的往父的children属性添加
      nodesMap.forEach((children, parentId) => {
        this.findChildNodes(nodesMap, children, parentId);
      }, this);

      // 格式化成组件需要的格式
      const result = this.formatOptions(allData, nodesMap);
      return result[0].children;
    },
    async createOptions() {
      if(!Object.keys(this.config).length) {
        this.options = [];
        return;
      }
      const allDatas = await this.requestData(this.config);
      this.datas = allDatas;
      const dataOptions = allDatas.map((v) => {
        return omit(v, ['dataset', 'idField']);
      });
      this.options = this.assembleOptions(dataOptions);
    },
    async onChange(value) {
      if (!value.length) return;
      const lastValue = value[value.length - 1];
      const target = this.datas.find(v => v.value === lastValue);
      const attributeFilter = `("${target.idField}" like '%${lastValue}%')`;
      const data = await getFeatures({ ...target.dataset, attributeFilter });
      this.$emit('change', value, data?.features?.[0]);
    }
  }
};
</script>

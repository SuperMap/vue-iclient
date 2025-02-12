<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-layer-manager"
  >
    <sm-card :style="headingTextColorStyle" class="sm-component-layer-manager__sm-card">
      <div class="sm-component-layer-manager__content">
        <sm-directory-tree
          checkable
          :defaultExpandAll="defaultExpandAll"
          :treeData="treeData"
          :checkedKeys="checkedKeys"
          :replaceFields="replaceFields"
          :style="getTextColorStyle"
          @check="checkNode"
        >
          <template slot="title" slot-scope="{ title }">
            <div class="item-title">
              <span :style="headingTextColorStyle">
                {{ title }}
              </span>
            </div>
          </template>
        </sm-directory-tree>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmDirectoryTree from 'vue-iclient/src/common/tree/DirectoryTree.vue';
import mapEvent from 'vue-iclient-core/types/map-event';
import LayerManagerViewModel from './LayerManagerViewModel';
import uniqueId from 'lodash.uniqueid';
import clonedeep from 'lodash.clonedeep';
import isequal from 'lodash.isequal';
import difference from 'lodash.difference';
import omit from 'omit.js';
import Message from 'vue-iclient/src/common/message/Message.js';

export default {
  name: 'SmLayerManager',
  components: {
    SmCard,
    SmDirectoryTree
  },
  mixins: [Theme, Control, MapGetter, BaseCard],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-layer-manager'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('layerManager.title');
      }
    },
    layers: {
      type: Array
    },
    replaceFields: {
      type: Object,
      default() {
        return { children: 'children', title: 'title', key: 'key' };
      }
    },
    defaultExpandAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      treeData: null,
      checkedKeys: [],
      mapIsLoad: false
    };
  },
  computed: {
    defaultCheckedKeys() {
      const keys = [];
      this.eachNode(this.treeData, function (data) {
        if (data.visible) {
          keys.push(data.key);
        }
      });
      return keys;
    }
  },
  watch: {
    layers: {
      handler(newVal, oldVal) {
        if (oldVal && !isequal(this.omitVisible(newVal), this.omitVisible(oldVal))) {
          this.cleanStatus();
        }
        this.oldTreeData = clonedeep(oldVal);
        this.treeData = clonedeep(newVal);
        this.insertProperty(this.treeData);
      },
      deep: true,
      immediate: true
    },
    defaultCheckedKeys(keys, oldKeys) {
      if (isequal(keys, oldKeys)) {
        return;
      }
      const newCheckedKeys = [].concat(this.checkedKeys);
      if (keys.length > oldKeys.length) {
        // 开启图层初始加载后，同步在图层管理里勾选上,并添加图层到map
        const addKey = difference(keys, oldKeys);
        this.addLayerByCheckedKeys(addKey);
        addKey.forEach(key => {
          if (!newCheckedKeys.includes(key)) {
            newCheckedKeys.push(key);
          }
        });
      } else {
        // 关闭图层初始加载后，同步在图层管理里取消勾选,并从map删除图层
        const delKey = difference(oldKeys, keys);
        delKey.forEach(key => {
          const node = this.getNodeByKey(this.oldTreeData, key);
          this.viewModel.removeLayerLoop(node);
          if (newCheckedKeys.includes(key)) {
            const indexToRemove = newCheckedKeys.indexOf(key);
            newCheckedKeys.splice(indexToRemove, 1);
          }
        });
      }
      this.checkedKeys = newCheckedKeys;
    }
  },
  created() {
    this.viewModel = new LayerManagerViewModel();
    this.viewModel.on('layersadded', this.addMapCombination);
    this.viewModel.on('layerorsourcenameduplicated', this.handleLayerOrSourceNameDuplicated);
    this.viewModel.on('layersremoved', this.removeMapCombination);
    this.viewModel.on('projectionnotmatch', this.addLayerField);
  },
  beforeDestroy() {
    this.viewModel.off('layersadded', this.addMapCombination);
    this.viewModel.off('layerorsourcenameduplicated', this.handleLayerOrSourceNameDuplicated);
    this.viewModel.off('layersremoved', this.removeMapCombination);
    this.viewModel.off('projectionnotmatch', this.addLayerField);
  },
  methods: {
    omitVisible(val) {
      return val.map(item => {
        const newItem = omit(item, ['visible']);
        if (newItem.children) {
          newItem.children = this.omitVisible(newItem.children, ['visible']);
        }
        return newItem;
      });
    },
    checkNode(key, e) {
      this.checkedKeys = key;
      if (e.checked) {
        this.addLayerByCheckedKeys(key);
      } else {
        const data = e.node.dataRef;
        this.viewModel.removeLayerLoop(data);
      }
    },
    addLayerByCheckedKeys(checkedKeys) {
      if (!checkedKeys || !checkedKeys.length) {
        return;
      }
      checkedKeys.forEach(key => {
        const node = this.getNodeByKey(this.treeData, key);
        const mapInfo = node.mapInfo;
        if (!mapInfo) {
          return;
        }
        const nodeKey = node.key;
        if (mapInfo.mapId && mapInfo.serverUrl) {
          const { serverUrl, mapId, withCredentials, layerFilter, proxy } = mapInfo;
          this.addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter, proxy });
          return;
        }
        if (mapInfo.mapOptions) {
          this.addMapStyle(mapInfo.mapOptions, nodeKey);
          return;
        }
        if (mapInfo.serverUrl) {
          this.addIServerLayer(mapInfo.serverUrl, nodeKey);
        }
      });
    },
    getNodeByKey(datas, key) {
      for (const data of datas) {
        if (data.key === key) {
          return data;
        }
        if (data.children && data.children.length > 0) {
          const found = this.getNodeByKey(data.children, key);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter, proxy }) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter, proxy });
    },
    removeLayer(nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.removeLayer(nodeKey);
    },
    addIServerLayer(serverUrl, nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.addIServerLayer(serverUrl, nodeKey);
    },
    addMapStyle(mapOptions, nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.addMapStyle(mapOptions, nodeKey);
    },
    removeIServerLayer(nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.removeIServerLayer(nodeKey);
    },
    removeMapStyle(nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.removeMapStyle(nodeKey);
    },
    insertProperty(layers) {
      this.eachNode(layers, function (node) {
        // 为没有传key的节点生成key
        if (!node.key) {
          node.key = uniqueId('key_');
        }
        node.selectable = false;
        // 如果没有mapInfo就禁用掉checkbox
        if (!node.children && !node.mapInfo) {
          node.disableCheckbox = true;
          node.disabled = true;
        } else if (!node.children && node.mapInfo) {
          node.disableCheckbox && (node.disableCheckbox = false);
          node.disabled && (node.disabled = false);
        }
        if (!node.scopedSlots) {
          if (node.children) {
            node.scopedSlots = { title: 'title' };
          } else {
            node.scopedSlots = { title: 'title', mapInfo: 'mapInfo' };
          }
        }
      });
    },
    eachNode(datas, callback) {
      for (let i = 0; i < datas.length; i++) {
        callback(datas[i], datas);
        if (datas[i].children) {
          this.eachNode(datas[i].children, callback);
        }
      }
      return datas;
    },
    cleanStatus() {
      if (this.checkedKeys.length) {
        this.checkedKeys.forEach(key => {
          this.removeLayer(key);
          this.removeIServerLayer(key);
          this.removeMapStyle(key);
        });
      }
      this.checkedKeys = [];
    },
    addMapCombination({ nodeKey, nodeValue }) {
      mapEvent.setWebMap(this.getTargetName(), nodeValue, nodeKey);
    },
    removeMapCombination({ nodeKey }) {
      mapEvent.deleteWebMap(this.getTargetName(), nodeKey);
    },
    handleLayerOrSourceNameDuplicated() {
      Message.error(this.$t('webmap.layerorsourcenameduplicated'));
    },
    addLayerField({ e, nodeKey }) {
      const node = this.getNodeByKey(this.treeData, nodeKey);
      Message.error(this.$t(`webmap.${e.type}`, { title: node ? node.title : '' }));
    }
  },
  loaded() {
    this.mapIsLoad = true;
    if (this.defaultCheckedKeys.length) {
      this.checkedKeys = this.defaultCheckedKeys;
      this.addLayerByCheckedKeys(this.checkedKeys);
    }
  },
  removed() {
    this.checkedKeys = [];
  }
};
</script>

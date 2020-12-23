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
    <sm-card :style="[collapseCardBackgroundStyle]" class="sm-component-layer-manager__sm-card">
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
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import BaseCard from '../../../../common/_mixin/Card';
import MapGetter from '../../../_mixin/map-getter';
import SmCard from '../../../../common/card/Card';
import SmDirectoryTree from '../../../../common/tree/DirectoryTree';
import LayerManagerViewModel from './LayerManagerViewModel';
import uniqueId from 'lodash.uniqueid';
import clonedeep from 'lodash.clonedeep';
import isequal from 'lodash.isequal';

export default {
  name: 'SmLayerManager',
  components: {
    SmCard,
    SmDirectoryTree
  },
  mixins: [Theme, Control, MapGetter, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
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
  watch: {
    layers: {
      handler(newVal, oldVal) {
        if (oldVal && !isequal(newVal, oldVal)) {
          this.cleanStatus();
        }
        this.treeData = clonedeep(newVal);
        this.insertProperty(this.treeData);
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.viewModel = new LayerManagerViewModel();
  },
  methods: {
    checkNode(key, e) {
      this.checkedKeys = key;
      if (e.checked) {
        e.checkedNodes &&
          e.checkedNodes.length &&
          e.checkedNodes.forEach(node => {
            const mapInfo = node.data.props.mapInfo;
            if (mapInfo && mapInfo.serverUrl) {
              const nodeKey = node.key;
              if (mapInfo.mapId) {
                const { serverUrl, mapId, withCredentials, layerFilter } = mapInfo;
                this.addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter });
              } else {
                this.addIServerLayer(mapInfo.serverUrl, nodeKey);
              }
            }
          });
      } else {
        const data = e.node.dataRef;
        this.viewModel.removeLayerLoop(data);
      }
    },
    addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter }) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter });
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
    removeIServerLayer(nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.removeIServerLayer(nodeKey);
    },
    insertProperty(layers) {
      this.eachNode(layers, function(node, parentNode) {
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
        if (!node['scopedSlots']) {
          if (node.children) {
            node['scopedSlots'] = { title: 'title' };
          } else {
            node['scopedSlots'] = { title: 'title', mapInfo: 'mapInfo' };
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
        });
      }
      this.checkedKeys = [];
    }
  },
  loaded() {
    this.mapIsLoad = true;
  },
  removed() {
    this.cleanStatus();
  }
};
</script>

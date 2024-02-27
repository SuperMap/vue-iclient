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
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmDirectoryTree from 'vue-iclient/src/common/tree/DirectoryTree.vue';
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
        if (!e.checkedNodes || !e.checkedNodes.length) {
          return;
        }
        e.checkedNodes.forEach(node => {
          const mapInfo = node.data.props.mapInfo;
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
            this.addMapStyle(mapInfo.mapOptions.style, nodeKey);
            return;
          }
          if (mapInfo.serverUrl) {
            this.addIServerLayer(mapInfo.serverUrl, nodeKey);
          }
        });
      } else {
        const data = e.node.dataRef;
        this.viewModel.removeLayerLoop(data);
      }
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
    addMapStyle(style, nodeKey) {
      if (!this.mapIsLoad) {
        return;
      }
      this.viewModel.addMapStyle(style, nodeKey);
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
    }
  },
  loaded() {
    this.mapIsLoad = true;
  },
  removed() {
    this.checkedKeys = [];
  }
};
</script>

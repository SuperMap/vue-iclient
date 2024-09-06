<template>
  <div>
    <sm-tree class="sm-component-layer-list__collapse draggable-tree" draggable :tree-data="treeData" @drop="onDrop">
      <template slot="custom" slot-scope="item">
        <div
          class="header-wrap"
          :class="{
            'header-wrap': true,
            'sm-component-layer-list__disabled': !item.visible
          }"
        >
          <div
            class="header-text"
            @mouseenter="() => changeIconsStatus(item.id)"
            @mouseleave="() => changeIconsStatus('')"
          >
            <i
              :class="item.visible ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'"
              @click.stop="toggleItemVisibility(item)"
            />
            <span class="add-ellipsis">{{ item.title }}</span>
            <div
              v-if="(item && item.type) !== 'group'"
              :class="['icon-buttons', showIconsItem === item.id ? 'icon-buttons-visible' : 'icon-buttons-hidden']"
            >
              <div v-if="zoomToMap.enabled" class="sm-component-layer-list__zoom">
                <i
                  :class="attributesIconClass"
                  :style="!item.visible && { cursor: 'not-allowed' }"
                  :title="$t('layerList.zoomToMap')"
                  @click.stop="item.visible && toggleAttributesVisibility($event, item)"
                />
              </div>
              <div v-if="attributesEnabled(item)" class="sm-component-layer-list__attributes">
                <i
                  :class="attributesIconClass"
                  :style="!item.visible && { cursor: 'not-allowed' }"
                  :title="$t('layerList.attributes')"
                  @click.stop="item.visible && toggleAttributesVisibility($event, item)"
                />
              </div>
              <div v-if="layerStyle.enabled" class="sm-component-layer-list__style">
                <i
                  :class="[
                    'sm-components-icon-attribute',
                    'sm-components-icon-not-active',
                    showOpacityItem === item.id && 'sm-components-icon-active'
                  ]"
                  :style="!item.visible && { cursor: 'not-allowed' }"
                  :title="$t('layerList.layerStyle')"
                  @click.stop="item.visible && toggleLayerStyleVisibility($event, item)"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-show="item.id === showOpacityItem" class="opacity-style">
          <div>{{ $t('layerList.opacity') }}</div>
          <sm-slider
            :value="10"
            :min="0"
            :max="100"
            :step="1"
            :style="{ ...getColorStyle(0), width: '70%' }"
            @change="sliderChange"
          />
          <div>{{ 10 + '%' }}</div>
        </div>
      </template>
    </sm-tree>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmCollapse from 'vue-iclient/src/common/collapse/Collapse.vue';
import SmCollapsePanel from 'vue-iclient/src/common/collapse/Panel.vue';
import SmTree from 'vue-iclient/src/common/tree/Tree.vue';

export default {
  name: 'LayerGroup',
  mixins: [Theme],
  components: {
    SmCollapse,
    SmCollapsePanel,
    SmTree
  },
  props: {
    layerCatalog: {
      type: Array,
      default() {
        return [];
      }
    },
    zoomToMap: {
      type: Object,
      default() {
        return {
          enabled: true
        };
      }
    },
    attributes: {
      type: Object,
      default() {
        return {};
      }
    },
    layerStyle: {
      type: Object,
      default() {
        return {
          enabled: true,
          opacity: 1
        };
      }
    }
  },
  computed: {
    attributesIconClass() {
      return (this.attributes && this.attributes.iconClass) || 'sm-components-icon-attribute';
    },
    attributesEnabled() {
      return item => {
        const isGeojson = item.renderSource.type === 'geojson';
        const isStructureData = item.dataSource.type === 'STRUCTURE_DATA';
        return this.attributes.enabled && (isGeojson || isStructureData);
      };
    }
  },
  watch: {
    layerCatalog: {
      handler: function (newVal, oldVal) {
        this.treeData = this.getTreeData(this.layerCatalog);
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      treeData: [],
      showIconsItem: '',
      showOpacityItem: ''
    };
  },
  methods: {
    getTreeData(data) {
      const treeData = [];
      data.map(item => {
        const data = { ...item, key: item.id, scopedSlots: { title: 'custom' } };
        if (data.children) {
          const children = this.getTreeData(data.children);
          data.children = children;
        }
        treeData.push(data);
      });
      return treeData;
    },
    sliderChange(val) {},
    toggleItemVisibility(item) {
      this.promise();
      this.$emit('toggleItemVisibility', item, !item.visible);
    },
    toggleAttributesVisibility(e, item) {
      this.$emit('toggleAttributesVisibility', e, item);
    },
    toggleLayerStyleVisibility(e, item) {
      if (this.showOpacityItem === item.id) {
        this.showOpacityItem = '';
      } else {
        this.showOpacityItem = item.id;
      }
    },
    changeIconsStatus(val) {
      this.showIconsItem = val;
    },
    onDrop(info) {
      const dropKey = info.node.eventKey;
      const dragKey = info.dragNode.eventKey;
      const dropPos = info.node.pos.split('-');
      const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
      const loop = (data, id, callback) => {
        data.forEach((item, index, arr) => {
          if (item.id === id) {
            return callback(item, index, arr);
          }
          if (item.children) {
            return loop(item.children, id, callback);
          }
        });
      };
      const data = [...this.treeData];

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
      this.treeData = data;
    }
  }
};
</script>

<style></style>

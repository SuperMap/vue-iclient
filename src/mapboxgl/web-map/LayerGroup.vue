<template>
  <div>
    <sm-tree class="sm-component-layer-list__collapse draggable-tree" blockNode :draggable="operations.draggable" :tree-data="treeData" @drop="dropHandler">
      <i slot="switcherIcon" class="sm-components-icon-right" />
      <template slot="custom" slot-scope="item">
        <div
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
            <span class="add-ellipsis">{{ item.title }}</span>
            <div
              :class="['icon-buttons', showIconsItem === item.id ? 'icon-buttons-visible' : 'icon-buttons-hidden']"
            >
              <div v-if="operations.fitBounds" class="sm-component-layer-list__zoom">
                <i
                  :class="['sm-components-icon-suofangzhituceng', (item.visible || !item.disabled) && 'highlight-icon']"
                  :style="!item.visible && { cursor: 'not-allowed' }"
                  :title="$t('layerList.zoomToLayer')"
                  @click.stop="item.visible && zoomToBounds(item)"
                />
              </div>
              <div v-if="(item && item.type) !== 'group' && attributesEnabled(item)" class="sm-component-layer-list__attributes">
                <i
                  :class="attributesIconClass"
                  :style="(!item.visible || item.disabled) && { cursor: 'not-allowed' }"
                  :title="$t('layerList.attributes')"
                  @click.stop="item.visible && toggleAttributesVisibility($event, item)"
                />
              </div>
              <div v-if="operations.opacity && (item && item.type) !== 'group'" class="sm-component-layer-list__style">
                <i
                  :class="[
                    'sm-components-icon-tucengyangshi01',
                    'sm-components-icon-not-active',
                    showOpacityItem === item.id && 'sm-components-icon-active'
                  ]"
                  :style="(!item.visible || item.disabled) && { cursor: 'not-allowed' }"
                  :title="$t('layerList.layerStyle')"
                  @click.stop="item.visible && changeItemOpacity(item)"
                />
              </div>
              <div>
                <i
                  :class="item.visible ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'"
                  @click.stop="toggleItemVisibility(item)"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-show="operations.opacity && item.id === showOpacityItem" class="opacity-style">
          <div>{{ $t('layerList.opacity') }}</div>
          <sm-slider
            :value="formatOpacity"
            :min="0"
            :max="100"
            :step="1"
            :style="{ ...getColorStyle(0), width: '70%' }"
            @change="changeOpacity"
          />
          <div>{{ formatOpacity + '%' }}</div>
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
    currentOpacity: {
      type: Number,
      default: 0
    },
    layerCatalog: {
      type: Array,
      default() {
        return [];
      }
    },
    operations: {
      type: Object,
      default() {
        return {
          fitBounds: true,
          draggable: false,
          opacity: false
        };
      }
    },
    attributes: {
      type: Object,
      default() {
        return {};
      }
    },
    dropHandler: Function
  },
  computed: {
    formatOpacity() {
      return +(this.currentOpacity * 100).toFixed(0);
    },
    attributesIconClass() {
      return (this.attributes && this.attributes.iconClass) || 'sm-components-icon-attribute-table';
    },
    attributesEnabled() {
      return item => {
        const isGeojson = item.renderSource && item.renderSource.type === 'geojson';
        const isStructureData = item.dataSource && item.dataSource.type === 'STRUCTURE_DATA';
        return this.attributes.enabled && (isGeojson || isStructureData) && (item && item.type) !== 'group';
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
        } else if(item.layerOrder !== 'auto') {
          data.disabled = true;
        }
        treeData.push(data);
      });
      return treeData;
    },
    changeOpacity(val) {
      if (this.showOpacityItem) {
        val = val / 100;
        this.$emit('changeOpacity', this.showOpacityItem, val);
        this.$emit('getLayerOpacityById', this.showOpacityItem);
      }
    },
    toggleItemVisibility(item) {
      this.$emit('toggleItemVisibility', item, !item.visible);
    },
    toggleAttributesVisibility(e, item) {
      this.$emit('toggleAttributesVisibility', e, item);
    },
    changeItemOpacity(item) {
      if (this.showOpacityItem === item.id) {
        this.showOpacityItem = '';
      } else {
        this.showOpacityItem = item.id;
        this.$emit('getLayerOpacityById', this.showOpacityItem);
      }
    },
    changeIconsStatus(val) {
      this.showIconsItem = val;
    },
    zoomToBounds(item) {
      this.$emit('zoomToBounds', item);
    }
  }
};
</script>

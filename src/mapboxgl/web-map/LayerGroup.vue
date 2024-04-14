<template>
  <div>
    <sm-collapse
      v-for="(item, index) in layerCatalog"
      :key="index"
      :bordered="false"
      class="sm-component-layer-list__collapse"
    >
      <sm-collapse-panel v-if="item.type === 'group'" class="sm-component-layer-list__collapseitem" :showArrow="false">
        <template slot="header">
          <div
            class="header-wrap"
            :class="{
              'header-wrap': true,
              'sm-component-layer-list__disabled': !item.visible
            }"
          >
            <div class="header-text">
              <i
                :class="item.visible ? 'sm-components-icon-partially-visible' : 'sm-components-icon-hidden'"
                @click.stop="toggleItemVisibility(item)"
              />
              <span class="add-ellipsis">{{ item.title }}</span>
            </div>
            <i class="sm-components-icon-solid-triangle-right header-arrow" />
            <i class="sm-components-icon-solid-triangle-down header-arrow" />
          </div>
        </template>
        <layer-group v-on="$listeners" :layerCatalog="item.children" :attributes="attributes" :checkAttributesEnabled="checkAttributesEnabled"></layer-group>
      </sm-collapse-panel>

      <div
        v-else
        :class="{
          'sm-component-layer-list__elcarditem': true,
          'sm-component-layer-list__disabled': !item.visible
        }"
      >
        <div class="sm-component-layer-list__layer">
          <i
            :class="item.visible ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'"
            @click.stop="toggleItemVisibility(item)"
          />
          <div class="sm-component-layer-list__layergroupname add-ellipsis" :title="item.title">{{ item.title }}</div>
        </div>
        <div v-if="attributesEnabled(item)" class="sm-component-layer-list__attributes">
          <i
            :class="attributesIconClass"
            :style="!item.visible && { cursor: 'not-allowed' }"
            @click.stop="item.visible && toggleAttributesVisibility($event, item)"
          />
        </div>
      </div>
    </sm-collapse>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import SmCollapse from 'vue-iclient/src/common/collapse/Collapse.vue';
import SmCollapsePanel from 'vue-iclient/src/common/collapse/Panel.vue';

export default {
  name: 'LayerGroup',
  mixins: [Theme],
  components: {
    SmCollapse,
    SmCollapsePanel
  },
  props: {
    layerCatalog: {
      type: Array,
      default() {
        return [];
      }
    },
    attributes: {
      type: Object,
      default() {
        return {};
      }
    },
    checkAttributesEnabled: {
      type: Function
    }
  },
  computed: {
    attributesIconClass() {
      return (this.attributes && this.attributes.iconClass) || 'sm-components-icon-attribute';
    },
    attributesEnabled() {
      return (item) => {
        return this.attributes.enabled && (item.type === 'basic' && this.checkAttributesEnabled(item));
      };
    }
  },
  methods: {
    toggleItemVisibility(item) {
      this.$emit('toggleItemVisibility', item);
      item.visible = !item.visible;
    },
    toggleAttributesVisibility(e, item) {
      const { title, id } = item;
      this.$emit('toggleAttributesVisibility', e, id, title);
    }
  }
};
</script>

<style>
</style>

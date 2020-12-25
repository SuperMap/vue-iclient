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
    class="sm-component-layer-list"
  >
    <sm-card class="sm-component-layer-list__a-card" :bordered="false" :style="headingTextColorStyle">
      <div class="sm-component-layer-list__content">
        <sm-collapse
          v-for="(name, index) in sourceNames"
          :key="index"
          :bordered="false"
          class="sm-component-layer-list__collapse"
        >
          <sm-collapse-panel
            v-if="
              typeof sourceList[name].sourceLayerList === 'object' &&
                Object.keys(sourceList[name].sourceLayerList).length > 0
            "
            class="sm-component-layer-list__collapseitem"
            :showArrow="false"
          >
            <template slot="header">
              <div
                class="header-wrap"
                :class="{
                  'header-wrap': true,
                  'sm-component-layer-list__disabled': sourceList[name].visibility !== 'visible'
                }"
              >
                <div class="header-text">
                  <i
                    :class="
                      sourceList[name].visibility === 'visible'
                        ? 'sm-components-icon-partially-visible'
                        : 'sm-components-icon-hidden'
                    "
                    @click.stop="toggleLayerGroupVisibility(name, sourceList[name].visibility)"
                  />
                  <span class="add-ellipsis">{{ name }}</span>
                </div>
                <i class="sm-components-icon-solid-triangle-right header-arrow" />
                <i class="sm-components-icon-solid-triangle-down header-arrow" />
              </div>
            </template>
            <div
              v-for="(sourcelayerValue, sourcelayerKey, i) in sourceList[name].sourceLayerList"
              :key="i"
              :class="{
                'sm-component-layer-list__sourcelayeritem': true,
                'sm-component-layer-list__disabled': sourcelayerValue[0].visibility !== 'visible'
              }"
              :style="getTextColorStyle"
            >
              <i
                :class="
                  sourcelayerValue[0].visibility === 'visible'
                    ? 'sm-components-icon-visible'
                    : 'sm-components-icon-hidden'
                "
                @click.stop="toggleVisibility(sourcelayerKey, name, sourcelayerValue[0].visibility)"
              />
              <div class="sm-component-layer-list__layergroupname add-ellipsis" :title="sourcelayerKey">
                {{ sourcelayerKey }}
              </div>
            </div>
          </sm-collapse-panel>

          <div
            v-else
            :class="{
              'sm-component-layer-list__elcarditem': true,
              'sm-component-layer-list__disabled': sourceList[name].visibility !== 'visible'
            }"
          >
            <i
              :class="
                sourceList[name].visibility === 'visible' ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'
              "
              @click.stop="toggleLayerGroupVisibility(name, sourceList[name].visibility)"
            />
            <div class="sm-component-layer-list__layergroupname add-ellipsis" :title="name">
              {{ name }}
            </div>
          </div>
        </sm-collapse>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import BaseCard from '../../../../common/_mixin/Card';
import SmCard from '../../../../common/card/Card';
import SmCollapse from '../../../../common/collapse/Collapse';
import SmCollapsePanel from '../../../../common/collapse/Panel';
import LayerListViewModel from './LayerListViewModel';

export default {
  name: 'SmLayerList',
  components: {
    SmCard,
    SmCollapse,
    SmCollapsePanel
  },
  filters: {
    isVisible(visibility) {
      return visibility === 'visible';
    }
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-layer-list'
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    headerName: {
      type: String,
      default() {
        return this.$t('layerList.title');
      }
    }
  },
  data() {
    return {
      sourceNames: [],
      sourceList: {}
    };
  },
  created() {
    this.viewModel = new LayerListViewModel();
  },
  methods: {
    toggleVisibility(sourceLayer, sourceName, visibility) {
      this.viewModel && this.viewModel.changeLayerVisible(sourceLayer, sourceName, visibility);
    },
    addNewLayer() {
      this.viewModel.addNewLayer();
    },
    deleteLayer() {
      this.viewModel.deleteLayer();
    },
    toggleLayerGroupVisibility(sourceName, visibility) {
      this.viewModel && this.viewModel.changeLayerGroupVisibility(sourceName, visibility);
    },
    layerUpdate() {
      this.$nextTick(() => {
        this.sourceList = this.viewModel && this.viewModel.initLayerList();
        this.sourceNames = this.viewModel && this.viewModel.getSourceNames();
      });
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-list-container');
    this.layerUpdate();
    this.layerUpdateFn = this.layerUpdate.bind(this);
    this.viewModel.on('layersUpdated', this.layerUpdateFn);
  },
  removed() {
    this.sourceList = {};
    this.sourceNames = [];
  },
  beforeDestory() {
    this.viewModel && this.viewModel.off('layersUpdated', this.layerUpdateFn);
    this.$options.removed.call(this);
  }
};
</script>

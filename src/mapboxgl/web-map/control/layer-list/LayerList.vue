<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-layer-list"
  >
    <a-card class="sm-component-layer-list__a-card" :style="[getBackgroundStyle]">
      <div class="sm-component-layer-list__content">
        <a-collapse
          v-for="(name, index) in sourceNames"
          :key="index"
          :bordered="false"
          class="sm-component-layer-list__collapse"
          @change="handleCollapseChange"
        >
          <a-collapse-panel
            v-if="typeof sourceList[name].sourceLayerList === 'object'"
            class="sm-component-layer-list__collapseitem"
            :showArrow="false"
          >
            <template slot="header">
              <div
                class="header-wrap"
                :style="sourceList[name].visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
              >
                <div class="header-text">
                  <a-icon
                    type="eye"
                    :style="sourceList[name].visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
                    @click.stop="toggleLayerGroupVisibility(name, sourceList[name].visibility)"
                  ></a-icon>
                  <span class="add-ellipsis">{{ name }}</span>
                </div>
                <a-icon type="right" class="header-arrow" />
              </div>
            </template>
            <a-checkbox
              v-for="(sourcelayerValue, sourcelayerKey, i) in sourceList[name].sourceLayerList"
              :key="i"
              :checked="sourcelayerValue[0].visibility | isVisible"
              :title="sourcelayerKey"
              :style="sourcelayerValue[0].visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
              @change="toggleVisibility(sourcelayerKey, name, sourcelayerValue[0].visibility)"
            >{{ sourcelayerKey }}</a-checkbox
            >
          </a-collapse-panel>

          <a-card v-else class="sm-component-layer-list__elcarditem" :style="[getTextColorStyle]">
            <a-icon
              type="eye"
              :class="[sourceList[name].visibility === 'visible' ? 'visible' : 'none']"
              :style="sourceList[name].visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
              @click.stop="toggleLayerGroupVisibility(name, sourceList[name].visibility)"
            ></a-icon>
            <div
              class="sm-component-layer-list__layergroupname add-ellipsis"
              :title="name"
              :style="sourceList[name].visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
            >
              {{ name }}
            </div>
          </a-card>
        </a-collapse>
      </div>
    </a-card>
  </sm-card>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';
import LayerListViewModel from './LayerListViewModel';

export default {
  name: 'SmLayerList',
  filters: {
    isVisible(visibility) {
      return visibility === 'visible';
    }
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icons-layer-style'
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
      sourceList: {},
      disabledStyle: {
        color: '#c0c4cc'
      }
    };
  },
  watch: {
    colorGroupsData: {
      handler() {
        this.changCheckStyle();
      }
    }
  },
  created() {
    this.viewModel = new LayerListViewModel();
  },
  methods: {
    handleCollapseChange() {
      this.changCheckStyle();
    },
    changCheckStyle() {
      setTimeout(() => {
        const checkBoxsList = this.$el.querySelectorAll('.ant-checkbox');
        for (let item of checkBoxsList) {
          let childrens = item.childNodes;
          let checkbox = childrens[1];
          // let label = item.parentNode.childNodes[1];
          if (item.classList.contains('ant-checkbox-checked')) {
            checkbox.style.borderColor = this.getColorStyle(0).color;
            checkbox.style.backgroundColor = this.getColorStyle(0).color;
            // label.style.color = this.getColorStyle(0).color;
          } else {
            checkbox.style.borderColor = '#DCDFE6';
            checkbox.style.backgroundColor = '#fff';
            // label.style.color = this.getTextColor;
          }
        }
      }, 0);
    },
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
    getDisabledStyle(isText = true) {
      return {
        color: '#c0c4cc'
      };
    },
    layerUpdate() {
      this.$nextTick(() => {
        this.sourceList = this.viewModel && this.viewModel.initLayerList();
        this.sourceNames = this.viewModel && this.viewModel.getSourceNames();
        this.viewModel && this.changCheckStyle();
      });
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-list-container');
    // this.layerUpdate();
    this.$nextTick(() => {
      if (this.viewModel) {
        this.sourceList = this.viewModel.initLayerList();
        this.sourceNames = this.viewModel.getSourceNames();
      }
    });
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

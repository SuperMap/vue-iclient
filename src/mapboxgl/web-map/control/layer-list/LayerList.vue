<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-widget-layer-list"
  >
    <a-card class="sm-widget-layer-list__a-card" :style="[getBackgroundStyle]">
      <div class="sm-widget-layer-list__content">
        <a-collapse
          v-for="(sourceValue,sourceKey,index) in sourceList"
          :key="index"
          :bordered="false"
          class="sm-widget-layer-list__collapse"
          @change="handleCollapseChange"
        >
          <a-collapse-panel
            v-if="typeof sourceValue.sourceLayerList === 'object'"
            class="sm-widget-layer-list__collapseitem"
            :showArrow="false"
          >
            <template slot="header">
              <div
                class="header-wrap"
                :style="sourceValue.visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
              >
                <div class="header-text">
                  <a-icon
                    type="eye"
                    :style="sourceValue.visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
                    @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"
                  ></a-icon>
                  <span>{{ sourceKey }}</span>
                </div>
                <a-icon type="right" class="header-arrow"/>
              </div>
            </template>
            <a-checkbox
              v-for="(sourcelayerValue,sourcelayerKey,i) in sourceValue.sourceLayerList"
              :key="i"
              :checked="sourcelayerValue[0].visibility | isVisible"
              :title="sourcelayerKey"
              :style="sourcelayerValue[0].visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
              @change="toggleVisibility(sourcelayerKey,sourceKey,sourcelayerValue[0].visibility)"
            >{{ sourcelayerKey }}</a-checkbox>
          </a-collapse-panel>

          <a-card v-else class="sm-widget-layer-list__elcarditem" :style="[getTextColorStyle]">
            <a-icon
              type="eye"
              :class="[sourceValue.visibility === 'visible' ? 'visible':'none']"
              :style="sourceValue.visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
              @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"
            ></a-icon>
            <div
              class="sm-widget-layer-list__layergroupname add-ellipsis"
              :style="sourceValue.visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
            >{{ sourceKey }}</div>
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
    iconClass: {
      type: String,
      default: 'sm-components-icons-layer-style'
    },
    headerName: {
      type: String,
      default: '图层'
    }
  },
  data() {
    return {
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
  methods: {
    handleCollapseChange() {
      this.changCheckStyle();
    },
    changCheckStyle() {
      setTimeout(() => {
        const checkBoxsList = this.$el.querySelectorAll('.ant-checkbox');
        checkBoxsList.forEach(item => {
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
        });
      }, 0);
    },
    toggleVisibility(sourceLayer, sourceName, visibility) {
      this.layerListViewModel && this.layerListViewModel.changeLayerVisible(sourceLayer, sourceName, visibility);
    },
    addNewLayer() {
      this.layerListViewModel.addNewLayer();
    },
    deleteLayer() {
      this.layerListViewModel.deleteLayer();
    },
    toggleLayerGroupVisibility(sourceName, visibility) {
      this.layerListViewModel && this.layerListViewModel.changeLayerGroupVisibility(sourceName, visibility);
    },
    getDisabledStyle(isText = true) {
      return {
        color: '#c0c4cc'
      };
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-list-container');
    this.layerListViewModel = new LayerListViewModel(this.map);
    this.$nextTick(() => {
      this.sourceList = this.layerListViewModel.initLayerList();
    });
    this.layerListViewModel.on('layersUpdated', () => {
      this.$nextTick(() => {
        this.sourceList = this.layerListViewModel.initLayerList();
        this.changCheckStyle();
      });
    });
  }
};
</script>

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
    <el-card
      class="sm-widget-layer-list__el-card"
      :style="[getBackgroundStyle]"
    >
      <div class="sm-widget-layer-list__content">
        <el-collapse
          v-for="(sourceValue,sourceKey,index) in sourceList"
          :key="index"
          class="sm-widget-layer-list__collapse"
          @change="handleCollapseChange"
        >
          <el-collapse-item
            v-if="typeof sourceValue.sourceLayerList === 'object'"
            class="sm-widget-layer-list__collapseitem"
            :style="[getTextColorStyle]"
          >
            <template slot="title">
              <div :style="sourceValue.visibility === 'visible' ? getTextColorStyle : getDisabledStyle()">
                <i
                  class="el-icon-view"
                  :style="sourceValue.visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
                  @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"
                ></i>
                <span>{{ sourceKey }}</span>
              </div>
            </template>
            <el-checkbox
              v-for="(sourcelayerValue,sourcelayerKey,i) in sourceValue.sourceLayerList"
              :key="i"
              :value="sourcelayerValue[0].visibility | isVisible"
              @change="toggleVisibility(sourcelayerKey,sourceKey,sourcelayerValue[0].visibility)"
            >{{ sourcelayerKey }}</el-checkbox>
          </el-collapse-item>

          <el-card
            v-else
            class="sm-widget-layer-list__elcarditem"
            :style="[getTextColorStyle]"
          >
            <i
              :class="['el-icon-view', sourceValue.visibility === 'visible' ? 'visible':'none']"
              :style="sourceValue.visibility === 'visible' ? getColorStyle(0) : getDisabledStyle(false)"
              @click.stop="toggleLayerGroupVisibility(sourceKey,sourceValue.visibility)"
            ></i>
            <div
              class="sm-widget-layer-list__layergroupname add-ellipsis"
              :style="sourceValue.visibility === 'visible' ? getTextColorStyle : getDisabledStyle()"
            >{{ sourceKey }}</div>
          </el-card>
        </el-collapse>
      </div>
    </el-card>
  </sm-card>
</template>

<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';
import MapGetter from '../mixin/map-getter';
import Card from '../mixin/card';
import LayerListViewModel from '../../viewmodel/LayerListViewModel';

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
      default: 'smwidgets-icons-layer-style'
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
  updated() {
    this.changCheckStyle();
  },
  methods: {
    handleCollapseChange() {
      this.changCheckStyle();
    },
    changCheckStyle() {
      const checkBoxsList = this.$el.querySelectorAll('.el-checkbox__input');
      checkBoxsList.forEach(item => {
        let childrens = item.childNodes;
        let checkbox = childrens[0];
        let label = item.parentNode.childNodes[1];
        if (item.classList.contains('is-checked')) {
          checkbox.style.borderColor = this.getColorStyle(0).color;
          checkbox.style.backgroundColor = this.getColorStyle(0).color;
          label.style.color = this.getColorStyle(0).color;
        } else {
          checkbox.style.borderColor = '#DCDFE6';
          checkbox.style.backgroundColor = '#fff';
          label.style.color = this.getTextColor;
        }
      });
    },
    toggleVisibility(sourceLayer, sourceName, visibility) {
      this.layerListViewModel && this.layerListViewModel.changeLayerVisible(sourceLayer, sourceName, visibility);
      setTimeout(() => {
        this.changCheckStyle();
      }, 0);
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
    this.sourceList = this.layerListViewModel.initLayerList();
    this.layerListViewModel.on('layersUpdated', () => {
      this.sourceList = this.layerListViewModel.initLayerList();
    });
  }
};
</script>

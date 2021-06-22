<template>
  <TreeSelect
    :value="cValue"
    :tree-data="treeData"
    v-bind="$attrs"
    :multiple="false"
    :dropdownMatchSelectWidth="true"
    :getPopupContainer="getPopupContainer"
    @change="handleNodeChange"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import TreeSelect from 'vue-iclient/src/common/tree-select/TreeSelect.vue';
import LayerSelectViewModel from './LayerSelectViewModel';

interface selectedDataParam {
  type: string;
  id: string;
}

interface treeSelectDataOption {
  title: string;
  value: string;
  key: string;
  disabled: boolean;
  selectable: boolean;
  children?: treeSelectDataOption[];
}

interface layerOption {
  id: string;
  type: string;
  visibility: string;
  maxzoom: number;
  minzoom: number;
  source: string;
  sourceLayer: string;
}

@Component({
  name: 'SmLayerSelect',
  components: {
    TreeSelect
  },
  model: {
    prop: 'value',
    event: 'changedata'
  }
})
class LayerSelect extends Mixins(MapGetter, Theme) {
  treeData: treeSelectDataOption[] = [];
  sourceListDataCache: Object;

  @Prop({
    default: () => {
      return {
        type: '',
        id: ''
      };
    }
  })
  value: selectedDataParam;

  @Prop() defaultValue: selectedDataParam;
  @Prop() filter: Function;

  get cValue() {
    return this.getSelectedValue(this.value) || this.getSelectedValue(this.defaultValue);
  }

  created() {
    this.viewModel = new LayerSelectViewModel();
    this.viewModel.on('layersupdated', this.layerUpdate);
  }

  getSelectedValue(selectedData: selectedDataParam): string {
    if (!selectedData || !selectedData.id || !selectedData.type) {
      return '';
    }
    return `${selectedData.id}+${selectedData.type}`;
  }

  layerUpdate({ sourceList }) {
    this.treeData = this.handleDatas(sourceList);
  }

  handleNodeChange(val, label) {
    const [id, type] = val.split('+');
    const extra = this.sourceListDataCache[val] || {};
    this.$emit('change', { id, type }, label, extra);
    this.$emit('changedata', { id, type });
  }

  handleDatas(sourceList): treeSelectDataOption[] {
    const treeData: treeSelectDataOption[] = [];
    this.sourceListDataCache = {};
    Object.keys(sourceList).forEach((sourceName, sIndex) => {
      let { id, type, visibility } = sourceList[sourceName];
      let disabled = false;
      let selectable = true;
      if (this.filter) {
        let res = this.filter(sourceList[sourceName], 'source', this.map) || {};
        disabled = res.disabled;
        selectable = res.selectable;

        if (typeof res.show === 'boolean' && res.show === false) {
          return;
        }
      }
      const sourceValue = `${sourceName}+source`;
      const sourceInfo: treeSelectDataOption = {
        title: sourceName,
        value: sourceValue,
        key: `${sIndex}`,
        disabled: !!disabled,
        selectable: selectable
      };
      this.sourceListDataCache[sourceValue] = {
        id,
        type,
        visibility
      };
      if (sourceList[sourceName].sourceLayerList) {
        const sourceChildren = [];
        Object.keys(sourceList[sourceName].sourceLayerList).forEach((sourceLayerName, slIndex) => {
          let disabled = false;
          let selectable = true;
          const sourceLayerOption = {
            id: null,
            source: id,
            sourceLayer: sourceLayerName
          };
          if (this.filter) {
            let res = this.filter(sourceLayerOption, 'sourceLayer', this.map) || {};
            disabled = res.disabled;
            selectable = res.selectable;

            if (typeof res.show === 'boolean' && res.show === false) {
              return;
            }
          }
          const sourceLayerValue = `${sourceLayerName}+sourceLayer`;
          const sourceLayerInfo: treeSelectDataOption = {
            title: sourceLayerName,
            value: sourceLayerValue,
            key: `${sIndex}-${slIndex}`,
            disabled: !!disabled,
            selectable
          };

          this.sourceListDataCache[sourceLayerValue] = sourceLayerOption;
          let layers: layerOption[] = sourceList[sourceName].sourceLayerList[sourceLayerName];
          const sourceLayerChildren = this.handleLayers(layers, `${sIndex}-${slIndex}`);
          if (sourceLayerChildren.length) {
            sourceLayerInfo.children = sourceLayerChildren;
          }
          sourceChildren.push(sourceLayerInfo);
        });
        if (sourceChildren.length) {
          sourceInfo.children = sourceChildren;
        }
      } else {
        let layers: layerOption[] = sourceList[sourceName].layers;
        const layerChildren = this.handleLayers(layers, sIndex);
        if (layerChildren.length) {
          sourceInfo.children = layerChildren;
        }
      }
      treeData.push(sourceInfo);
    });
    return treeData;
  }

  handleLayers(layers: layerOption[], keyString: number | string): treeSelectDataOption[] {
    const layerChildren = [];
    layers.forEach((layerInfo, lIndex) => {
      let { id, maxzoom, minzoom, source, sourceLayer, type, visibility } = layerInfo;
      let disabled = false;
      let selectable = true;
      if (this.filter) {
        let res = this.filter(layerInfo, 'layer', this.map) || {};
        disabled = res.disabled;
        selectable = res.selectable;

        if (typeof res.show === 'boolean' && res.show === false) {
          return;
        }
      }
      const layerValue = `${layerInfo.id}+layer`;
      layerChildren.push({
        title: layerInfo.id,
        value: layerValue,
        key: `${keyString}-${lIndex}`,
        disabled: !!disabled,
        selectable
      });
      this.sourceListDataCache[layerValue] = {
        id,
        maxzoom,
        minzoom,
        source,
        sourceLayer,
        type,
        visibility
      };
    });
    return layerChildren;
  }

  getPopupContainer(triggerNode) {
    return triggerNode.parentNode;
  }

  beforeDestory() {
    this.sourceListDataCache = {};
    this.treeData = [];
    this.viewModel && this.viewModel.off('layersupdated', this.layerUpdate);
  }
}

export default LayerSelect;
</script>

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
    const renderLayers = extra.renderLayers;
    this.$emit('change', { id, type, renderLayers }, label, extra);
    this.$emit('changedata', { id, type, renderLayers });
  }

  createLayersTreeData(layerCatalog) {
    const treeData: treeSelectDataOption[] = [];
    layerCatalog.forEach(layer => {
      let { id, title, type, visible, renderLayers } = layer;
      let disabled = false;
      let selectable = true;
      if (this.filter) {
        let res = this.filter(type, this.map) || {};
        disabled = res.disabled;
        selectable = res.selectable;

        if (typeof res.show === 'boolean' && res.show === false) {
          return;
        }
      }
      const layerValue = `${id}+${type}`;
      const sourceInfo: treeSelectDataOption = {
        title: title,
        value: layerValue,
        key: layer.id,
        disabled: !!disabled,
        selectable: selectable
      };
      if(type === 'group') {
        sourceInfo.children = this.createLayersTreeData(layer.children);
      }
      this.sourceListDataCache[layerValue] = {
        id,
        renderLayers,
        type,
        visibility: visible ? 'visible' : 'none'
      };
      treeData.push(sourceInfo);
    });
    return treeData;
  }

  handleDatas(sourceList): treeSelectDataOption[] {
    let treeData: treeSelectDataOption[] = [];
    this.sourceListDataCache = {};
    treeData = this.createLayersTreeData(sourceList);
    return treeData;
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

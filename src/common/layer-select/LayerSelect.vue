<template>
  <TreeSelect
    :value="cValue"
    :tree-data="treeData"
    v-bind="$attrs"
    :dropdownMatchSelectWidth="true"
    @change="handleNodeChange"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import Theme from '../../common/_mixin/Theme';
import MapGetter from '../../mapboxgl/_mixin/map-getter';
import TreeSelect from '../tree-select/TreeSelect.vue';
import LayerSelectViewModel from './LayerSelectViewModel';

@Component({
  name: 'SmLayerSelect',
  components: {
    TreeSelect
  }
})
class SmFeatureTable extends Mixins(MapGetter, Theme) {
  treeData: Array<Object> = [];
  defaultValue: String = '';
  sourceListDataCache: Object;
  @Prop({
    default: () => {
      return {
        type: '',
        id: ''
      };
    }
  })
  value: Object;
  @Prop() filter: Function;

  get cValue() {
    // @ts-ignore
    if (!this.value.id || !this.value.type) {
      return this.defaultValue || '';
    }
    // @ts-ignore
    return `${this.value.id}+${this.value.type}`;
  }

  created() {
    this.viewModel = new LayerSelectViewModel();
    this.viewModel.on('layersupdated', this.layerUpdate);
  }

  layerUpdate({ sourceList }) {
    console.log('sourceList', sourceList);
    this.treeData = this.handleDatas(sourceList);
  }
  handleNodeChange(val, label) {
    const [id, type] = val.split('+');
    const extra = this.sourceListDataCache[val] || {};
    this.$emit('change', { id, type }, label, extra);
    this.$emit('changedata', { id, type });
  }
  handleDatas(sourceList) {
    const treeData = [];
    this.sourceListDataCache = {};
    Object.keys(sourceList).forEach((sourceName, sIndex) => {
      let { id, type, visibility } = sourceList[sourceName];
      let disabled = false;
      if (this.filter) {
        let res = this.filter(sourceList[sourceName], 'source') || {};
        disabled = res && res.disabled;

        if (typeof res.show === 'boolean' && res.show === false) {
          return;
        }
      }
      const sourceInfo = {
        title: sourceName,
        value: `${sourceName}+source`,
        key: `${sIndex}`,
        disabled: !!disabled
      };
      this.sourceListDataCache[`${sourceName}+source`] = {
        id,
        type,
        visibility
      };
      if (sourceList[sourceName].sourceLayerList) {
        const sourceChildren = [];
        Object.keys(sourceList[sourceName].sourceLayerList).forEach((sourceLayerName, slIndex) => {
          let disabled = false;
          if (this.filter) {
            let res = this.filter(sourceLayerName, 'sourceLayer') || {};
            disabled = res.disabled;

            if (typeof res.show === 'boolean' && res.show === false) {
              return;
            }
          }
          const sourceLayerInfo = {
            title: sourceLayerName,
            value: `${sourceLayerName}+sourceLayer`,
            key: `${sIndex}-${slIndex}`,
            disabled: !!disabled
          };

          let layers = sourceList[sourceName].sourceLayerList[sourceLayerName];
          const sourceLayerChildren = this.handleLayers(layers, `${sIndex}-${slIndex}`);
          if (sourceLayerChildren.length) {
            // @ts-ignore
            sourceLayerInfo.children = sourceLayerChildren;
          }
          sourceChildren.push(sourceLayerInfo);
        });
        if (sourceChildren.length) {
          // @ts-ignore
          sourceInfo.children = sourceChildren;
        }
      } else {
        let layers = sourceList[sourceName].layers;
        const layerChildren = this.handleLayers(layers, sIndex);
        if (layerChildren.length) {
          // @ts-ignore
          sourceInfo.children = layerChildren;
        }
      }
      treeData.push(sourceInfo);
    });
    return treeData;
  }
  handleLayers(layers, keyString) {
    const layerChildren = [];
    layers.forEach((layerInfo, lIndex) => {
      let { id, maxzoom, minzoom, source, sourceLayer, type, visibility } = layerInfo;
      let disabled = false;
      if (this.filter) {
        let res = this.filter(layerInfo, 'layer') || {};
        disabled = res && res.disabled;

        if (typeof res.show === 'boolean' && res.show === false) {
          return;
        }
      }
      layerChildren.push({
        title: layerInfo.id,
        value: `${layerInfo.id}+layer`,
        key: `${keyString}-${lIndex}`,
        disabled: !!disabled
      });
      if (!this.defaultValue && !disabled) {
        this.defaultValue = `${layerInfo.id}+layer`;
        this.$emit('changedata', { id: `${layerInfo.id}`, type: 'layer' });
      }
      this.sourceListDataCache[`${layerInfo.id}+layer`] = {
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
  };

  beforeDestory() {
    this.sourceListDataCache = {};
    this.treeData = [];
    this.viewModel && this.viewModel.off('layersupdated', this.layerUpdate);
  }
}

export default SmFeatureTable;
</script>

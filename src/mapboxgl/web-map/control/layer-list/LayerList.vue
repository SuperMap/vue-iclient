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
        <layer-group
          :layerCatalog="sourceList"
          :attributes="attributes"
          :checkAttributesEnabled="checkAttributesEnabled"
          @toggleItemVisibility="toggleItemVisibility"
          @toggleAttributesVisibility="(e,id,title) => toggleAttributesVisibility(e,id,title)">
        </layer-group>
      </div>
    </sm-card>
    <sm-attributes
      v-show="displayAttributes"
      ref="attributes"
      :mapTarget="getTargetName()"
      :style="attributesStyle"
      v-bind="attributesProps"
    >
    </sm-attributes>
  </sm-collapse-card>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmCollapse from 'vue-iclient/src/common/collapse/Collapse.vue';
import SmCollapsePanel from 'vue-iclient/src/common/collapse/Panel.vue';
import SmAttributes, {
  PaginationParams,
  FieldConfigParams,
  AssociateWithMapParams,
  StatisticsParams,
  TableParams,
  ToolbarParams
} from 'vue-iclient/src/mapboxgl/attributes/Attributes.vue';
import LayerListViewModel from './LayerListViewModel';
import LayerGroup from 'vue-iclient/src/mapboxgl/web-map/LayerGroup.vue';
import intersection from 'lodash.intersection';
import isEqual from 'lodash.isequal';

interface AttributesParams {
  enabled: boolean;
  getContainer: Function;
  style: Object;
  position: string; // top-right top-left bottom-right bottom-left top bottom left right
  title: string;
  iconClass: string;
  associateWithMap: AssociateWithMapParams;
  statistics: StatisticsParams;
  toolbar: ToolbarParams;
  table: TableParams;
  fieldConfig: FieldConfigParams;
  pagination: PaginationParams;
  customHeaderRow: Function;
  customRow: Function;
}

const ATTRIBUTES_NEEDED_PROPS = [
  'title',
  'iconClass',
  'associateWithMap',
  'statistics',
  'toolbar',
  'table',
  'fieldConfig',
  'pagination',
  'customHeaderRow',
  'customRow'
];

@Component({
  name: 'SmLayerList',
  components: {
    SmCard,
    SmCollapse,
    SmCollapsePanel,
    SmAttributes,
    LayerGroup
  },
  filters: {
    isVisible(visibility) {
      return visibility === 'visible';
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-list-container');
    this.layerUpdate();
    this.layerUpdateFn = this.layerUpdate.bind(this);
    this.viewModel.on('layersUpdated', this.layerUpdateFn);
  },
  removed() {
    this.removeAttributes();
    this.sourceList = [];
    this.sourceNames = [];
  }
})
class SmLayerList extends Mixins(MapGetter, Control, Theme, BaseCard) {
  sourceNames: Array<string> = [];
  sourceList: Array<Object> = [];
  layerList: Array<string> = [];
  attributesProps: Object = {};
  layerUpdateFn: Function;
  displayAttributes: Boolean = false;

  @Prop({ default: 'sm-components-icon-layer-list' }) iconClass: string;
  @Prop({
    default() {
      return this.$t('layerList.title');
    }
  })
  headerName: string;

  @Prop({
    default() {
      return {};
    }
  })
  attributes: AttributesParams;

  @Watch('attributes', { deep: true })
  attributesChanged(newval, oldval) {
    if (this.displayAttributes) {
      if (!newval.enabled) {
        this.removeAttributes();
        return;
      }
      if (!isEqual(newval.getContainer, oldval.getContainer)) {
        this.removeAttributes();
        let container: HTMLElement;
        container = (newval.getContainer && newval.getContainer()) || document.getElementById(this.getTargetName());
        // @ts-ignore
        container.appendChild(this.$refs.attributes.$el);
        this.displayAttributes = !this.displayAttributes;
      }
      const oldProps = this.attributesProps;
      const newProps = Object.assign({}, newval);
      for (const key in newProps) {
        if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
          delete newProps[key];
        }
      }
      this.attributesProps = { ...oldProps, ...newProps };
    }
  }

  get enableSource() {
    return intersection(this.sourceNames, this.sourceList && Object.keys(this.sourceList));
  }

  get attributesStyle() {
    let attributesStyle;
    let position;
    const style = Object.assign(
      {},
      {
        height: '300px'
      },
      this.attributes.style
    );
    position = this.attributes.position ? this.attributes.position.split('-') : ['bottom'];
    if (position.length === 2) {
      attributesStyle = `position: absolute; ${position[0]}: 0;${position[1]}: 0;`;
    } else if (['top', 'bottom'].indexOf(position[0]) !== -1) {
      // @ts-ignore
      let margin = style ? (100 - parseInt(style.width)) / 2 : 0;
      attributesStyle = `position: absolute; ${position[0]}: 0; left: ${margin}%;`;
    } else if (['left', 'right'].indexOf(position[0]) !== -1) {
      // @ts-ignore
      let margin = style ? (100 - parseInt(style.height)) / 2 : 0;
      attributesStyle = `position: absolute; ${position[0]}: 0; top: ${margin}%;`;
    }
    for (const key in style) {
      attributesStyle += `${key}: ${style[key]};`;
    }
    return attributesStyle;
  }

  get attributesContainer() {
    let container: HTMLElement;
    container = this.attributes && this.attributes.getContainer && this.attributes.getContainer();
    return container || document.getElementById(this.getTargetName());
  }

  get attributesIconClass() {
    return (this.attributes && this.attributes.iconClass) || 'sm-components-icon-attribute';
  }

  created() {
    this.viewModel = new LayerListViewModel();
  }

  checkAttributesEnabled(item) {
    return this.viewModel.checkAttributesEnabled(item);
  }

  toggleItemVisibility(item) {
    this.viewModel && this.viewModel.changeItemVisible(item);
  }

  addNewLayer() {
    this.viewModel.addNewLayer();
  }

  deleteLayer() {
    this.viewModel.deleteLayer();
  }

  toggleAttributesVisibility(e, layerName: string, title: string) {
    if (e.target.className.indexOf('sm-components-icon-attribute-open') !== -1) {
      e.target.setAttribute('class', this.attributesIconClass);
      this.displayAttributes = !this.displayAttributes;
      return;
    }
    this.closeAttributesIconClass();
    this.removeAttributes();
    this.handleAttributesProps(layerName, title);
    e.target.setAttribute('class', `${this.attributesIconClass} sm-components-icon-attribute-open`);
    // @ts-ignore
    this.attributesContainer.appendChild(this.$refs.attributes.$el);
    this.displayAttributes = !this.displayAttributes;
  }

  async handleAttributesProps(layerName: string, title: string) {
    const props = Object.assign({}, this.attributes);
    for (const key in props) {
      if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
        delete props[key];
      }
    }
    const dataset = await this.viewModel.getLayerDatas(layerName);
    this.attributesProps = { dataset: Object.freeze(dataset), title, ...props };
  }

  layerUpdate() {
    this.$nextTick(() => {
      this.sourceList = this.viewModel && this.viewModel.initLayerList();
      this.sourceNames = this.viewModel && this.viewModel.getSourceNames();
      // @ts-ignore
      if (this.attributesProps.layerName && this.sourceList[this.attributesProps.layerName].visibility === 'none') {
        this.closeAttributesIconClass();
        this.removeAttributes();
      }
    });
  }

  closeAttributesIconClass() {
    const attributesIcon = document.querySelectorAll('.sm-component-layer-list__attributes');
    attributesIcon.forEach(element => {
      element.children[0].setAttribute('class', this.attributesIconClass);
    });
  }

  removeAttributes() {
    // @ts-ignore
    if (this.$refs.attributes.$el && this.displayAttributes) {
      // @ts-ignore
      const attributesParentDom = this.$refs.attributes.$el.parentElement;
      this.displayAttributes = !this.displayAttributes;
      // @ts-ignore
      attributesParentDom.removeChild(this.$refs.attributes.$el);
    }
  }

  beforeDestory() {
    this.viewModel && this.viewModel.off('layersUpdated', this.layerUpdateFn);
    this.$options.removed.call(this);
  }
}
export default SmLayerList;
</script>

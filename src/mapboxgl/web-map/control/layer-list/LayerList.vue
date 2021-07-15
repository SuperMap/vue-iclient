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
          v-for="(name, index) in enableSource"
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
            <div class="sm-component-layer-list__layer">
              <i
                :class="
                  sourceList[name].visibility === 'visible' ? 'sm-components-icon-visible' : 'sm-components-icon-hidden'
                "
                @click.stop="toggleLayerGroupVisibility(name, sourceList[name].visibility)"
              />
              <div class="sm-component-layer-list__layergroupname add-ellipsis" :title="name">{{ name }}</div>
            </div>
            <div
              v-if="attributes.enabled && sourceList[name].type === 'geojson'"
              class="sm-component-layer-list__attributes"
            >
              <i
                :class="attributesIconClass"
                :style="sourceList[name].visibility !== 'visible' && { cursor: 'not-allowed' }"
                @click.stop="
                  sourceList[name].visibility === 'visible' &&
                    toggleAttributesVisibility($event, layerName(sourceList[name]))
                "
              />
            </div>
          </div>
        </sm-collapse>
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
    SmAttributes
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
    this.sourceList = {};
    this.sourceNames = [];
  }
})
class SmLayerList extends Mixins(MapGetter, Control, Theme, BaseCard) {
  sourceNames: Array<string> = [];
  sourceList: Object;
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

  get layerName() {
    return function (source) {
      return source.layers[0].id;
    };
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

  toggleVisibility(sourceLayer, sourceName, visibility: string) {
    this.viewModel && this.viewModel.changeLayerVisible(sourceLayer, sourceName, visibility);
  }

  addNewLayer() {
    this.viewModel.addNewLayer();
  }

  deleteLayer() {
    this.viewModel.deleteLayer();
  }

  toggleLayerGroupVisibility(sourceName, visibility: string) {
    this.viewModel && this.viewModel.changeLayerGroupVisibility(sourceName, visibility);
  }

  toggleAttributesVisibility(e, layerName: string) {
    if (e.target.className.indexOf('sm-components-icon-attribute-open') !== -1) {
      e.target.setAttribute('class', this.attributesIconClass);
      this.displayAttributes = !this.displayAttributes;
      return;
    }
    this.closeAttributesIconClass();
    this.removeAttributes();
    this.handleAttributesProps(layerName);
    e.target.setAttribute('class', `${this.attributesIconClass} sm-components-icon-attribute-open`);
    // @ts-ignore
    this.attributesContainer.appendChild(this.$refs.attributes.$el);
    this.displayAttributes = !this.displayAttributes;
  }

  handleAttributesProps(layerName: string) {
    const props = Object.assign({}, this.attributes);
    for (const key in props) {
      if (ATTRIBUTES_NEEDED_PROPS.indexOf(key) === -1) {
        delete props[key];
      }
    }
    this.attributesProps = { layerName, title: layerName, ...props };
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

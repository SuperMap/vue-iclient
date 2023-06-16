<template>
  <div :id="target" class="sm-component-graph-map"></div>
</template>

<script lang="ts">
import { Component, Prop, Emit, Mixins, Watch } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash.debounce';
import cloneDeep from 'lodash.clonedeep';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import GraphMapViewModel, { GraphConfig, EmitParams } from './GraphMapViewModel';

@Component({
  name: 'SmGraphMap',
  viewModelProps: ['serviceUrl', 'zoom', 'center']
})
export default class SmGraphMap extends Mixins(VmUpdater, Theme) {
  @Prop() serviceUrl: string;
  @Prop({ default: true }) autoresize: boolean;
  @Prop() options: GraphConfig;

  @Emit()
  loaded(knowledgeGraph: EmitParams['knowledgeGraph']) {}

  @Watch('autoresize')
  onResizeChanged(value: boolean) {
    if (!this.rootEl) {
      return;
    }
    if (value) {
      addListener(this.rootEl, this.__resizeHandler);
      return;
    }
    removeListener(this.rootEl, this.__resizeHandler);
  }

  container = 'knowledgeGraph';
  __resizeHandler: (this: HTMLElement, element: HTMLElement) => void;
  viewModel: InstanceType<typeof GraphMapViewModel>;
  rootEl: HTMLElement;

  get target() {
    return this.options?.container ?? this.container;
  }

  created() {
    const nextOptions =  cloneDeep(this.options);
    if (!this.options?.container) {
      this.options.container = this.container;
    }
    this.viewModel = new GraphMapViewModel(this.serviceUrl, nextOptions);
    this.__resizeHandler = debounce(this.handleResizeEvent.bind(this), 500);
  }

  mounted() {
    this.rootEl = this.$el as HTMLElement;
    this.viewModel.initGraphMap();
    this.registerEvents();
  }

  beforeDestroy() {
    this.unregisterEvents();
  }

  registerEvents() {
    this.viewModel.on('loaded', this.handleLoadedEvent);
    if (this.autoresize) {
      addListener(this.rootEl, this.__resizeHandler);
    }
  }

  unregisterEvents() {
    this.viewModel?.off('loaded', this.handleLoadedEvent);
    if (this.autoresize) {
      removeListener(this.rootEl, this.__resizeHandler);
    }
  }

  handleResizeEvent() {
    this.resize();
  }

  handleLoadedEvent(e: EmitParams) {
    this.loaded(e.knowledgeGraph);
  }

  resize() {
    if (this.viewModel?.resize) {
      const { clientWidth, clientHeight } = this.$el;
      this.viewModel.resize(clientWidth, clientHeight);
    }
  }
}
</script>

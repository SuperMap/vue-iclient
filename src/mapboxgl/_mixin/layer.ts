import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';

type MapLayerEventType =
  | 'mousedown'
  | 'mouseup'
  | 'click'
  | 'dblclick'
  | 'mousemove'
  | 'mouseenter'
  | 'mouseleave'
  | 'mouseover'
  | 'mouseout'
  | 'contextmenu'
  | 'touchstart'
  | 'touchend'
  | 'touchcancel';

@Component
export default class LayerMixin extends Vue {
  eventList = [
    'mousedown',
    'mouseup',
    'click',
    'dblclick',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'contextmenu',
    'touchstart',
    'touchend',
    'touchcancel'
  ];
  map: mapboxglTypes.Map;
  viewModel: any;

  @Prop({
    default() {
      const defaultLayerId = UniqueId(`${this.$options.name.toLowerCase()}-`);
      return defaultLayerId;
    }
  })
  layerId: string;
  @Prop() sourceId: string;
  @Prop() sourceLayer: string;
  @Prop({ default: 0 }) minzoom: number;
  @Prop({ default: 22 }) maxzoom: number;
  @Prop() filter: any[];
  @Prop() layout:
    | mapboxglTypes.BackgroundLayout
    | mapboxglTypes.FillLayout
    | mapboxglTypes.FillExtrusionLayout
    | mapboxglTypes.LineLayout
    | mapboxglTypes.SymbolLayout
    | mapboxglTypes.RasterLayout
    | mapboxglTypes.CircleLayout
    | mapboxglTypes.HeatmapLayout
    | mapboxglTypes.HillshadeLayout;
  @Prop() paint:
    | mapboxglTypes.BackgroundPaint
    | mapboxglTypes.FillPaint
    | mapboxglTypes.FillExtrusionPaint
    | mapboxglTypes.LinePaint
    | mapboxglTypes.SymbolPaint
    | mapboxglTypes.RasterPaint
    | mapboxglTypes.CirclePaint
    | mapboxglTypes.HeatmapPaint
    | mapboxglTypes.HillshadePaint;

  @Prop() before: string;

  get sourceLoaded(): boolean {
    const sourceId = this.sourceId || this.layerId;
    return this.map && sourceId ? this.map.isSourceLoaded(sourceId) : false;
  }

  get mapLayer(): mapboxglTypes.Layer {
    return this.map ? this.map.getLayer(this.layerId) : null;
  }

  get mapSource(): mapboxglTypes.AnySourceImpl {
    const sourceId = this.sourceId || this.layerId;
    return this.map && sourceId ? this.map.getSource(sourceId) : null;
  }

  created() {
    if (this.minzoom || this.minzoom === 0) {
      this.$watch('minzoom', function(next) {
        this.map.setLayerZoomRange(this.layerId, next, this.maxzoom);
      });
    }

    if (this.maxzoom || this.minzoom === 0) {
      this.$watch('maxzoom', function(next) {
        this.map.setLayerZoomRange(this.layerId, this.minzoom, next);
      });
    }

    if (this.filter) {
      this.$watch('filter', function(next) {
        this.map.setFilter(this.layerId, next);
      });
    }

    if (this.layout) {
      this.$watch('layout', function(next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.map.setLayoutProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    if (this.paint) {
      this.$watch('paint', function(next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.map.setPaintProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    this.$watch('layerId', function(newLayerId) {
      this.viewModel && this.viewModel.setLayerId && this.viewModel.setLayerId(newLayerId);
    });
  }

  removed() {
    this.remove();
  }

  $_emitEvent(name: string, data = {}): void {
    this.$emit(name, {
      map: this.map,
      layerId: this.layerId,
      ...data
    });
  }

  $_emitLayerMapEvent(event: any): void {
    this.$_emitEvent(event.type, { mapboxEvent: event });
  }

  $_bindLayerEvents(): void {
    Object.keys(this.$listeners).forEach((eventName: MapLayerEventType) => {
      if (this.eventList.includes(eventName)) {
        this.map.on(eventName, this.layerId, this.$_emitLayerMapEvent);
      }
    });
  }

  $_unbindLayerEvents(events): void {
    if (this.map) {
      events.forEach((eventName: MapLayerEventType) => {
        this.map.off(eventName, this.layerId, this.$_emitLayerMapEvent);
      });
    }
  }

  move(beforeId: string): void {
    this.map.moveLayer(this.layerId, beforeId);
    this.$_emitEvent('layer-moved', {
      beforeId: beforeId
    });
  }

  remove(): void {
    this.viewModel && this.viewModel.removed && this.viewModel.removed();
    this.$_emitEvent('layer-removed');
  }
}

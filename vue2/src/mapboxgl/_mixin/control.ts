import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import mapEvent from 'vue-iclient/src/mapboxgl/_types/map-event';

@Component
export default class Control extends Vue {
  parentIsWebMapOrMap: boolean;
  filterDelayLoad: boolean;
  isShow = true;
  map: mapboxglTypes.Map;
  control: mapboxglTypes.IControl;

  @Prop() mapTarget: string;

  @Prop({
    default: 'top-left',
    validator(value: string) {
      return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value);
    }
  })
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

  @Watch('position')
  positionChanged() {
    if (this.$el && this.parentIsWebMapOrMap) {
      this.remove();
      this.addTo();
    }
  }

  created() {
    const parentName = this.$parent.$options.name;
    this.parentIsWebMapOrMap =
      parentName && ['smwebmap', 'smncpmap'].includes(this.$parent.$options.name.toLowerCase());
  }

  mounted() {
    this.filterDelayLoad = !['smwebmap', 'smminimap', 'smncpmap'].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    if (this.$el && this.parentIsWebMapOrMap) {
      if (this.filterDelayLoad) {
        this.isShow = false;
        const $el = <HTMLElement>this.$el;
        $el.style && ($el.style.display = 'none');
      }
      const targetName = this.getControlMapName();
      if (mapEvent.$options.getMap(targetName)) {
        this.mapLoaded(mapEvent.$options.getMap(targetName));
      }
      mapEvent.$on('load-map', this.controlLoadMapSucceed);
    }
  }

  beforeDestroy() {
    this.remove();
    mapEvent.$off('load-map', this.controlLoadMapSucceed);
  }

  initControl(): mapboxglTypes.IControl {
    const self = this;
    return {
      onAdd() {
        return <HTMLElement>self.$el;
      },
      onRemove() {
        return self.map;
      }
    };
  }

  addTo(): void {
    this.control = this.initControl();
    this.map.addControl(this.control, this.position);
    this.$el && this.$el.classList && this.$el.classList.add('mapboxgl-ctrl');
  }

  remove(): void {
    this.control && this.map && this.map.removeControl(this.control);
  }

  getControlMapName(): string {
    const selfParent = this.$parent;
    const parentTarget =
      selfParent &&
      selfParent.$options.name &&
      selfParent.$options.name.toLowerCase() === 'smwebmap' &&
      // @ts-ignore
      selfParent.target;
    // @ts-ignore
    return this.mapTarget || parentTarget || Object.keys(mapEvent.$options.getAllMaps())[0];
  }

  controlLoadMapSucceed(map: mapboxglTypes.Map, target: string): void {
    const targetName = this.getControlMapName();
    if (target === targetName) {
      this.mapLoaded(map);
    }
  }

  mapLoaded(map: mapboxglTypes.Map): void {
    this.map = map;
    this.addTo();
    if (this.filterDelayLoad) {
      this.isShow = true;
      const $el = <HTMLElement>this.$el;
      $el && $el.style && ($el.style.display = 'block');
    }
  }
}

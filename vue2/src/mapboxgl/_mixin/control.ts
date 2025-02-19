import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import MapControl from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl';

@Component
export default class Control extends Vue {
  parentIsWebMapOrMap: boolean;
  isDelayLoading: boolean;
  isShow = true;
  _mapControl: InstanceType<typeof MapControl>;

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
    this._mapControl?.onPositionChanged(this.position);
  }

  created() {
    const parentName = this.$parent.$options.name;
    this.parentIsWebMapOrMap =
      parentName && ['smwebmap', 'smncpmap'].includes(this.$parent.$options.name.toLowerCase());
    this.controlLoaded = this.controlLoaded.bind(this);
  }

  mounted() {
    const parentTarget =
      this.$parent &&
      ['smwebmap', 'smncpmap'].includes(this.$parent.$options.name.toLowerCase()) &&
      // @ts-ignore
      this.$parent.target;
    this._mapControl = new MapControl({
      el: <HTMLElement>this.$el,
      position: this.position,
      mapTarget: this.mapTarget,
      parentTarget
    });
    this._mapControl.on({
      'hook:loaded': this.controlLoaded
    });
    this.isDelayLoading = !['smwebmap', 'smminimap', 'smncpmap'].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    if (this.$el && this.parentIsWebMapOrMap) {
      if (this.isDelayLoading) {
        this.isShow = false;
        const $el = <HTMLElement>this.$el;
        $el.style && ($el.style.display = 'none');
      }
      this._mapControl.onMounted();
    }
  }

  beforeDestroy() {
    this._mapControl.un({
      'hook:loaded': this.controlLoaded
    });
    this._mapControl.onBeforeUnmount();
  }

  controlLoaded() {
    if (this.isDelayLoading) {
      this.isShow = true;
      const $el = <HTMLElement>this.$el;
      $el && $el.style && ($el.style.display = 'block');
    }
  }
}

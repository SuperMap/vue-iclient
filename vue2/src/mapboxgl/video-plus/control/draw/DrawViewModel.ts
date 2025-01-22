import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';
import MapboxDraw from 'vue-iclient-static/libs/mapbox-gl-draw/mapbox-gl-draw';

export default class DrawViewModel extends mapboxgl.Evented {
  fire: any;
  draw: Object;
  options: any;
  position: string;
  videoPlus: any = null;
  constructor(props) {
    super();
    const { position, controls, modes } = props;
    this.position = position;
    let formatControls = {};
    controls.forEach((control) => {
      formatControls[control] = true;
    });
    this.options = {
      controls: formatControls,
      displayControlsDefault: false
    };
    if (modes) {
      this.options.modes = modes;
    }
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.init();
    this.fire('load', this.videoPlus);
  }

  init() {
    this.draw = new MapboxDraw(this.options);
    this.videoPlus.addControl(this.draw, this.position);
  }

  removed() {
    // @ts-ignore
    this.map && this.videoPlus.removeControl(this.draw);
  }
}

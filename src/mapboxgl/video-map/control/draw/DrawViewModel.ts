import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { videoMapParams } from '../../VideoMapViewModel';

export default class DrawViewModel extends mapboxgl.Evented {
  draw: Object;
  options: any;
  position: string;
  videoMap: videoMapParams = null;
  constructor(options, position) {
    super();
    this.options = options;
    this.position = position;
  }

  setVideoMap({ videoMap }) {
    this.videoMap = videoMap;
    this.init();
  }

  init() {
    this.draw = new SuperMap.VideoMapDraw(this.options);
    this.add(this.position);
  }

  add(position) {
    this.videoMap.addControl(this.draw, position);
  }

  removed() {
    this.videoMap.removeControl(this.draw);
  }
}

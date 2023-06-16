import 'vue-iclient/static/libs/g6/g6.min';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export interface GraphNodeStyle {
  stroke?: string;
  lineWidth?: number;
  lineDash?: number[];
  fill?: string;
  fillOpacity?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
  cursor?: string;
}

export interface GridLayout {
  type?: 'force';
  center?: number[];
}

export interface GraphEdgeStyle {
  stroke?: string;
  strokeOpacity?: number;
  lineWidth?: number;
  lineDash?: number[];
  lineAppendWidth?: number;
  endArrow?: boolean | Record<string, string>;
  startArrow?: boolean | Record<string, string>;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  cursor?: string;
}

export interface GraphConfig {
  container?: string | HTMLElement;
  width?: number;
  height?: number;
  layout?: GridLayout;
  // autoResize?: boolean;
  defaultNode?: GraphNodeStyle;
  defaultEdge?: GraphEdgeStyle;
  nodeHighlightStyle?: GraphNodeStyle;
  edgeHighlightStyle?: GraphEdgeStyle;
  highlightNode?: boolean;
  highlightEdge?: boolean;
  showToolBar?: boolean;
  dragCanvas?: boolean;
  zoomCanvas?: boolean;
  dragNode?: boolean;
  nodeLabelMaxWidth?: number;
  minZoom?: number;
  maxZoom?: number;
  zoom?: number;
}

export interface G6Graph {
  getGraphCenterPoint: () => { x: number; y: number };
}

export interface KnowledgeGraph {
  graph: G6Graph;
  resize: (width: number, height: number) => void;
  destory: () => void;
  fitCenter: (center: number[]) => void;
  getZoom: () => number;
  zoomTo: (zoom: number) => void;
  on: (event: 'loaded') => void;
}

export interface GraphMap {
  graph: KnowledgeGraph;
}

export interface EmitParams {
  knowledgeGraph: KnowledgeGraph;
}

export default class GraphMapViewModel extends mapboxgl.Evented {
  private graphMap: GraphMap;
  private serviceUrl: string;
  private graphConfig: GraphConfig;
  private fire: (event: string, e: EmitParams) => void;
  private _handleGraphMapLoadedFn: () => void;
  on: (event: string, cb: (evt: EmitParams) => void) => void;
  off: (event: string, cb: (evt: EmitParams) => void) => void;

  constructor(serviceUrl: string, graphConfig: GraphConfig) {
    super();
    this.serviceUrl = serviceUrl;
    this.graphConfig = graphConfig;
    this._handleGraphMapLoadedFn = this._handleGraphMapLoaded.bind(this);
  }

  private get _knowledgeGraph() {
    return this.graphMap?.graph;
  }

  setServiceUrl(serviceUrl: string) {
    this.serviceUrl = serviceUrl;
    this._knowledgeGraph?.destory();
    this.initGraphMap();
  }

  initGraphMap() {
    if (!this.serviceUrl) {
      return;
    }
    const graphMap = new mapboxgl.supermap.GraphMap(this.serviceUrl, { config: this.graphConfig });
    this.graphMap = graphMap;
    graphMap.on('loaded', this._handleGraphMapLoadedFn);
  }

  resize(width: number, height: number) {
    this._knowledgeGraph?.resize(width, height);
  }

  private _handleGraphMapLoaded() {
    this.fire('loaded', { knowledgeGraph: this._knowledgeGraph });
  }
}

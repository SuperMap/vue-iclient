import mapboxgl from 'mapbox-gl';
import turfCenter from '@turf/center';
import { GeometryPolygon, GeometryLinearRing, GeometryPoint } from '@supermapgis/iclient-common/commontypes';
import iServerRestService from 'vue-iclient-core/utils/iServerRestService';
import WebSceneViewModel, { type SceneAppreciableLayer } from './WebSceneViewModel';
import type { HighlightStyle } from './LayerHighlightViewModel';
import { getDefaultLayerStyle } from './types';

/**
 * Scene query layer type (display type):
 * - restMap: rest/maps overlay layer in scene (query via rest/data GetFeaturesByGeometry when pick misses)
 * - mvt: rest/data MVT overlay layer in scene
 * GeoJSON / LayerManager entity layers: prefer scene.pick properties, skip data service request.
 */
export type SceneQueryLayerType = 'restMap' | 'mvt' | 'restData';

/** rest/data query data source */
export interface SceneQueryDataSource {
  /** data service url (rest/data) */
  url: string;
  /** data source name, e.g. World */
  dataSourceName: string;
  /** dataset name, e.g. Capitals */
  datasetName: string;
  proxy?: string;
  epsgCode?: number;
}

export interface SceneQueryLayer {
  /** unique layer id, used to group query results / match popupInfos */
  id: string;
  /**
   * overlay identity used to match scene rest/map customName or MVT name.
   * Defaults to id when omitted. Use when multiple datasets share one overlay (same layerId).
   */
  matchId?: string;
  /** display title */
  title?: string;
  /** layer type (optional, for identification only) */
  type?: SceneQueryLayerType;
  /** data service query config; query only when present */
  dataSource?: SceneQueryDataSource;
}

/** Visible rest/map imagery, rest/data MVT overlay or REST Data entity layer under current scene */
export interface SceneOverlayLayerInfo {
  category: 'imagLayers' | 'mvtLayers' | 'dataLayers';
  /** layer identity used to match popupInfos.layerId (customName / name) */
  id: string;
  name?: string;
  dataSourceName?: string;
  datasetName?: string;
  url?: string;
  type?: string;
  show: boolean;
}

export interface SceneHighlightOptions {
  layers?: SceneQueryLayer[];
  /** click buffer radius in meters */
  clickTolerance?: number;
  /**
   * Highlight style aligned with map attribute-popup / LayerHighlightViewModel.
   * Scene picks circle / line / fill / strokeLine by geometry type.
   */
  layerStyle?: HighlightStyle;
  /** allow multi-select accumulation */
  multiSelect?: boolean;
  /** enable click query */
  enabled?: boolean;
}

/** Resolved SuperMap3D paints derived from mapbox HighlightStyle */
interface SceneResolvedHighlightStyle {
  circle: { color: any; pixelSize: number; outlineColor: any; outlineWidth: number };
  line: { color: any; width: number };
  fill: { color: any; outlineColor: any; outlineWidth: number };
}

const DEFAULT_HIGHLIGHT_COLOR = '#409eff';
const POPUP_TIP_SIZE = 10;
/** tip apex inset from popup corner edge (matches scss left/right: 16px) */
const POPUP_TIP_INSET = 16;
/** gap between feature and tip apex (px) */
const POPUP_ANCHOR_OFFSET = 28;
const POPUP_VIEW_PADDING = 4;
const FALLBACK_POPUP_WIDTH = 280;
const FALLBACK_POPUP_HEIGHT = 200;
const DEFAULT_POPUP_PLACEMENT = 'bottom-left';

function asCssColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && value ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeLayerStyle(style?: HighlightStyle | null): HighlightStyle {
  const defaults = getDefaultLayerStyle() as HighlightStyle;
  if (!style) {
    return defaults;
  }
  const next: HighlightStyle = {
    circle: style.circle || defaults.circle,
    line: style.line || defaults.line,
    fill: style.fill || defaults.fill,
    strokeLine: style.strokeLine || style.stokeLine || defaults.strokeLine
  };
  return next;
}

export interface SceneQueryFeature {
  layerId: string;
  layerTitle?: string;
  properties: Record<string, any>;
  geometry?: GeoJSON.Geometry;
}

export interface SceneHighlightResult {
  lngLat?: [number, number];
  height?: number;
  screenPosition: { x: number; y: number };
  features: SceneQueryFeature[];
  /** layer ids that have results */
  layerIds: string[];
  /** clicked layer infos for select-layer UI (mirrors map layerclick.layers) */
  layers: Array<{ id: string; type?: string; name?: string }>;
  /** whether this click is multi-select (ctrl/meta held while multiSelect enabled) */
  isMultipleClick?: boolean;
  /** whether already had selection before this multi-select click */
  isSecMultipleClick?: boolean;
}

/** Popup field row aligned with attribute-popup PopupFieldItem */
export interface ScenePopupFieldItem {
  title: string;
  value: any;
  slotName?: any;
}

/** Emitted by queryFeaturesByLayerId — mirrors map mapselectionchanged payload shape */
export interface SceneLayerSelectionChangedEmit {
  features: SceneQueryFeature[];
  popupInfos: ScenePopupFieldItem[][];
  lnglats: Array<{ lng: number; lat: number; height?: number }>;
  targetId: string;
}

interface LonLatBounds {
  getWest(): number;
  getEast(): number;
  getSouth(): number;
  getNorth(): number;
}

interface SceneCameraViewSnapshot {
  destination: any;
  orientation: Record<string, any>;
}

function createLonLatBounds(lng: number, lat: number, delta: number): LonLatBounds {
  return {
    getWest: () => lng - delta,
    getEast: () => lng + delta,
    getSouth: () => lat - delta,
    getNorth: () => lat + delta
  };
}

function metersToDegrees(meters: number, lat: number) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = Math.max(Math.cos((lat * Math.PI) / 180) * 111320, 1e-6);
  return {
    latDelta: meters / metersPerDegreeLat,
    lngDelta: meters / metersPerDegreeLng
  };
}

function createQueryBounds(lng: number, lat: number, toleranceMeters: number): LonLatBounds {
  const { latDelta, lngDelta } = metersToDegrees(Math.max(toleranceMeters, 1), lat);
  const delta = Math.max(latDelta, lngDelta);
  return createLonLatBounds(lng, lat, delta);
}

/** Convert click tolerance bounds to SuperMap Geometry for GetFeaturesByGeometry */
function boundsToGeometry(bounds: LonLatBounds) {
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const geometry = new GeometryPolygon([
    new GeometryLinearRing([
      new GeometryPoint(west, south),
      new GeometryPoint(east, south),
      new GeometryPoint(east, north),
      new GeometryPoint(west, north)
    ])
  ]);
  geometry.SRID = 4326;
  return geometry;
}

function normalizeFeatures(result: any): GeoJSON.Feature[] {
  if (!result) {
    return [];
  }
  if (Array.isArray(result.features)) {
    return result.features;
  }
  if (result.features?.features && Array.isArray(result.features.features)) {
    return result.features.features;
  }
  return [];
}

/**
 * @class SceneHighlightViewModel
 * @description Scene click-query ViewModel: listens to scene click, queries restMap/mvt overlays via rest/data GetFeaturesByGeometry, and highlights results.
 * @extends mapboxgl.Evented
 */
export default class SceneHighlightViewModel extends mapboxgl.Evented {
  viewer: any = null;
  scene: any = null;
  webscene: InstanceType<typeof WebSceneViewModel> | null = null;
  options: Required<Pick<SceneHighlightOptions, 'clickTolerance' | 'multiSelect' | 'enabled'>> & {
    layers: SceneQueryLayer[];
    layerStyle: HighlightStyle;
  };
  handler: any;
  private highlightDataSource: any;
  /** feature keys already drawn in highlightDataSource (avoid rebuild flash on multi-select) */
  private highlightedFeatureKeys = new Set<string>();
  private querying = false;
  /** accumulated features for multi-select */
  private selectedFeatures: SceneQueryFeature[] = [];
  /** true while accumulating across consecutive Ctrl+clicks; reset on plain click or Ctrl/Meta release */
  private multiSelectActive = false;
  /** Real Ctrl/Meta pressed — guards SuperMap3D CTRL action misfires */
  private modifierKeyDown = false;
  private onModifierKeyDown: (e: KeyboardEvent) => void;
  /** End current multi-select session when Ctrl/Meta is released */
  private onModifierKeyUp: (e: KeyboardEvent) => void;
  /** Ignore stale async click results when a newer click started */
  private clickSeq = 0;
  /** Ignore stale async highlight when a newer highlight started */
  private highlightSeq = 0;
  /** popup anchor in world coords; projected to screen every frame */
  private popupAnchor: { lng: number; lat: number; height: number } | null = null;
  /** Last successful click — rest/map keeps select-layer & content popups on this point */
  private lastClickAnchor: {
    lng: number;
    lat: number;
    height: number;
    screenPosition: { x: number; y: number };
  } | null = null;
  private trackingPopupPosition = false;
  private trackingCameraPosition = false;
  /** whether popup shell is visible — layout only updates while true */
  private popupVisible = false;
  private popupRootEl: HTMLElement | null = null;
  private lastScreenPosition: { x: number; y: number } | null = null;
  private lastPopupLayout: { left: number; top: number } | null = null;
  private lastPopupPlacement = 'bottom-left';
  /** limit popup height so it stays clear of the feature (esp. upward near bottom edge) */
  private lastPopupMaxHeight: number | null = null;
  private onPostRender = () => {
    this.updatePopupScreenPosition();
  };
  private onCameraChanged = () => {
    if (this.popupAnchor && this.popupVisible) {
      this.updatePopupScreenPosition();
    }
  };

  constructor(options: SceneHighlightOptions = {}) {
    super();
    this.options = {
      layers: options.layers ?? [],
      clickTolerance: options.clickTolerance ?? 10,
      layerStyle: normalizeLayerStyle(options.layerStyle),
      multiSelect: options.multiSelect ?? false,
      enabled: options.enabled ?? true
    };
    this.onModifierKeyDown = (e: KeyboardEvent) => {
      if (!this.isModifierKey(e)) {
        return;
      }
      this.modifierKeyDown = true;
    };
    this.onModifierKeyUp = (e: KeyboardEvent) => {
      if (!this.isModifierKey(e)) {
        return;
      }
      this.modifierKeyDown = false;
      if (!this.options.multiSelect || !this.multiSelectActive) {
        return;
      }
      // Releasing Ctrl/Meta ends the current multi-select session;
      // the next Ctrl+click starts a new one instead of accumulating.
      this.multiSelectActive = false;
    };
  }

  private isModifierKey(e: KeyboardEvent) {
    return (
      e.key === 'Control' ||
      e.key === 'Meta' ||
      e.code === 'ControlLeft' ||
      e.code === 'ControlRight' ||
      e.code === 'MetaLeft' ||
      e.code === 'MetaRight'
    );
  }

  /**
   * @function SceneHighlightViewModel.prototype.setViewer
   * @desc Bind SuperMap3D Viewer and optional WebSceneViewModel (for getAppreciableLayers).
   */
  setViewer(viewer: any, webscene?: InstanceType<typeof WebSceneViewModel> | null) {
    this.destroyHandler();
    this.clearHighlight();
    this.popupVisible = false;
    this.popupRootEl = null;
    this.clearPopupAnchor();
    this.selectedFeatures = [];
    this.multiSelectActive = false;
    this.viewer = null;
    this.scene = null;
    this.webscene = null;
    if (!viewer?.scene) {
      return;
    }
    if (!window.SuperMap3D) {
      console.warn('[SceneHighlightViewModel] SuperMap3D is not loaded, please include SuperMap3D.js first');
      return;
    }
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.webscene = webscene || null;
    // Ensure sm-component-web-scene is the absolute containing/clipping box
    this.getPopupContainer();
    this.bindClick();
  }

  setLayers(layers: SceneQueryLayer[]) {
    this.options.layers = layers ?? [];
  }

  setClickTolerance(tolerance: number) {
    this.options.clickTolerance = tolerance;
  }

  setHighlightStyle(style: HighlightStyle) {
    this.options.layerStyle = normalizeLayerStyle(style);
  }

  setMultiSelect(multiSelect: boolean) {
    this.options.multiSelect = multiSelect;
    if (!multiSelect) {
      this.selectedFeatures = [];
      this.multiSelectActive = false;
      this.modifierKeyDown = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.options.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  bindClick() {
    this.destroyClickHandler();
    if (!this.scene?.canvas || !window.SuperMap3D) {
      return;
    }
    const SuperMap3D = window.SuperMap3D;
    this.handler = new SuperMap3D.ScreenSpaceEventHandler(this.scene.canvas);

    const onLeftClick = (movement: { position?: { x: number; y: number } }, isMultiple: boolean) => {
      if (!this.options.enabled || this.querying || !movement?.position) {
        return;
      }
      this.handleClick(movement, isMultiple);
    };

    // 保留 SuperMap3D 双绑定；用真实 Ctrl 状态兜底，避免未按 Ctrl 却走进多选 / 双回调竞态
    this.handler.setInputAction(
      (movement: { position?: { x: number; y: number } }) => {
        if (!this.modifierKeyDown) {
          // 修饰符回调误触发：交给普通 LEFT_CLICK，或按单选处理
          onLeftClick(movement, false);
          return;
        }
        onLeftClick(movement, !!this.options.multiSelect);
      },
      SuperMap3D.ScreenSpaceEventType.LEFT_CLICK,
      SuperMap3D.KeyboardEventModifier.CTRL
    );

    this.handler.setInputAction(
      (movement: { position?: { x: number; y: number } }) => {
        if (this.modifierKeyDown) {
          // 按住 Ctrl 时由 CTRL 绑定处理，避免两次 handleClick 竞态累加
          return;
        }
        onLeftClick(movement, false);
      },
      SuperMap3D.ScreenSpaceEventType.LEFT_CLICK
    );

    window.addEventListener('keydown', this.onModifierKeyDown, true);
    window.addEventListener('keyup', this.onModifierKeyUp, true);
  }

  private getFeatureKey(feature: SceneQueryFeature) {
    const props = feature.properties || {};
    const id =
      props.SmID ??
      props.SMID ??
      props.smid ??
      props.SmId ??
      props.id ??
      props.ID;
    if (id !== undefined && id !== null && id !== '') {
      return `${feature.layerId}:${id}`;
    }
    return `${feature.layerId}:${JSON.stringify(feature.geometry || {})}`;
  }

  private mergeSelectedFeatures(nextFeatures: SceneQueryFeature[], isMultiple: boolean) {
    // Each click contributes at most one feature (top hit)
    const primary = nextFeatures[0] ? [nextFeatures[0]] : [];
    if (!isMultiple) {
      // Plain click: replace selection, end any multi-select session
      this.selectedFeatures = primary;
      this.multiSelectActive = false;
      return;
    }
    const nextLayerId = primary[0]?.layerId;
    const prevLayerId = this.selectedFeatures[0]?.layerId;
    // Different layer (or first Ctrl+click): replace previous layer selection
    if (!this.multiSelectActive || !prevLayerId || !nextLayerId || prevLayerId !== nextLayerId) {
      this.selectedFeatures = primary;
      this.multiSelectActive = true;
      return;
    }
    // Same layer subsequent Ctrl+click: accumulate (dedup by feature key)
    const keySet = new Set(this.selectedFeatures.map(item => this.getFeatureKey(item)));
    primary.forEach(feature => {
      const key = this.getFeatureKey(feature);
      if (!keySet.has(key)) {
        this.selectedFeatures.push(feature);
        keySet.add(key);
      }
    });
  }

  /**
   * Keep features from only one logical layer per click.
   * Prefer popupInfos / layers order when multiple datasets under the same overlay hit.
   */
  private pickSingleLayerFeatures(features: SceneQueryFeature[]): SceneQueryFeature[] {
    if (!features.length) {
      return [];
    }
    const order = (this.options.layers || []).map(layer => layer.id).filter(Boolean);
    for (const id of order) {
      const matched = features.filter(item => item.layerId === id);
      if (matched.length) {
        return matched;
      }
    }
    const firstId = features[0].layerId;
    return features.filter(item => item.layerId === firstId);
  }

  /**
   * Prefer scene.pick entity properties (GeoJSON / LayerManager dataSource) over rest/data query.
   * Skips highlight dataSource entities; uses drillPick to find the first usable feature.
   */
  private pickEntityFeatures(screenPosition: { x: number; y: number }): SceneQueryFeature[] {
    if (!this.scene?.pick && !this.scene?.drillPick) {
      return [];
    }
    const pickedList: any[] = [];
    try {
      if (typeof this.scene.drillPick === 'function') {
        const drilled = this.scene.drillPick(screenPosition) || [];
        pickedList.push(...drilled);
      }
    } catch {
      // ignore
    }
    if (!pickedList.length && typeof this.scene.pick === 'function') {
      try {
        const picked = this.scene.pick(screenPosition);
        if (picked) {
          pickedList.push(picked);
        }
      } catch {
        // ignore
      }
    }
    for (const picked of pickedList) {
      const feature = this.buildFeatureFromPicked(picked);
      if (feature) {
        return [feature];
      }
    }
    return [];
  }

  private buildFeatureFromPicked(picked: any): SceneQueryFeature | null {
    const entity = picked?.id;
    if (!entity || typeof entity !== 'object') {
      return null;
    }
    if (this.isHighlightEntity(entity)) {
      return null;
    }
    const properties = this.getEntityProperties(entity);
    if (!properties || !Object.keys(properties).length) {
      return null;
    }
    const owner = entity.entityCollection?.owner;
    const layer = this.matchLayerByPickedEntity(entity, owner);
    if (!layer) {
      return null;
    }
    return {
      layerId: layer.id,
      layerTitle: layer.title || layer.id,
      properties,
      geometry: this.entityToGeoJsonGeometry(entity)
    };
  }

  private isHighlightEntity(entity: any) {
    const owner = entity?.entityCollection?.owner;
    if (!owner) {
      return false;
    }
    if (this.highlightDataSource && owner === this.highlightDataSource) {
      return true;
    }
    return owner.name === 'sm-scene-highlight';
  }

  private getEntityProperties(entity: any): Record<string, any> {
    if (entity?.___data && typeof entity.___data === 'object') {
      const data = { ...entity.___data };
      if (Object.keys(data).length) {
        return data;
      }
    }
    const layerFeatureProps =
      entity?.___layerFeatureData?.props ?? entity?.___layerFeatureData?.properties;
    if (layerFeatureProps && typeof layerFeatureProps === 'object') {
      const props = { ...layerFeatureProps };
      if (Object.keys(props).length) {
        return props;
      }
    }
    return this.extractEntityPropertiesFromBag(entity?.properties);
  }

  private extractEntityPropertiesFromBag(props: any): Record<string, any> {
    if (!props) {
      return {};
    }
    if (typeof props.getValue === 'function') {
      const SuperMap3D = window.SuperMap3D;
      const time = SuperMap3D?.JulianDate?.now?.() || new Date();
      return props.getValue(time) || {};
    }
    const names: string[] = props.propertyNames || [];
    if (!names.length) {
      return {};
    }
    const result: Record<string, any> = {};
    names.forEach((key: string) => {
      const field = props[key];
      result[key] =
        field && typeof field.getValue === 'function' ? field.getValue() : field?._value ?? field;
    });
    return result;
  }

  /** Match LayerManager metadata or a generic GeoJSON dataSource name to popupInfos. */
  private matchLayerByPickedEntity(entity: any, owner: any): SceneQueryLayer | null {
    const featureLayerData = entity?.___layerFeatureData;
    const layerData = featureLayerData?.data;
    const layerConfig = layerData?.config;
    const isRestDataEntity =
      !!featureLayerData && layerData?.type === 'data' && layerConfig?.type === 'rest';

    if (isRestDataEntity) {
      const datasetName = String(layerConfig?.datasetName || featureLayerData?.layerId || '').trim();
      const dataSourceName = String(
        layerConfig?.datasourceName || layerConfig?.dataSourceName || ''
      ).trim();
      const layerId = String(featureLayerData?.layerId || layerData?.id || '').trim();
      const ownerName = String(owner?.name || '').trim();

      // Same rest/data service may back multiple popup configs — dataset wins over dataSourceName.
      const exact = this.findLayerByDataSourceDataset(dataSourceName, datasetName);
      if (exact) {
        return exact;
      }

      const datasetIdentities = [datasetName, layerId, layerData?.name, ownerName].filter(Boolean);
      return this.matchLayerByIdentities(datasetIdentities, { skipDataSourceName: true });
    }

    const ownerName = String(owner?.name || '').trim();
    if (!ownerName) {
      return null;
    }
    return this.matchLayerByIdentities([ownerName], { skipDataSourceName: true });
  }

  private findLayerByDataSourceDataset(
    dataSourceName: string,
    datasetName: string
  ): SceneQueryLayer | null {
    if (!dataSourceName || !datasetName) {
      return null;
    }
    return (
      (this.options.layers || []).find(
        layer =>
          layer.dataSource?.dataSourceName === dataSourceName &&
          layer.dataSource?.datasetName === datasetName
      ) || null
    );
  }

  private matchLayerByIdentities(
    pickedIdentities: Array<string | undefined>,
    options: { skipDataSourceName?: boolean } = {}
  ): SceneQueryLayer | null {
    const identities = pickedIdentities.filter(Boolean).map(item => String(item).trim());
    if (!identities.length) {
      return null;
    }
    return (
      (this.options.layers || []).find(layer => {
        const candidates = [
          layer.id,
          layer.matchId,
          layer.title,
          layer.dataSource?.datasetName,
          options.skipDataSourceName ? undefined : layer.dataSource?.dataSourceName,
          layer.dataSource
            ? `${layer.dataSource.datasetName}@${layer.dataSource.dataSourceName}`
            : undefined
        ]
          .filter(Boolean)
          .map(item => String(item).trim());
        return candidates.some(candidate =>
          identities.some(identity => this.isSameLayerIdentity(candidate, identity))
        );
      }) || null
    );
  }

  private isSameLayerIdentity(first: string, second: string) {
    const left = String(first || '').trim();
    const right = String(second || '').trim();
    if (!left || !right) {
      return false;
    }
    const lowerLeft = left.toLowerCase();
    const lowerRight = right.toLowerCase();
    return (
      lowerLeft === lowerRight ||
      lowerLeft.startsWith(`${lowerRight}@@`) ||
      lowerLeft.includes(`@@${lowerRight}`) ||
      lowerLeft.endsWith(`.${lowerRight}`) ||
      lowerLeft.endsWith(`:${lowerRight}`)
    );
  }

  private entityToGeoJsonGeometry(entity: any): GeoJSON.Geometry | undefined {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D || !entity) {
      return undefined;
    }
    const time = SuperMap3D.JulianDate?.now?.() || undefined;
    const toLngLat = (cartesian: any): [number, number, number?] | null => {
      if (!cartesian) {
        return null;
      }
      const cartographic = SuperMap3D.Cartographic.fromCartesian(cartesian);
      if (!cartographic) {
        return null;
      }
      return [
        SuperMap3D.Math.toDegrees(cartographic.longitude),
        SuperMap3D.Math.toDegrees(cartographic.latitude),
        cartographic.height || 0
      ];
    };
    const positionsToCoords = (positions: any[]): number[][] => {
      if (!Array.isArray(positions)) {
        return [];
      }
      return positions
        .map(item => toLngLat(item))
        .filter((item): item is [number, number, number?] => !!item)
        .map(([lng, lat, h]) => (h != null ? [lng, lat, h] : [lng, lat]));
    };

    if (entity.polygon) {
      const hierarchy =
        typeof entity.polygon.hierarchy?.getValue === 'function'
          ? entity.polygon.hierarchy.getValue(time)
          : entity.polygon.hierarchy;
      const positions = hierarchy?.positions || hierarchy;
      const coords = positionsToCoords(Array.isArray(positions) ? positions : []);
      if (coords.length >= 3) {
        const first = coords[0];
        const last = coords[coords.length - 1];
        const ring =
          first[0] === last[0] && first[1] === last[1] ? coords : coords.concat([first.slice()]);
        return { type: 'Polygon', coordinates: [ring] };
      }
    }
    if (entity.polyline) {
      const positions =
        typeof entity.polyline.positions?.getValue === 'function'
          ? entity.polyline.positions.getValue(time)
          : entity.polyline.positions;
      const coords = positionsToCoords(Array.isArray(positions) ? positions : []);
      if (coords.length >= 2) {
        return { type: 'LineString', coordinates: coords };
      }
    }
    if (entity.position) {
      const cartesian =
        typeof entity.position.getValue === 'function' ? entity.position.getValue(time) : entity.position;
      const lngLat = toLngLat(cartesian);
      if (lngLat) {
        return { type: 'Point', coordinates: lngLat };
      }
    }
    return undefined;
  }

  private async handleClick(movement: any, isMultipleClick = false) {
    const position = movement?.position;
    if (!position) {
      return;
    }
    const cameraView = this.captureCameraView();
    // Lock immediately so dual ScreenSpace callbacks cannot race into two async picks
    if (this.querying) {
      return;
    }
    this.querying = true;
    const seq = ++this.clickSeq;
    const prevLayerId = this.selectedFeatures[0]?.layerId;
    try {
      const lngLatHeight = await this.pickLngLat(position);
      if (seq !== this.clickSeq) {
        return;
      }
      if (!lngLatHeight) {
        if (!isMultipleClick) {
          this.clear();
        }
        this.emitSelectionChanged({
          lngLat: undefined,
          screenPosition: { x: position.x, y: position.y },
          features: isMultipleClick ? this.selectedFeatures.slice() : [],
          isMultipleClick,
          isSecMultipleClick: false
        });
        return;
      }
      const [lng, lat, height] = lngLatHeight;
      const groundHeight = this.getGroundHeight(lng, lat, height || 0);
      this.lastClickAnchor = {
        lng,
        lat,
        height: groundHeight,
        screenPosition: { x: position.x, y: position.y }
      };

      // 1) Prefer entity pick properties (GeoJSON / rest data on scene) — no data service request
      const pickedFeatures = this.pickEntityFeatures(position);
      if (pickedFeatures.length) {
        // Viewer also handles Entity clicks and may start tracking/flying to the picked
        // entity. The scene popup owns this selection, so keep the camera at the user's
        // pre-click view instead of letting the default Entity navigation take over.
        this.releaseDefaultEntityNavigation(cameraView);
      }
      // 2) Fallback: rest/map + mvt overlays → GetFeaturesByGeometry
      const layersToQuery = pickedFeatures.length ? [] : this.resolveLayersToQuery();
      if (!pickedFeatures.length && !layersToQuery.length) {
        if (!isMultipleClick) {
          this.clear();
        }
        this.emitSelectionChanged({
          lngLat: undefined,
          height,
          screenPosition: { x: position.x, y: position.y },
          features: isMultipleClick ? this.selectedFeatures.slice() : [],
          isMultipleClick,
          isSecMultipleClick: false
        });
        return;
      }

      this.fire('querystart', { lngLat: [lng, lat], height, isMultipleClick });
      const clickedFeatures = pickedFeatures.length
        ? pickedFeatures
        : this.filterValidQueryFeatures(await this.queryAtPoint(lng, lat), lng, lat);
      if (seq !== this.clickSeq) {
        return;
      }
      if (!clickedFeatures.length) {
        if (!isMultipleClick) {
          this.clear();
        }
        this.emitSelectionChanged({
          lngLat: undefined,
          screenPosition: { x: position.x, y: position.y },
          features: isMultipleClick ? this.selectedFeatures.slice() : [],
          isMultipleClick,
          isSecMultipleClick: false
        });
        this.fire('queryend', {
          features: [],
          layerIds: [],
          layers: [],
          isMultipleClick,
          isSecMultipleClick: false
        });
        return;
      }

      const hitLayerIds = Array.from(new Set(clickedFeatures.map(item => item.layerId).filter(Boolean)));
      const needsLayerPick =
        !pickedFeatures.length && hitLayerIds.length > 1 && !isMultipleClick;

      if (needsLayerPick) {
        this.selectedFeatures = clickedFeatures.slice();
        this.multiSelectActive = false;
        this.clearHighlight();
        if (clickedFeatures.length) {
          // rest/map 等多图层：选图层与内容都锚定点击点，避免切换后弹窗跳动
          this.setPopupAnchor(lng, lat, groundHeight, position);
        }
        const pickResult = this.emitSelectionChanged({
          lngLat: [lng, lat],
          height: groundHeight,
          screenPosition: { x: position.x, y: position.y },
          features: clickedFeatures,
          isMultipleClick,
          isSecMultipleClick: false
        });
        this.fire('queryend', pickResult);
        return;
      }

      const featuresForHighlight = pickedFeatures.length
        ? pickedFeatures
        : this.pickSingleLayerFeatures(clickedFeatures);
      const nextLayerId = featuresForHighlight[0]?.layerId;
      const sameLayerContinue = !!(
        isMultipleClick &&
        this.multiSelectActive &&
        this.selectedFeatures.length > 0 &&
        prevLayerId &&
        nextLayerId &&
        prevLayerId === nextLayerId
      );
      this.mergeSelectedFeatures(featuresForHighlight, isMultipleClick);
      const features = this.selectedFeatures.slice();
      const clickedPrimary = featuresForHighlight[0] ? [featuresForHighlight[0]] : [];
      if (sameLayerContinue) {
        await this.appendHighlightFeatures(clickedPrimary);
      } else {
        await this.highlightFeatures(features, { replace: true });
      }
      if (seq !== this.clickSeq) {
        return;
      }
      if (features.length) {
        // 点击点先落下；queryFeaturesByLayerId 里 rest/map 继续用点击点，rest/data 再切几何中心
        this.setPopupAnchor(lng, lat, groundHeight, position);
      } else if (!isMultipleClick) {
        this.clearPopupAnchor();
      }
      const result = this.emitSelectionChanged({
        lngLat: [lng, lat],
        height: groundHeight,
        screenPosition: { x: position.x, y: position.y },
        features,
        isMultipleClick,
        isSecMultipleClick: sameLayerContinue
      });
      if (features.length === 1 && !needsLayerPick) {
        this.queryFeaturesByLayerId(features[0].layerId, { highlight: false });
      }
      this.fire('queryend', result);
    } catch (error) {
      if (seq !== this.clickSeq) {
        return;
      }
      this.fire('queryfailed', error);
      this.emitSelectionChanged({
        lngLat: undefined,
        screenPosition: { x: position.x, y: position.y },
        features: isMultipleClick ? this.selectedFeatures.slice() : [],
        isMultipleClick,
        isSecMultipleClick: false
      });
    } finally {
      if (seq === this.clickSeq) {
        this.querying = false;
      }
    }
  }

  private cloneCartesian(value: any) {
    if (!value) {
      return value;
    }
    const Cartesian3 = window.SuperMap3D?.Cartesian3;
    if (typeof Cartesian3?.clone === 'function') {
      return Cartesian3.clone(value);
    }
    if (typeof value.clone === 'function') {
      return value.clone();
    }
    return { x: value.x, y: value.y, z: value.z };
  }

  private captureCameraView(): SceneCameraViewSnapshot | null {
    const camera = this.scene?.camera || this.viewer?.camera;
    const destination = camera?.positionWC || camera?.position;
    if (!camera || !destination) {
      return null;
    }
    const direction = camera.directionWC || camera.direction;
    const up = camera.upWC || camera.up;
    const orientation =
      direction && up
        ? {
            direction: this.cloneCartesian(direction),
            up: this.cloneCartesian(up)
          }
        : {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
          };
    return {
      destination: this.cloneCartesian(destination),
      orientation
    };
  }

  private releaseDefaultEntityNavigation(cameraView: SceneCameraViewSnapshot | null) {
    const camera = this.scene?.camera || this.viewer?.camera;
    if (this.viewer) {
      this.viewer.trackedEntity = undefined;
      this.viewer.selectedEntity = undefined;
    }
    camera?.cancelFlight?.();
    if (cameraView && typeof camera?.setView === 'function') {
      camera.setView(cameraView);
    }
  }

  /** Build layer list for select-layer UI and fire selectionchanged */
  private emitSelectionChanged(
    payload: Omit<SceneHighlightResult, 'layers' | 'layerIds'> & { layerIds?: string[] }
  ): SceneHighlightResult {
    const features = payload.features || [];
    const layerIds =
      payload.layerIds ?? Array.from(new Set(features.map(item => item.layerId).filter(Boolean)));
    const result: SceneHighlightResult = {
      ...payload,
      layerIds,
      layers: this.buildClickedLayers(features, layerIds),
      isMultipleClick: !!payload.isMultipleClick,
      isSecMultipleClick: !!payload.isSecMultipleClick
    };
    this.fire('selectionchanged', result);
    return result;
  }

  private filterValidQueryFeatures(
    features: SceneQueryFeature[],
    lng?: number,
    lat?: number
  ): SceneQueryFeature[] {
    return (features || []).filter(feature => {
      const properties = feature?.properties || {};
      if (!feature?.geometry || !Object.keys(properties).length) {
        return false;
      }
      if (typeof lng === 'number' && typeof lat === 'number') {
        return this.geometryIntersectsClick(feature.geometry, lng, lat);
      }
      return true;
    });
  }

  private geometryIntersectsClick(geometry: GeoJSON.Geometry, lng: number, lat: number) {
    const tolerance = Math.max(this.options.clickTolerance || 10, 1);
    switch (geometry.type) {
      case 'Point':
        return this.planarDistanceMeters(geometry.coordinates as number[], lng, lat) <= tolerance;
      case 'MultiPoint':
        return (geometry.coordinates as number[][]).some(point =>
          this.planarDistanceMeters(point, lng, lat) <= tolerance
        );
      case 'LineString':
        return this.lineIntersectsClick(geometry.coordinates as number[][], lng, lat, tolerance);
      case 'MultiLineString':
        return (geometry.coordinates as number[][][]).some(line =>
          this.lineIntersectsClick(line, lng, lat, tolerance)
        );
      case 'Polygon':
        return this.pointInPolygonRing(lng, lat, geometry.coordinates[0] as number[][]);
      case 'MultiPolygon':
        return geometry.coordinates.some(polygon =>
          this.pointInPolygonRing(lng, lat, polygon[0] as number[][])
        );
      default:
        return true;
    }
  }

  private planarDistanceMeters(coord: number[], lng: number, lat: number) {
    const metersPerDegreeLat = 111320;
    const dLng = (coord[0] - lng) * Math.cos((lat * Math.PI) / 180) * metersPerDegreeLat;
    const dLat = (coord[1] - lat) * metersPerDegreeLat;
    return Math.sqrt(dLng * dLng + dLat * dLat);
  }

  private lineIntersectsClick(line: number[][], lng: number, lat: number, tolerance: number) {
    for (let index = 1; index < line.length; index++) {
      if (
        this.pointToSegmentDistanceMeters(line[index - 1], line[index], lng, lat) <= tolerance
      ) {
        return true;
      }
    }
    return false;
  }

  private pointToSegmentDistanceMeters(a: number[], b: number[], lng: number, lat: number) {
    const ax = a[0];
    const ay = a[1];
    const bx = b[0];
    const by = b[1];
    const dx = bx - ax;
    const dy = by - ay;
    if (dx === 0 && dy === 0) {
      return this.planarDistanceMeters(a, lng, lat);
    }
    const t = Math.max(0, Math.min(1, ((lng - ax) * dx + (lat - ay) * dy) / (dx * dx + dy * dy)));
    const proj = [ax + t * dx, ay + t * dy];
    return this.planarDistanceMeters(proj, lng, lat);
  }

  private pointInPolygonRing(lng: number, lat: number, ring: number[][]) {
    if (!Array.isArray(ring) || ring.length < 3) {
      return false;
    }
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0];
      const yi = ring[i][1];
      const xj = ring[j][0];
      const yj = ring[j][1];
      const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersects) {
        inside = !inside;
      }
    }
    return inside;
  }

  private geometryTypeToLayerType(geometry?: GeoJSON.Geometry): string {
    if (!geometry) {
      return 'fill';
    }
    switch (geometry.type) {
      case 'Point':
      case 'MultiPoint':
        return 'circle';
      case 'LineString':
      case 'MultiLineString':
        return 'line';
      default:
        return 'fill';
    }
  }

  private buildClickedLayers(
    features: SceneQueryFeature[],
    layerIds?: string[]
  ): Array<{ id: string; type?: string; name?: string }> {
    const ids = layerIds ?? Array.from(new Set(features.map(item => item.layerId).filter(Boolean)));
    return ids.map(id => {
      const first = features.find(item => item.layerId === id);
      return {
        id,
        type: this.geometryTypeToLayerType(first?.geometry),
        name: first?.layerTitle || id
      };
    });
  }

  private async pickLngLat(screenPosition: { x: number; y: number }): Promise<[number, number, number] | null> {
    const SuperMap3D = window.SuperMap3D;
    let cartesian: any;
    try {
      // Prefer sync pickPosition: pickPositionAsync can introduce a large Y offset
      // (same workaround as iEarth CustomBubble), which skews popup height near the view bottom.
      if (typeof this.scene.pickPosition === 'function') {
        cartesian = this.scene.pickPosition(screenPosition);
      } else if (typeof this.scene.pickPositionAsync === 'function') {
        cartesian = await this.scene.pickPositionAsync(screenPosition);
      }
    } catch {
      cartesian = undefined;
    }
    if (!cartesian) {
      const ray = this.viewer.camera.getPickRay(screenPosition);
      cartesian = ray ? this.scene.globe.pick(ray, this.scene) : undefined;
    }
    if (!cartesian) {
      return null;
    }
    const cartographic = SuperMap3D.Cartographic.fromCartesian(cartesian);
    if (!cartographic) {
      return null;
    }
    return [
      SuperMap3D.Math.toDegrees(cartographic.longitude),
      SuperMap3D.Math.toDegrees(cartographic.latitude),
      cartographic.height || 0
    ];
  }

  /**
   * Height for clampToGround / rest-data popup anchors.
   * Prefer globe terrain height at the feature center — click pick height can be wrong
   * (especially near the bottom of the view) and pushes the projected popup far above the feature.
   */
  private getGroundHeight(lng: number, lat: number, fallback = 0): number {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D || !this.scene?.globe || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      return fallback;
    }
    try {
      const cartographic = SuperMap3D.Cartographic.fromDegrees(lng, lat);
      if (typeof this.scene.globe.getHeight === 'function') {
        const height = this.scene.globe.getHeight(cartographic);
        if (typeof height === 'number' && Number.isFinite(height)) {
          return height;
        }
      }
    } catch {
      // ignore and fall through
    }
    return fallback;
  }

  async queryAtPoint(lng: number, lat: number): Promise<SceneQueryFeature[]> {
    // Only query configs that match visible rest/map imagery or MVT overlays and have dataSource
    const layers = this.resolveLayersToQuery();
    if (!layers.length) {
      return [];
    }
    const bounds = createQueryBounds(lng, lat, this.options.clickTolerance);
    const geometry = boundsToGeometry(bounds);
    const tasks = layers.map(layer => this.queryLayer(layer, geometry));
    const results = await Promise.all(tasks);
    return ([] as SceneQueryFeature[]).concat(...results);
  }

  /**
   * Collect visible queryable overlays from webscene.getAppreciableLayers:
   * - imagLayers: SuperMapImageryProvider / rest/maps
   * - mvtLayers: scene vector tile maps
   * - dataLayers: LayerManager REST Data entity layers
   */
  getVisibleOverlayLayers(): SceneOverlayLayerInfo[] {
    const appreciableLayers = this.webscene?.getAppreciableLayers?.() || [];
    return appreciableLayers
      .filter(layer => this.isQueryableAppreciableLayer(layer))
      .map(layer => ({
        category: layer.category as 'imagLayers' | 'mvtLayers' | 'dataLayers',
        id: String(layer.id || layer.customName || ''),
        name: layer.customName,
        dataSourceName: layer.dataSourceName,
        datasetName: layer.datasetName,
        url: layer.url,
        type: layer.type,
        show: layer.show !== false
      }))
      .filter(layer => !!layer.id);
  }

  private isQueryableAppreciableLayer(layer: SceneAppreciableLayer) {
    if (!layer || layer.show === false || !layer.customName) {
      return false;
    }
    if (layer.category === 'dataLayers') {
      return true;
    }
    if (layer.category === 'mvtLayers') {
      return true;
    }
    if (layer.category === 'imagLayers') {
      return (
        layer.type === 'SuperMapImageryProvider' ||
        (typeof layer.url === 'string' && layer.url.includes('/rest/maps/'))
      );
    }
    return false;
  }

  /**
   * Match popupInfos/layers by overlay id; only keep items that have dataSource.
   */
  resolveLayersToQuery(): SceneQueryLayer[] {
    const overlays = this.getVisibleOverlayLayers();
    if (!overlays.length) {
      return [];
    }
    return (this.options.layers || []).filter(config => {
      if (!config?.id || !this.hasValidDataSource(config)) {
        return false;
      }
      return overlays.some(overlay => this.matchLayerConfig(config, overlay));
    });
  }

  private hasValidDataSource(layer: SceneQueryLayer) {
    const dataSource = layer?.dataSource;
    return !!(dataSource?.url && dataSource.dataSourceName && dataSource.datasetName);
  }

  private matchLayerConfig(config: SceneQueryLayer, overlay: SceneOverlayLayerInfo) {
    // Prefer matchId when multiple datasets share one overlay layerId
    const configId = String(config.matchId || config.id || '').trim();
    const overlayIds = [overlay.id, overlay.name].filter(Boolean).map(item => String(item).trim());
    if (!configId || !overlayIds.length) {
      return false;
    }
    if (config.type === 'mvt' && overlay.category !== 'mvtLayers') {
      return false;
    }
    if (config.type === 'restMap' && overlay.category !== 'imagLayers') {
      return false;
    }
    if (config.type === 'restData' && overlay.category !== 'dataLayers') {
      return false;
    }
    if (overlayIds.some(overlayId => this.isSameLayerIdentity(configId, overlayId))) {
      return true;
    }
    // layerId may be map name while overlay id comes from url path segment
    if (overlay.url && overlay.url.includes(`/rest/maps/${configId}`)) {
      return true;
    }
    if (
      overlay.category === 'dataLayers' &&
      config.dataSource?.dataSourceName === overlay.dataSourceName &&
      config.dataSource?.datasetName === overlay.datasetName
    ) {
      return true;
    }
    return false;
  }

  /**
   * restMap / mvt overlays query via rest/data GetFeaturesByGeometry when dataSource exists.
   */
  private async queryLayer(layer: SceneQueryLayer, geometry: any): Promise<SceneQueryFeature[]> {
    const dataSource = layer?.dataSource;
    if (!this.hasValidDataSource(layer) || !dataSource) {
      return [];
    }
    try {
      const service = new iServerRestService(dataSource.url, {
        hasGeometry: true,
        proxy: dataSource.proxy,
        epsgCode: dataSource.epsgCode
      });
      const result = await service.getFeaturesByGeometry(
        {
          dataUrl: dataSource.url,
          dataSourceName: dataSource.dataSourceName,
          datasetName: dataSource.datasetName
        },
        {
          geometry,
          maxFeatures: 1,
          spatialQueryMode: 'INTERSECT'
        }
      );
      return this.mapResultToFeatures(layer, result).slice(0, 1);
    } catch (error) {
      console.warn(`[SceneHighlightViewModel] query layer ${layer.id} failed`, error);
    }
    return [];
  }

  private mapResultToFeatures(layer: SceneQueryLayer, result: any): SceneQueryFeature[] {
    return normalizeFeatures(result).map(feature => ({
      layerId: layer.id,
      layerTitle: layer.title || layer.id,
      properties: feature.properties || {},
      geometry: feature.geometry
    }));
  }

  async highlightFeatures(
    features: SceneQueryFeature[],
    options: { replace?: boolean } = {}
  ) {
    const seq = ++this.highlightSeq;
    const withGeometry = features.filter(item => item.geometry);
    if (!withGeometry.length || !this.viewer || !window.SuperMap3D) {
      if (seq === this.highlightSeq) {
        this.clearHighlight();
      }
      return;
    }
    if (options.replace !== false && seq === this.highlightSeq) {
      this.clearHighlight();
    }
    try {
      const dataSource = await this.loadHighlightDataSource(withGeometry);
      if (seq !== this.highlightSeq) {
        return;
      }
      await this.viewer.dataSources.add(dataSource);
      this.highlightDataSource = dataSource;
      this.highlightedFeatureKeys = new Set(withGeometry.map(item => this.getFeatureKey(item)));
    } catch (error) {
      if (seq === this.highlightSeq) {
        console.warn('[SceneHighlightViewModel] highlight features failed', error);
      }
    }
  }

  /**
   * Add highlight for newly selected features without touching existing ones.
   * Used by consecutive Ctrl+clicks within the same multi-select session.
   */
  async appendHighlightFeatures(features: SceneQueryFeature[]) {
    const toAdd = features.filter(
      item => item.geometry && !this.highlightedFeatureKeys.has(this.getFeatureKey(item))
    );
    if (!toAdd.length) {
      return;
    }
    if (!this.highlightDataSource || !this.viewer || !window.SuperMap3D) {
      await this.highlightFeatures(this.selectedFeatures.slice());
      return;
    }
    try {
      const tempDataSource = await this.loadHighlightDataSource(toAdd);
      // Move entities into the existing dataSource so previous highlights stay put
      const entities = (tempDataSource.entities.values || []).slice();
      entities.forEach((entity: any) => {
        this.highlightDataSource.entities.add(entity);
      });
      toAdd.forEach(item => this.highlightedFeatureKeys.add(this.getFeatureKey(item)));
    } catch (error) {
      console.warn('[SceneHighlightViewModel] append highlight features failed', error);
    }
  }

  /**
   * Build popup rows / anchors for a selected layer and fire mapselectionchanged.
   * Mirrors PopupViewModel.queryFeaturesByLayerId for scene cached features.
   */
  queryFeaturesByLayerId(layerId: string, options: { highlight?: boolean } = {}) {
    if (!layerId) {
      return;
    }
    const features = this.selectedFeatures.filter(item => item.layerId === layerId);
    if (options.highlight !== false && features.length) {
      void this.highlightFeatures(features, { replace: true });
    }
    const popupInfos = features.map(item => this.featureToPopupData(item));
    const useClickAnchor = this.shouldUseClickPopupAnchor(layerId);
    const clickAnchor = this.lastClickAnchor || this.popupAnchor;
    const lnglats = features.map(feature => {
      if (useClickAnchor && clickAnchor) {
        return {
          lng: clickAnchor.lng,
          lat: clickAnchor.lat,
          height: clickAnchor.height || 0
        };
      }
      const center = this.getGeometryCenter(feature.geometry);
      if (center) {
        // rest/data & clampToGround：锚几何中心 + 地表高度
        return {
          lng: center[0],
          lat: center[1],
          height: this.getGroundHeight(center[0], center[1], 0)
        };
      }
      if (clickAnchor) {
        return {
          lng: clickAnchor.lng,
          lat: clickAnchor.lat,
          height: clickAnchor.height || 0
        };
      }
      return { lng: 0, lat: 0, height: 0 };
    });
    const anchor = lnglats[0];
    if (anchor && Number.isFinite(anchor.lng) && Number.isFinite(anchor.lat)) {
      const screenHint =
        useClickAnchor && this.lastClickAnchor
          ? this.lastClickAnchor.screenPosition
          : undefined;
      this.setPopupAnchor(anchor.lng, anchor.lat, anchor.height || 0, screenHint);
    }
    const emitData: SceneLayerSelectionChangedEmit = {
      features,
      popupInfos,
      lnglats,
      targetId: layerId
    };
    this.fire('mapselectionchanged', emitData);
  }

  /**
   * rest/map & mvt：弹窗锚定点击点，保证「选择图层」与内容弹窗位置一致。
   * rest/data（实体拾取）：锚定几何中心，tip 贴高亮要素。
   */
  private shouldUseClickPopupAnchor(layerId: string): boolean {
    const layer = (this.options.layers || []).find(
      item => item.id === layerId || item.matchId === layerId
    );
    if (layer?.type === 'restMap' || layer?.type === 'mvt') {
      return true;
    }
    if (layer?.type === 'restData') {
      return false;
    }
    const overlays = this.getVisibleOverlayLayers();
    const config: SceneQueryLayer = layer || { id: layerId, matchId: layerId };
    const matched = overlays.find(overlay => this.matchLayerConfig(config, overlay));
    if (matched?.category === 'imagLayers' || matched?.category === 'mvtLayers') {
      return true;
    }
    if (matched?.category === 'dataLayers') {
      return false;
    }
    // 默认跟点击点：多图层选择场景更常见，避免选层后弹窗跳动
    return true;
  }

  /**
   * Re-highlight subset of selected features by identify field values (layer switch / attribute filter).
   */
  setHighlightLayerFilter(layerId: string, identifyFields: { field: string; values: any[] }) {
    const source = layerId
      ? this.selectedFeatures.filter(item => item.layerId === layerId)
      : this.selectedFeatures.slice();
    const filtered = source.filter(feature =>
      identifyFields.values.includes(feature.properties?.[identifyFields.field])
    );
    this.highlightFeatures(filtered, { replace: true });
  }

  private featureToPopupData(feature: SceneQueryFeature): ScenePopupFieldItem[] {
    return Object.keys(feature.properties || {}).map(key => ({
      title: key,
      value: feature.properties[key],
      slotName: undefined
    }));
  }

  /** Compute [lng, lat] center from a GeoJSON geometry via @turf/center. */
  private getGeometryCenter(geometry: GeoJSON.Geometry | undefined): [number, number, number?] | null {
    if (!geometry || geometry.type === 'GeometryCollection') {
      return null;
    }
    try {
      const centerFeature = turfCenter({
        type: 'Feature',
        properties: {},
        geometry
      });
      const [lng, lat] = centerFeature.geometry.coordinates;
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        return null;
      }
      return [lng, lat];
    } catch {
      return null;
    }
  }

  private async loadHighlightDataSource(features: SceneQueryFeature[]) {
    const SuperMap3D = window.SuperMap3D;
    const style = this.resolveHighlightStyle();
    // Build entities manually: GeoJsonDataSource + clampToGround may turn lines into
    // corridors/markers (round dots) and meter-based width is invisible at country scale.
    const dataSource = new SuperMap3D.CustomDataSource('sm-scene-highlight');
    features.forEach((item, index) => {
      if (!item.geometry) {
        return;
      }
      this._addHighlightEntitiesForGeometry(
        dataSource,
        item.geometry,
        style,
        `${this.getFeatureKey(item)}:${index}`
      );
    });
    return dataSource;
  }

  /** Map mapbox HighlightStyle paints → SuperMap3D entity paints by geometry type */
  private resolveHighlightStyle(): SceneResolvedHighlightStyle {
    const SuperMap3D = window.SuperMap3D;
    const layerStyle = normalizeLayerStyle(this.options.layerStyle);
    const circlePaint = layerStyle.circle?.paint || {};
    const linePaint = layerStyle.line?.paint || {};
    const fillPaint = layerStyle.fill?.paint || {};
    const strokePaint = (layerStyle.strokeLine || layerStyle.stokeLine)?.paint || {};

    const toColor = (css: unknown, opacity: unknown, opacityFallback: number) => {
      const base = SuperMap3D.Color.fromCssColorString(asCssColor(css, DEFAULT_HIGHLIGHT_COLOR));
      return base.withAlpha(asNumber(opacity, opacityFallback));
    };

    return {
      circle: {
        color: toColor(circlePaint['circle-color'], circlePaint['circle-opacity'], 0.6),
        // mapbox circle-radius is radius; Cesium point.pixelSize is roughly diameter
        pixelSize: Math.max(asNumber(circlePaint['circle-radius'], 8) * 2, 4),
        outlineColor: toColor(
          circlePaint['circle-stroke-color'],
          circlePaint['circle-stroke-opacity'],
          1
        ),
        outlineWidth: asNumber(circlePaint['circle-stroke-width'], 2)
      },
      line: {
        color: toColor(linePaint['line-color'], linePaint['line-opacity'], 1),
        width: asNumber(linePaint['line-width'], 3)
      },
      fill: {
        color: toColor(fillPaint['fill-color'], fillPaint['fill-opacity'], 0.6),
        // 面边线只用 strokeLine，不读 fill-outline-color
        outlineColor: toColor(strokePaint['line-color'], strokePaint['line-opacity'], 1),
        outlineWidth: asNumber(strokePaint['line-width'], 3)
      }
    };
  }

  private _addHighlightEntitiesForGeometry(
    dataSource: any,
    geometry: GeoJSON.Geometry,
    style: SceneResolvedHighlightStyle,
    idPrefix: string
  ) {
    const type = geometry?.type;
    if (!type) {
      return;
    }
    if (type === 'GeometryCollection') {
      ((geometry as GeoJSON.GeometryCollection).geometries || []).forEach((child, index) => {
        this._addHighlightEntitiesForGeometry(dataSource, child, style, `${idPrefix}:${index}`);
      });
      return;
    }
    if (type === 'Point' || type === 'MultiPoint') {
      const points =
        type === 'Point'
          ? [(geometry as GeoJSON.Point).coordinates]
          : (geometry as GeoJSON.MultiPoint).coordinates || [];
      points.forEach((coord, index) => {
        this._addPointHighlight(dataSource, coord, style.circle, `${idPrefix}:pt:${index}`);
      });
      return;
    }
    if (type === 'LineString' || type === 'MultiLineString') {
      const lines =
        type === 'LineString'
          ? [(geometry as GeoJSON.LineString).coordinates]
          : (geometry as GeoJSON.MultiLineString).coordinates || [];
      lines.forEach((line, index) => {
        this._addPolylineHighlight(dataSource, line, style.line, `${idPrefix}:ln:${index}`);
      });
      return;
    }
    if (type === 'Polygon' || type === 'MultiPolygon') {
      const polygons =
        type === 'Polygon'
          ? [(geometry as GeoJSON.Polygon).coordinates]
          : (geometry as GeoJSON.MultiPolygon).coordinates || [];
      polygons.forEach((polygon, index) => {
        this._addPolygonHighlight(dataSource, polygon, style.fill, `${idPrefix}:pg:${index}`);
      });
    }
  }

  private _coordsToCartesian3Array(coords: number[][]) {
    const SuperMap3D = window.SuperMap3D;
    const degrees: number[] = [];
    (coords || []).forEach(coord => {
      if (!coord || coord.length < 2 || !Number.isFinite(coord[0]) || !Number.isFinite(coord[1])) {
        return;
      }
      degrees.push(coord[0], coord[1], Number.isFinite(coord[2]) ? coord[2] : 0);
    });
    if (degrees.length < 6) {
      return null;
    }
    return SuperMap3D.Cartesian3.fromDegreesArrayHeights(degrees);
  }

  private _addPointHighlight(
    dataSource: any,
    coord: number[],
    paint: SceneResolvedHighlightStyle['circle'],
    id: string
  ) {
    const SuperMap3D = window.SuperMap3D;
    if (!coord || coord.length < 2 || !Number.isFinite(coord[0]) || !Number.isFinite(coord[1])) {
      return;
    }
    dataSource.entities.add({
      id,
      position: SuperMap3D.Cartesian3.fromDegrees(
        coord[0],
        coord[1],
        Number.isFinite(coord[2]) ? coord[2] : 0
      ),
      point: {
        color: paint.color,
        pixelSize: paint.pixelSize,
        outlineColor: paint.outlineColor,
        outlineWidth: paint.outlineWidth,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: SuperMap3D.HeightReference?.CLAMP_TO_GROUND
      }
    });
  }

  private _addPolylineHighlight(
    dataSource: any,
    line: number[][],
    paint: SceneResolvedHighlightStyle['line'],
    id: string
  ) {
    const SuperMap3D = window.SuperMap3D;
    const positions = this._coordsToCartesian3Array(line);
    if (!positions) {
      return;
    }
    const classificationType = SuperMap3D.ClassificationType?.BOTH;
    dataSource.entities.add({
      id,
      polyline: {
        positions,
        width: paint.width,
        material: paint.color,
        clampToGround: true,
        ...(classificationType != null ? { classificationType } : {}),
        ...(SuperMap3D.ArcType ? { arcType: SuperMap3D.ArcType.GEODESIC } : {})
      }
    });
  }

  private _addPolygonHighlight(
    dataSource: any,
    polygonCoords: number[][][],
    paint: SceneResolvedHighlightStyle['fill'],
    id: string
  ) {
    const SuperMap3D = window.SuperMap3D;
    const rings = (polygonCoords || [])
      .map(ring => this._coordsToCartesian3Array(ring))
      .filter(Boolean);
    if (!rings.length) {
      return;
    }
    const hierarchy: any = {
      positions: rings[0]
    };
    if (rings.length > 1) {
      hierarchy.holes = rings.slice(1).map(positions => ({ positions }));
    }
    const classificationType = SuperMap3D.ClassificationType?.BOTH;
    dataSource.entities.add({
      id,
      polygon: {
        hierarchy,
        material: paint.color,
        outline: false,
        perPositionHeight: false,
        clampToGround: true,
        ...(classificationType != null ? { classificationType } : {})
      },
      // Outline from strokeLine (line-color / line-width)
      polyline: {
        positions: rings[0],
        width: paint.outlineWidth,
        material: paint.outlineColor,
        clampToGround: true,
        ...(classificationType != null ? { classificationType } : {})
      }
    });
  }

  /**
   * Bind popup to a world position and project + layout every frame.
   * @param screenHint Optional click screen position for first-frame accuracy (rest/map).
   */
  setPopupAnchor(
    lng: number,
    lat: number,
    height = 0,
    screenHint?: { x: number; y: number } | null
  ) {
    this.popupAnchor = { lng, lat, height: height || 0 };
    this.ensureViewerSized();
    this.startPopupPositionTracking();
    const hint =
      screenHint ||
      (this.lastClickAnchor &&
      this.lastClickAnchor.lng === lng &&
      this.lastClickAnchor.lat === lat
        ? this.lastClickAnchor.screenPosition
        : null);
    if (hint && Number.isFinite(hint.x) && Number.isFinite(hint.y)) {
      // Use exact click pixel first so tip matches the cursor before postRender reprojects
      this.lastScreenPosition = { x: hint.x, y: hint.y };
      this.updatePopupLayout();
      return;
    }
    this.updatePopupScreenPosition();
  }

  clearPopupAnchor() {
    this.stopPopupPositionTracking();
    this.popupAnchor = null;
    this.lastScreenPosition = null;
    this.clearPopupLayout();
  }

  /** Viewer may be created before flex layout settles; resize so transforms match CSS size. */
  private ensureViewerSized() {
    const canvas = this.scene?.canvas as HTMLCanvasElement | undefined;
    if (!canvas || !this.viewer?.resize) {
      return;
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) {
      return;
    }
    const scale = this.viewer.resolutionScale || 1;
    const expectedW = Math.max(1, Math.floor(width * scale));
    const expectedH = Math.max(1, Math.floor(height * scale));
    if (canvas.width !== expectedW || canvas.height !== expectedH) {
      this.viewer.resize();
    }
  }

  /** Bind popup root element so ViewModel can measure size for placement */
  bindPopupRootEl(el: HTMLElement | null | undefined) {
    this.popupRootEl = el || null;
    if (this.popupVisible) {
      this.updatePopupLayout();
    }
  }

  /** Toggle popup visibility; layout is computed only while visible */
  setPopupVisible(visible: boolean) {
    this.popupVisible = !!visible;
    if (!this.popupVisible) {
      this.clearPopupLayout();
      return;
    }
    if (this.popupAnchor) {
      this.startPopupPositionTracking();
      return;
    }
    this.updatePopupLayout();
  }

  startPopupPositionTracking() {
    if (!this.popupAnchor) {
      return;
    }
    if (this.scene?.postRender && !this.trackingPopupPosition) {
      this.scene.postRender.addEventListener(this.onPostRender);
      this.trackingPopupPosition = true;
    }
    const camera = this.viewer?.camera;
    if (camera?.changed && !this.trackingCameraPosition) {
      camera.changed.addEventListener(this.onCameraChanged);
      this.trackingCameraPosition = true;
    }
    this.updatePopupScreenPosition();
  }

  stopPopupPositionTracking() {
    if (this.scene?.postRender && this.trackingPopupPosition) {
      try {
        this.scene.postRender.removeEventListener(this.onPostRender);
      } catch {
        // ignore
      }
      this.trackingPopupPosition = false;
    }
    const camera = this.viewer?.camera;
    if (camera?.changed && this.trackingCameraPosition) {
      try {
        camera.changed.removeEventListener(this.onCameraChanged);
      } catch {
        // ignore
      }
      this.trackingCameraPosition = false;
    }
  }

  private worldToWindowCoordinates(lng: number, lat: number, height: number) {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D || !this.scene) {
      return null;
    }
    const cartesian = SuperMap3D.Cartesian3.fromDegrees(lng, lat, height || 0);
    const transforms = SuperMap3D.SceneTransforms;
    if (!transforms) {
      return null;
    }
    // 与 iEarth CustomBubble 一致：优先 wgs84ToWindowCoordinates + Cartesian2 result
    if (typeof transforms.wgs84ToWindowCoordinates === 'function') {
      const windowPos = new SuperMap3D.Cartesian2();
      const ok = transforms.wgs84ToWindowCoordinates(this.scene, cartesian, windowPos);
      if (ok && Number.isFinite(windowPos.x) && Number.isFinite(windowPos.y)) {
        return { x: windowPos.x, y: windowPos.y };
      }
    }
    if (typeof transforms.worldToWindowCoordinates === 'function') {
      const windowPos = transforms.worldToWindowCoordinates(this.scene, cartesian);
      if (windowPos && Number.isFinite(windowPos.x) && Number.isFinite(windowPos.y)) {
        return { x: windowPos.x, y: windowPos.y };
      }
    }
    return null;
  }

  private updatePopupScreenPosition() {
    if (!this.popupAnchor) {
      return;
    }
    this.ensureViewerSized();
    const windowPos = this.worldToWindowCoordinates(
      this.popupAnchor.lng,
      this.popupAnchor.lat,
      this.popupAnchor.height
    );
    if (!windowPos || !Number.isFinite(windowPos.x) || !Number.isFinite(windowPos.y)) {
      return;
    }
    this.lastScreenPosition = { x: windowPos.x, y: windowPos.y };
    this.updatePopupLayout();
  }

  private getPopupContainer(): HTMLElement | null {
    const canvas = this.scene?.canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      return null;
    }
    // Prefer web-scene root so absolute popup is clipped by that box
    const container =
      (canvas.closest('.sm-component-web-scene') as HTMLElement | null) ||
      (canvas.closest('.supermap3d-viewer') as HTMLElement | null) ||
      (canvas.parentElement as HTMLElement | null) ||
      canvas;
    this.ensurePopupContainerClip(container);
    return container;
  }

  /**
   * Absolute popup must be clipped by sm-component-web-scene.
   * Ensure containing block + overflow even if webscene.scss is not loaded.
   */
  private ensurePopupContainerClip(container: HTMLElement | null) {
    if (!container || container === this.scene?.canvas) {
      return;
    }
    const style = container.style;
    if (!style.position || style.position === 'static') {
      style.position = 'relative';
    }
    if (style.overflow !== 'hidden' && style.overflow !== 'clip') {
      style.overflow = 'hidden';
    }
  }

  private getCanvasOffset() {
    const canvas = this.scene?.canvas as HTMLCanvasElement | undefined;
    if (!canvas) {
      return { left: 0, top: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
  }

  private getViewerBounds(): DOMRect | null {
    return this.getPopupContainer()?.getBoundingClientRect() || null;
  }

  private clampHorizontal(left: number, width: number, bounds: DOMRect) {
    const minLeft = bounds.left + POPUP_VIEW_PADDING;
    const maxLeft = bounds.right - width - POPUP_VIEW_PADDING;
    return Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));
  }

  private clampVertical(top: number, height: number, bounds: DOMRect) {
    const minTop = bounds.top + POPUP_VIEW_PADDING;
    const maxTop = bounds.bottom - height - POPUP_VIEW_PADDING;
    return Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));
  }

  private overflowScore(
    left: number,
    top: number,
    width: number,
    height: number,
    bounds: DOMRect
  ) {
    const overflowLeft = Math.max(0, bounds.left + POPUP_VIEW_PADDING - left);
    const overflowRight = Math.max(0, left + width - (bounds.right - POPUP_VIEW_PADDING));
    const overflowTop = Math.max(0, bounds.top + POPUP_VIEW_PADDING - top);
    const overflowBottom = Math.max(0, top + height - (bounds.bottom - POPUP_VIEW_PADDING));
    return overflowLeft + overflowRight + overflowTop + overflowBottom;
  }

  private placementToRootClass(placement: string) {
    switch (placement) {
      case 'bottom-right':
        return 'popup-placement-right';
      case 'top-left':
        return 'popup-placement-top';
      case 'top-right':
        return 'popup-placement-top popup-placement-right';
      case 'right':
        return 'popup-placement-side-right';
      case 'left':
        return 'popup-placement-side-left';
      default:
        return '';
    }
  }

  private buildRootStyle(layout: { left: number; top: number } | null): Record<string, any> {
    if (!layout) {
      return {};
    }
    // absolute + web-scene overflow:hidden → tall popup is clipped by scene container
    const style: Record<string, any> = {
      position: 'absolute',
      left: `${layout.left}px`,
      top: `${layout.top}px`,
      zIndex: 1000,
      // maxHeight 只做上限；高度随内容，避免短内容被撑满限高
      height: 'fit-content'
    };
    // top-*：top 表示弹窗底边（贴 tip），用 translateY(-100%) 上推，避免 fit-content
    // 实测高度与定位高度不一致时 tip 悬空（下边界点选尤其明显）
    if (this.lastPopupPlacement.startsWith('top')) {
      style.transform = 'translateY(-100%)';
    }
    if (this.lastPopupMaxHeight && this.lastPopupMaxHeight > 0) {
      style.maxHeight = `${this.lastPopupMaxHeight}px`;
      // Keep overflow visible so popup-tip is not clipped; body scrolls under .popup-height-constrained
      style.display = 'flex';
      style.flexDirection = 'column';
    }
    return style;
  }

  private clearPopupLayout() {
    this.lastPopupLayout = null;
    this.lastPopupPlacement = DEFAULT_POPUP_PLACEMENT;
    this.lastPopupMaxHeight = null;
    this.firePopupPositionChanged();
  }

  private firePopupPositionChanged() {
    this.fire('popuppositionchanged', {
      screenPosition: this.lastScreenPosition || undefined,
      lngLat: this.popupAnchor
        ? ([this.popupAnchor.lng, this.popupAnchor.lat] as [number, number])
        : undefined,
      height: this.popupAnchor?.height,
      layout: this.lastPopupLayout,
      placement: this.lastPopupPlacement,
      rootStyle: this.buildRootStyle(this.lastPopupLayout),
      rootClass: [
        this.placementToRootClass(this.lastPopupPlacement),
        this.lastPopupMaxHeight && this.lastPopupMaxHeight > 0 ? 'popup-height-constrained' : ''
      ]
        .filter(Boolean)
        .join(' ')
    });
  }

  /**
   * After clamp, does the popup body cover the feature anchor?
   * Used to avoid bottom-edge clicks where "below" placement is pushed up over the point.
   */
  private candidateCoversAnchor(
    left: number,
    top: number,
    width: number,
    height: number,
    anchorX: number,
    anchorY: number
  ) {
    const pad = 2;
    return (
      left - pad <= anchorX &&
      left + width + pad >= anchorX &&
      top - pad <= anchorY &&
      top + height + pad >= anchorY
    );
  }

  private scorePopupCandidate(
    item: { left: number; top: number },
    width: number,
    height: number,
    bounds: DOMRect,
    anchorX: number,
    anchorY: number
  ) {
    const clampedLeft = this.clampHorizontal(item.left, width, bounds);
    const clampedTop = this.clampVertical(item.top, height, bounds);
    const overflow = this.overflowScore(item.left, item.top, width, height, bounds);
    const covers = this.candidateCoversAnchor(
      clampedLeft,
      clampedTop,
      width,
      height,
      anchorX,
      anchorY
    );
    // Prefer not covering the clicked feature (esp. near bottom edge)
    return overflow + (covers ? 1e6 : 0);
  }

  /**
   * Compute absolute popup position + tip placement inside viewer bounds.
   * Prefer the side with enough space; near bottom edge open upward so popup won't cover the feature.
   * Coordinates are relative to the popup container so overflow is clipped.
   */
  private updatePopupLayout() {
    if (!this.lastScreenPosition || !this.popupVisible) {
      return;
    }
    const canvasOffset = this.getCanvasOffset();
    const width = this.popupRootEl?.offsetWidth || FALLBACK_POPUP_WIDTH;
    const height = this.popupRootEl?.offsetHeight || FALLBACK_POPUP_HEIGHT;
    const bounds = this.getViewerBounds();
    // Viewport (client) coords for placement scoring
    const anchorX = canvasOffset.left + this.lastScreenPosition.x;
    const anchorY = canvasOffset.top + this.lastScreenPosition.y;
    const gap = POPUP_TIP_SIZE + POPUP_ANCHOR_OFFSET;

    const below = [
      { name: 'bottom-left', left: anchorX - POPUP_TIP_INSET, top: anchorY + gap },
      { name: 'bottom-right', left: anchorX - width + POPUP_TIP_INSET, top: anchorY + gap }
    ];
    const above = [
      { name: 'top-left', left: anchorX - POPUP_TIP_INSET, top: anchorY - gap - height },
      { name: 'top-right', left: anchorX - width + POPUP_TIP_INSET, top: anchorY - gap - height }
    ];
    const sides = [
      { name: 'right', left: anchorX + gap, top: anchorY - height / 2 },
      { name: 'left', left: anchorX - gap - width, top: anchorY - height / 2 }
    ];

    let candidates: Array<{ name: string; left: number; top: number }>;
    if (!bounds) {
      candidates = [...below, ...sides, ...above];
    } else {
      const spaceBelow = bounds.bottom - anchorY - gap;
      const spaceAbove = anchorY - bounds.top - gap;
      // Not enough room below (bottom edge) → prefer upward / side so feature stays visible
      if (spaceBelow < height && spaceAbove >= height) {
        candidates = [...above, ...sides, ...below];
      } else if (spaceBelow < height && spaceAbove >= spaceBelow) {
        candidates = [...above, ...sides, ...below];
      } else if (spaceBelow < height) {
        candidates = [...sides, ...above, ...below];
      } else {
        candidates = [...below, ...sides, ...above];
      }
    }

    let chosen = candidates[0];
    let layoutViewport = { left: chosen.left, top: chosen.top };
    let maxHeight: number | null = null;
    if (bounds) {
      const fitting = candidates.find(
        item => this.overflowScore(item.left, item.top, width, height, bounds) === 0
      );
      if (fitting) {
        chosen = fitting;
      } else {
        chosen = candidates.reduce((best, item) => {
          const score = this.scorePopupCandidate(item, width, height, bounds, anchorX, anchorY);
          const bestScore = this.scorePopupCandidate(best, width, height, bounds, anchorX, anchorY);
          return score < bestScore ? item : best;
        }, candidates[0]);
      }

      // Keep popup clear of the feature:
      // - top placement: pin bottom edge above anchor (top = bottom edge + translateY(-100%))
      // - bottom placement: pin top edge below anchor
      // Avoid clampVertical pushing the body over the click point.
      const minTop = bounds.top + POPUP_VIEW_PADDING;
      const maxBottom = bounds.bottom - POPUP_VIEW_PADDING;
      if (chosen.name.startsWith('top')) {
        const popupBottom = anchorY - gap;
        maxHeight = Math.max(80, Math.floor(popupBottom - minTop));
        layoutViewport = {
          left: this.clampHorizontal(chosen.left, width, bounds),
          // bottom edge; buildRootStyle applies translateY(-100%)
          top: popupBottom
        };
      } else if (chosen.name.startsWith('bottom')) {
        const popupTop = anchorY + gap;
        maxHeight = Math.max(80, Math.floor(maxBottom - popupTop));
        layoutViewport = {
          left: this.clampHorizontal(chosen.left, width, bounds),
          top: popupTop
        };
      } else {
        // side: keep vertically centered on anchor but clamp inside container
        maxHeight = Math.max(80, Math.floor(maxBottom - minTop));
        const usedHeight = Math.min(height, maxHeight);
        let top = anchorY - usedHeight / 2;
        top = Math.min(Math.max(top, minTop), maxBottom - usedHeight);
        layoutViewport = {
          left: this.clampHorizontal(chosen.left, width, bounds),
          top
        };
      }
    }

    this.lastPopupPlacement = chosen.name;
    this.lastPopupMaxHeight = maxHeight;
    // Convert viewport coords → container-relative for position:absolute
    this.lastPopupLayout = bounds
      ? {
          left: layoutViewport.left - bounds.left,
          top: layoutViewport.top - bounds.top
        }
      : layoutViewport;
    this.firePopupPositionChanged();
  }

  clearHighlight() {
    if (this.highlightDataSource && this.viewer) {
      this.viewer.dataSources.remove(this.highlightDataSource, true);
      this.highlightDataSource = undefined;
    }
    this.highlightedFeatureKeys.clear();
  }

  clear() {
    this.highlightSeq++;
    this.selectedFeatures = [];
    this.multiSelectActive = false;
    this.popupVisible = false;
    this.lastClickAnchor = null;
    this.clearPopupAnchor();
    this.clearHighlight();
  }

  private destroyClickHandler() {
    if (this.handler) {
      try {
        this.handler.destroy();
      } catch {
        // ignore
      }
      this.handler = undefined;
    }
    if (this.onModifierKeyDown) {
      window.removeEventListener('keydown', this.onModifierKeyDown, true);
    }
    if (this.onModifierKeyUp) {
      window.removeEventListener('keyup', this.onModifierKeyUp, true);
    }
    this.modifierKeyDown = false;
  }

  destroyHandler() {
    this.destroyClickHandler();
  }

  /**
   * @function SceneHighlightViewModel.prototype.removed
   * @desc Cleanup when scene is removed.
   */
  removed() {
    this.clear();
    this.destroyHandler();
    this.viewer = null;
    this.scene = null;
    this.webscene = null;
  }
}

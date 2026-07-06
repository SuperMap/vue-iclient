import { Events } from 'vue-iclient-core/types/event/Events';

/**
 * 底图图层类型（影像、天地图）
 */
export type BaseMapLayerType = 'SuperMapImagery' | 'TiandituImagery';

/**
 * 地形服务类型
 */
export type TerrainType = 'TiandituTerrain' | 'SuperMapTerrain';

/**
 * 三维地名标注类型
 */
export type AnnotationType = 'TiandituAnnotation';

/**
 * 天地图样式类型
 */
export type TiandituMapStyle = 'CIA_C' | 'CIA_W' | 'CTA_C' | 'CTA_W'
  | 'CVA_C' | 'CVA_W' | 'EIA_C' | 'EIA_W'
  | 'EVA_C' | 'EVA_W' | 'IBO_C' | 'IBO_W'
  | 'IMG_C' | 'IMG_W' | 'TER_C' | 'TER_W'
  | 'VEC_C' | 'VEC_W';

/**
 * 天地图配置
 */
export interface TiandituLayerConfig {
  /** 类型 */
  type: 'TiandituImagery';
  /** 天地图样式（默认 IMG_C） */
  mapStyle?: TiandituMapStyle;
  /** 是否显示注记 */
  labelVisible?: boolean;
  /** 天地图密钥 */
  token?: string;
}

/**
 * 天地图地形配置
 */
export interface TiandituTerrainLayerConfig {
  /** 类型 */
  type: 'TiandituTerrain';
  /** 天地图地形服务地址 */
  url?: string;
  /** 天地图地形服务的密钥 */
  token?: string;
  /** 最小数据级别 */
  minimumLevel?: number;
  /** 最大数据级别 */
  maximumLevel?: number;
  /** 天地图的多子域。传入参数为Array时，支持多个子域加载。传入参数为String时仅支持单个子域加载。 */
  subdomains?: string[] | string;
  /** 服务描述信息 */
  credit?: string;
}

/**
 * 天地图三维地名标注配置
 */
export interface TiandituAnnotationConfig {
  /** 类型 */
  type: 'TiandituAnnotation';
  /** 天地图三维注记服务地址 */
  url?: string;
  /** 天地图 token */
  token?: string;
  /** 服务代理 */
  proxy?: object;
}

/**
 * 影像图层配置
 */
export interface ImageLayerConfig {
  /** 类型 */
  type: 'SuperMapImagery';
  /** 影像服务地址 */
  url?: string;
  /** 影像图层名称 */
  name?: string;
  /** 最小级别 */
  minimumLevel?: number;
  /** 最大级别 */
  maximumLevel?: number;
  /** 是否透明 */
  transparent?: boolean;
  /** 影像服务描述信息 */
  credit?: string;
  /** 影像图片格式 */
  tileFormat?: string;
  /** 三维影像瓦片密钥 */
  cacheKey?: string;
  /** 影像图层ID */
  layersID?: string;
  /** 投影坐标系 */
  prjCoordSys?: { epsgCode: 3857 | 4326 };
  /** 剖分方式 */
  useGSG?: boolean;
  /** 瓦片宽度 */
  tileWidth?: number;
  /** 瓦片高度 */
  tileHeight?: number;
  /** 海图设置 */
  chartSetting?: object;
  /** 透明背景色 */
  transparentBackColor?: string;
  /** 透明背景色容差 */
  transparentBackColorTolerance?: number;
}

/**
 * 地形配置
 */
export interface TerrainLayerConfig {
  /** 类型 */
  type: 'SuperMapTerrain';
  /** 地形服务的 URL */
  url?: string;
  /** 服务代理 */
  proxy?: object;
  /** 是否请求法线（用于光照效果），默认不请求 */
  requestVertexNormals?: boolean;
  /** 是否请求水面标志位（用于水面特效），默认不请求 */
  requestWaterMask?: boolean;
  /** 椭球体，默认为 WGS84 */
  ellipsoid?: object;
  /** 服务描述信息 */
  credit?: string;
  /** 是否为 iServer 发布的 TIN 地形服务，stk 地形设置为 false */
  isSct?: boolean;
  /** 是否剔除无效地形区域，默认为 true（全球显示） */
  isShowGlobe?: boolean;
  /** 是否开启设置地形显隐的功能，默认为 false */
  invisibility?: boolean;
  /** 批量请求编码方式 */
  packingRequest?: object;
}

/**
 * 底图层配置（仅包含 BaseMapLayerType）
 */
export type BaseMapLayer = ImageLayerConfig | TiandituLayerConfig;

/**
 * 地形服务配置（仅包含 TerrainType）
 */
export type Terrain = TiandituTerrainLayerConfig | TerrainLayerConfig;

/**
 * 三维地名标注配置（仅包含 AnnotationType）
 */
export type Annotation = TiandituAnnotationConfig;

/**
 * 底图切换器配置
 */
export interface MapSwitchOptions {
  /** 底图列表 */
  baseMapLayers?: BaseMapLayer[];
  /** 地形服务配置 */
  terrain?: Terrain | null;
  /** 三维地名标注配置 */
  annotation?: Annotation | null;
  /** 天地图全局密钥，各图层未配置 token 时作为默认值 */
  token?: string;
  /** 默认底图索引 */
  defaultIndex?: number;
  /** 主题配置 */
  theme?: {
    bgColor?: string;
    alpha?: number;
    invert?: boolean;
  };
  /** 其他配置 */
  [key: string]: any;
}

/**
 * 底图切换事件
 */
export interface MapSwitchChangeEvent {
  /** 切换后的底图 */
  currentMap: BaseMapLayer | null;
  /** 切换前的底图 */
  previousMap: BaseMapLayer | null;
  /** 当前底图索引 */
  currentIndex: number;
}

/**
 * 底图切换器
 */
export class MapSwitch extends Events {
  private options: MapSwitchOptions;
  private _currentIndex: number | undefined;
  private _baseMapLayers: BaseMapLayer[] = [];
  private _terrain: Terrain | null = null;
  private _annotation: Annotation | null = null;
  private _imageryLayers: any[] = [];
  private _annotationProvider: any | null = null;
  private originalBaseLayer: any | null = null;
  private originalTerrainProvider: any | null = null;
  viewer: any;

  triggerEvent: (name: 'change', event: MapSwitchChangeEvent) => any;
  on: (data: { change?: (event: MapSwitchChangeEvent) => any; scope?: any }) => void;
  un: (data: { change?: (event: MapSwitchChangeEvent) => any; scope?: any }) => void;

  constructor(viewer: any, options: MapSwitchOptions = {}) {
    super();
    if (!viewer || !viewer.scene) {
      throw new Error('无效的 viewer 实例，请确保已创建 SuperMap3D.Viewer');
    }
    if (!window.SuperMap3D) {
      throw new Error('SuperMap3D 库未加载，请先引入 SuperMap3D.js');
    }
    this.viewer = viewer;
    this.options = options;
    this.eventTypes = ['change'];
    this._currentIndex = options.defaultIndex;
    this._baseMapLayers = options.baseMapLayers ?? [];
    this._terrain = options.terrain ?? null;
    this._annotation = options.annotation ?? null;
    this.originalBaseLayer = viewer.imageryLayers?.get(0);
    this.originalTerrainProvider = viewer.terrainProvider ?? null;
  }

  /** 当前底图索引 */
  get currentIndex(): number | undefined {
    return this._currentIndex;
  }

  /** 当前底图信息 */
  get currentMap(): BaseMapLayer | null {
    return this._currentIndex !== undefined
      ? (this._baseMapLayers[this._currentIndex] ?? null)
      : null;
  }

  /** 底图列表 */
  get baseMapLayers(): BaseMapLayer[] {
    return this._baseMapLayers;
  }

  /** 当前地形服务配置 */
  get terrain(): Terrain | null {
    return this._terrain;
  }

  /** 当前三维地名标注配置 */
  get annotation(): Annotation | null {
    return this._annotation;
  }

  /** 更新底图列表 */
  setBaseMapLayers(maps: BaseMapLayer[]): void {
    this._baseMapLayers = maps;
  }

  /** 设置地形服务，传入 null 则恢复原始地形 */
  setTerrain(terrain: Terrain | null): void {
    this._terrain = terrain;
    if (terrain) {
      this._applyTerrain(terrain);
    } else {
      this._removeTerrain();
    }
  }

  /** 设置三维地名标注，传入 null 则移除标注 */
  setAnnotation(annotation: Annotation | null): void {
    this._annotation = annotation;
    if (annotation) {
      this._applyAnnotation(annotation);
    } else {
      this._removeAnnotation();
    }
  }

  /** 设置全局天地图 token */
  setToken(token?: string): void {
    this.options.token = token;
    if (this._currentIndex !== undefined) {
      const currentMap = this._baseMapLayers[this._currentIndex];
      if (currentMap?.type === 'TiandituImagery') {
        this._applyMap(currentMap);
      }
    }
    if (this._terrain?.type === 'TiandituTerrain') {
      this._applyTerrain(this._terrain);
    }
    if (this._annotation) {
      this._applyAnnotation(this._annotation);
    }
  }

  /** 更新内部持有的 Viewer 实例 */
  setViewer(viewer: any): void {
    this.viewer = viewer;
  }

  /** 清理资源 */
  clear(): void {
    this.restoreOriginalBaseLayer();
    this._currentIndex = undefined;
    this._removeTerrain();
    this._removeAnnotation();
    this._baseMapLayers = [];
    this._terrain = null;
    this._annotation = null;
  }

  /** 切换到指定索引的底图 */
  switchTo(index: number): void {
    if (index < 0 || index >= this._baseMapLayers.length) {
      console.warn(`Invalid map index: ${index}`);
      return;
    }
    if (this._currentIndex === index) {
      return;
    }
    const previousMap = this.currentMap;
    this._currentIndex = index;
    this._applyMap(this._baseMapLayers[index]);
    this.triggerEvent('change', {
      currentMap: this._baseMapLayers[index],
      previousMap,
      currentIndex: index
    });
  }

  /** 还原初始底图 */
  restoreOriginalBaseLayer(): void {
    const viewer = this.viewer;
    if (!viewer?.imageryLayers || !this.originalBaseLayer) return;

    try {
      this._removeSwitchedBaseLayers();
      if (!viewer.imageryLayers.contains(this.originalBaseLayer)) {
        viewer.imageryLayers.add(this.originalBaseLayer, 0);
      }
    } catch (error) {
      console.error('Failed to restore original base layer:', error);
    }
  }

  /** 移除切换后的底图图层 */
  private _removeSwitchedBaseLayers(): void {
    const viewer = this.viewer;
    if (!viewer?.imageryLayers) return;

    try {
      this._imageryLayers.forEach(layer => {
        if (viewer.imageryLayers.contains(layer)) {
          viewer.imageryLayers.remove(layer, true);
        }
      });
      this._imageryLayers = [];
    } catch (error) {
      console.error('Failed to remove switched base maps:', error);
    }
  }

  /** 隐藏初始底图（保留引用以便还原） */
  private _hideOriginalBaseLayer(): void {
    const viewer = this.viewer;
    if (!viewer?.imageryLayers || !this.originalBaseLayer) return;

    try {
      if (viewer.imageryLayers.contains(this.originalBaseLayer)) {
        viewer.imageryLayers.remove(this.originalBaseLayer, false);
      }
    } catch (error) {
      console.error('Failed to hide original base layer:', error);
    }
  }

  /** 应用底图到场景（仅处理 BaseMapLayerType） */
  private _applyMap(mapConfig: BaseMapLayer): void {
    const viewer = this.viewer;
    if (!viewer) return;

    try {
      this._removeSwitchedBaseLayers();
      this._hideOriginalBaseLayer();

      if (mapConfig.type === 'TiandituImagery') {
        this._addTiandituLayer(viewer, mapConfig);
      } else {
        this._addImageLayer(viewer, mapConfig);
      }
    } catch (error) {
      console.error('Failed to switch base map:', error);
    }
  }

  /** 应用地形服务到场景（仅处理 TerrainType） */
  private _applyTerrain(terrainConfig: Terrain): void {
    const viewer = this.viewer;
    if (!viewer) return;

    try {
      if (terrainConfig.type === 'TiandituTerrain') {
        this._addTiandituTerrainLayer(viewer, terrainConfig);
      } else {
        this._addTerrainLayer(viewer, terrainConfig);
      }
    } catch (error) {
      console.error('Failed to apply terrain service:', error);
    }
  }

  /** 移除地形服务，恢复原始地形 */
  private _removeTerrain(): void {
    const viewer = this.viewer;
    if (!viewer || !this.originalTerrainProvider) return;

    try {
      viewer.terrainProvider = this.originalTerrainProvider;
    } catch (error) {
      console.error('Failed to remove terrain service:', error);
    }
  }

  /** 应用三维地名标注到场景 */
  private _applyAnnotation(annotationConfig: Annotation): void {
    const viewer = this.viewer;
    if (!viewer) return;

    try {
      this._removeAnnotation();
      const { type, ...annotationOptions }: any = annotationConfig;
      if (annotationOptions.url) {
        annotationOptions.url = this._normalizeUrl(annotationOptions.url);
      }
      const token = this._resolveToken(annotationOptions.token);
      if (token) {
        annotationOptions.token = token;
      }
      this._annotationProvider = new window.SuperMap3D.TiandituAnnotationProvider({
        viewer,
        ...annotationOptions
      });
    } catch (error) {
      console.error('Failed to apply annotation:', error);
    }
  }

  /** 移除三维地名标注 */
  private _removeAnnotation(): void {
    if (!this._annotationProvider) return;

    try {
      if (typeof this._annotationProvider.destroy === 'function') {
        this._annotationProvider.destroy();
      }
    } catch (error) {
      console.error('Failed to remove annotation:', error);
    } finally {
      this._annotationProvider = null;
    }
  }

  /** 添加影像图层 */
  private _addImageLayer(viewer: any, config: ImageLayerConfig): void {
    if (!config.url) return;
    const imageryProviderOptions: any = config;
    // 规范化 URL，避免被浏览器拼上本地主机地址
    imageryProviderOptions.url = this._normalizeUrl(imageryProviderOptions.url);
    // TODO可选参数
    if (config.transparentBackColor)
      imageryProviderOptions.transparentBackColor = config.transparentBackColor;
    if (config.transparentBackColorTolerance !== undefined) {
      imageryProviderOptions.transparentBackColorTolerance = config.transparentBackColorTolerance;
    }

    const imageryProvider = new window.SuperMap3D.SuperMapImageryProvider(imageryProviderOptions);
    const layer = viewer.imageryLayers.addImageryProvider(imageryProvider);
    this._imageryLayers.push(layer);
  }

  /** 添加天地图图层 */
  private _addTiandituLayer(viewer: any, config: TiandituLayerConfig): void {
    const labelVisible = config.labelVisible ?? true;
    // 获取地图样式
    const mapStyleKey = config.mapStyle ?? 'IMG_C';
    const baseMapStyle = window.SuperMap3D.TiandituMapsStyle[mapStyleKey];
    const token = this._resolveToken(config.token);

    // 添加天地图底图
    const baseImageryProvider = new window.SuperMap3D.TiandituImageryProvider({
      ...config,
      mapStyle: baseMapStyle,
      ...(token ? { token } : {})
    });
    const baseLayer = viewer.imageryLayers.addImageryProvider(baseImageryProvider);
    this._imageryLayers.push(baseLayer);

    // 添加天地图注记层（矢量/影像样式对应不同的注记）
    if (labelVisible) {
      let labelMapStyleKey = 'CIA_C';
      if (mapStyleKey.startsWith('VEC')) {
        labelMapStyleKey = 'CVA_C'; // 矢量地图对应矢量注记
      } else if (mapStyleKey.startsWith('IMG')) {
        labelMapStyleKey = 'CIA_C'; // 影像地图对应影像注记
      } else if (mapStyleKey.startsWith('TER')) {
        labelMapStyleKey = 'CTA_C'; // 地形对应地形注记
      }
      const labelMapStyle = window.SuperMap3D.TiandituMapsStyle[labelMapStyleKey];
      const labelImageryProvider = new window.SuperMap3D.TiandituImageryProvider({
        ...config,
        mapStyle: labelMapStyle,
        ...(token ? { token } : {})
      });
      const labelLayer = viewer.imageryLayers.addImageryProvider(labelImageryProvider);
      this._imageryLayers.push(labelLayer);
    }
  }

  /** 添加地形图层 */
  private _addTerrainLayer(viewer: any, config: TerrainLayerConfig): void {
    if (!config.url) return;
    const { type, ...terrainProviderOptions }: any = config;
    terrainProviderOptions.url = this._normalizeUrl(terrainProviderOptions.url);
    const terrainProvider = new window.SuperMap3D.SuperMapTerrainProvider(terrainProviderOptions);
    viewer.terrainProvider = terrainProvider;
  }

  /** 添加天地图地形图层 */
  private _addTiandituTerrainLayer(viewer: any, config: TiandituTerrainLayerConfig): void {
    const { type, ...terrainProviderOptions }: any = config;
    if (terrainProviderOptions.url) {
      terrainProviderOptions.url = this._normalizeUrl(terrainProviderOptions.url);
    }
    const token = this._resolveToken(terrainProviderOptions.token);
    if (token) {
      terrainProviderOptions.token = token;
    }
    const terrainProvider = new window.SuperMap3D.TiandituTerrainProvider(terrainProviderOptions);
    viewer.terrainProvider = terrainProvider;
  }

  /** 获取底图层列表 */
  getImageryLayers(): any[] {
    const viewer = this.viewer;
    if (!viewer?.imageryLayers) {
      return [];
    }
    return this._imageryLayers;
  }

  /** 解析 token：优先使用图层配置，否则使用全局 token */
  private _resolveToken(configToken?: string): string | undefined {
    return configToken ?? this.options.token;
  }

  /** 规范化 URL，确保是完整的绝对路径，避免被浏览器拼接为相对路径（如 http://localhost:xxx/） */
  private _normalizeUrl(url: string): string {
    if (!url) return url;
    url = url.trim();
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    if (/^\/\//.test(url)) {
      return 'https:' + url;
    }
    return 'https://' + url;
  }
}

import type { DrawHandlerOptions } from './draw-handler';
import { getArrayPosition, getSuperMap3DCartesian3 } from './fly-to-camera';
import { Tooltip } from './tooltip';

/**
 * 可视域观察点位置，格式为 `[lng, lat, height]`。
 */
export type ViewShedPosition = [number, number, number];

/**
 * 可视域分析配置。
 */
export interface ViewShedAnalysisOptions {
  /** 观察方向角。 */
  direction?: number;
  /** 俯仰角。 */
  pitch?: number;
  /** 可视域距离。 */
  distance?: number;
  /** 观察点附加高度。 */
  offsetHeight?: number;
  /** 垂直视场角。 */
  verticalFov?: number;
  /** 水平视场角。 */
  horizontalFov?: number;
  /** 可见区域颜色。 */
  visibleAreaColor?: string;
  /** 不可见区域颜色。 */
  hiddenAreaColor?: string;
  /** 辅助线颜色。 */
  hintLineColor?: string;
  /** 是否显示观察点。 */
  showViewPoint?: boolean;
  /** 添加可视域分析对象时触发的回调。 */
  onAdd?: (viewShed3D: ViewShedInstance) => void;
  /** 绘制处理器配置。 */
  drawHandlerOptions?: DrawHandlerOptions;
}

/**
 * 用于恢复可视域分析项的可序列化记录。
 */
export interface ViewShedRecord extends ViewShedAnalysisOptions {
  /** 记录唯一标识。 */
  id?: string;
  /** 记录名称。 */
  name?: string;
  /** 观察点位置。 */
  viewPosition: ViewShedPosition;
}

/**
 * 交互式可视域绘制工具配置。
 */
export interface ViewShedToolOptions {
  /** 可视域对象的默认配置。 */
  viewShed: {
    /** 可见区域颜色。 */
    visibleAreaColor?: string;
    /** 不可见区域颜色。 */
    hiddenAreaColor?: string;
    /** 辅助线颜色。 */
    hintLineColor?: string;
    /** 垂直视场角。 */
    verticalFov?: number;
    /** 水平视场角。 */
    horizontalFov?: number;
  };
  /** 观察点附加高度。 */
  offsetHeight?: number;
  /** 绘制处理器配置。 */
  drawHandlerOptions?: DrawHandlerOptions;
  /** 添加可视域分析对象时触发的回调。 */
  onAdd?: (viewShed3D: ViewShedInstance) => void;
  /** 生成记录唯一标识的方法。 */
  generateId?: () => string;
}

/**
 * 分析工具暴露的可视域分析对象实例。
 */
export interface ViewShedInstance {
  /** 对象唯一标识。 */
  id: string;
  /** 观察点位置。 */
  viewPosition: ViewShedPosition;
  /** 观察方向角。 */
  direction: number;
  /** 俯仰角。 */
  pitch: number;
  /** 可视域距离。 */
  distance: number;
  /** 垂直视场角。 */
  verticalFov: number;
  /** 水平视场角。 */
  horizontalFov: number;
  /** 可见区域颜色。 */
  visibleAreaColor: any;
  /** 不可见区域颜色。 */
  hiddenAreaColor: any;
  /** 辅助线颜色。 */
  hintLineColor: any;
  /** 观察点对应的辅助实体。 */
  pointEntity?: {
    show: boolean;
  };
  /** 根据目标点更新分析方向和距离。 */
  setDistDirByPoint: (targetPosition: ViewShedPosition) => void;
  /** 构建或刷新当前分析对象。 */
  build?: () => void;
  /** 销毁当前分析对象。 */
  destroy: () => void;
}

function getDefaultViewShedOptions(): Required<
  Omit<ViewShedAnalysisOptions, 'drawHandlerOptions' | 'onAdd'>
> {
  return {
    direction: 0,
    pitch: 0,
    distance: 200,
    offsetHeight: 0,
    verticalFov: 60,
    horizontalFov: 90,
    visibleAreaColor: 'rgba(0,255,0,0.3)',
    hiddenAreaColor: 'rgba(255,0,0,0.3)',
    hintLineColor: 'white',
    showViewPoint: true
  };
}

function generateViewShedId() {
  let seed = Date.now();
  if (window.performance && typeof window.performance.now === 'function') {
    seed += window.performance.now();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, value => {
    const random = ((seed + Math.random() * 16) % 16) | 0;
    seed = Math.floor(seed / 16);
    return (value === 'x' ? random : (random & 0x3) | 0x8).toString(16);
  });
}

function getSuperMap3DColor(color: string) {
  const SuperMap3D = window.SuperMap3D;
  if (!SuperMap3D?.Color?.fromCssColorString) {
    throw new Error('SuperMap3D.Color.fromCssColorString is not available');
  }
  return SuperMap3D.Color.fromCssColorString(color);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ensureEntityPrototype() {
  const SuperMap3D = window.SuperMap3D;
  const Entity = SuperMap3D?.Entity?.prototype;
  if (!Entity) {
    throw new Error('SuperMap3D.Entity is not available');
  }
  if (Entity.__iclientAligned__) {
    return;
  }

  Entity.addEvents = function (options: Record<string, any> = {}, scope?: any) {
    const entity = this;
    const target = scope || entity;
    entity.onClick = options.onClick && options.onClick.bind(target, options.data);
    entity.onRightClick = options.onRightClick && options.onRightClick.bind(target, options.data);
    entity.onHover = options.onHover && options.onHover.bind(target, options.data);
    entity.onLeftUp = options.onLeftUp && options.onLeftUp.bind(target, options.data);
    entity.onLeftDown = options.onLeftDown && options.onLeftDown.bind(target, options.data);
    entity.onRightUp = options.onRightUp && options.onRightUp.bind(target, options.data);
    entity.onRightDown = options.onRightDown && options.onRightDown.bind(target, options.data);
    entity.onDoubleClick =
      options.onDoubleClick && options.onDoubleClick.bind(target, options.data);
    return entity;
  };

  Entity.addPoint = Entity.addPoint || function (position: ViewShedPosition | number[], options: Record<string, any>) {
    const pointOptions = Object.assign({ color: SuperMap3D?.Color?.WHITE ?? '#ffffff' }, options);
    pointOptions.color = getSuperMap3DColor(pointOptions.color);
    if (pointOptions.distanceDisplayCondition && SuperMap3D?.DistanceDisplayCondition) {
      pointOptions.distanceDisplayCondition = new SuperMap3D.DistanceDisplayCondition(
        pointOptions.distanceDisplayCondition[0],
        pointOptions.distanceDisplayCondition[1]
      );
    }
    if (pointOptions.outlineColor) {
      pointOptions.outlineColor = getSuperMap3DColor(pointOptions.outlineColor);
    }
    if (position) {
      position = getSuperMap3DCartesian3(position as [number, number, number?]);
    }
    this.position = position || this.position;
    this.point = pointOptions;
    return this;
  };

  Entity.addMarker =
    Entity.addMarker ||
    function (position: ViewShedPosition | number[], options: Record<string, any> = {}) {
      let ratio = SuperMap3D.defaults?.ratio ?? 1;
      options = Object.assign(
        {
          url: null,
          height: 30,
          width: 30,
          scale: 1,
          align: 'center',
          heightReference: SuperMap3D.HeightReference?.NONE,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          labelText: '',
          labelAlign: 'right',
          labelOutline: false,
          labelOutlineWidth: 2,
          labelOutlineColor: '',
          labelColor: '#fff',
          labelFontSize: 14,
          labelFontFamily: 'MicrosoftYaHei',
          labelBackgroundPadding: [10, 10],
          labelOffsetX: 0,
          labelOffsetY: 0
        },
        options
      );
      if (ratio !== 1) {
        options.height = options.height * ratio;
        options.width = options.width * ratio;
        options.labelFontSize = options.labelFontSize * ratio;
        options.labelOutlineWidth = options.labelOutlineWidth * ratio;
        options.labelBackgroundPadding = options.labelBackgroundPadding.map((value: number) => value * ratio);
        options.labelOffsetX = options.labelOffsetX * ratio;
        options.labelOffsetY = options.labelOffsetY * ratio;
      }
      let verticalOrigin = SuperMap3D.VerticalOrigin?.CENTER;
      switch (options.align) {
        case 'bottom':
          verticalOrigin = SuperMap3D.VerticalOrigin?.BOTTOM;
          break;
        case 'top':
          verticalOrigin = SuperMap3D.VerticalOrigin?.TOP;
          break;
        default:
          verticalOrigin = SuperMap3D.VerticalOrigin?.CENTER;
      }
      const markerOptions: Record<string, any> = {
        position: getSuperMap3DCartesian3(position as [number, number, number?])
      };
      if (options.url) {
        markerOptions.billboard = {
          height: options.height,
          width: options.width,
          scale: options.scale,
          image: options.url,
          verticalOrigin,
          heightReference: options.heightReference,
          disableDepthTestDistance: options.disableDepthTestDistance
        };
      }
      if (options.labelText) {
        markerOptions.label = {
          fillColor: getSuperMap3DColor(options.labelColor),
          outlineColor: getSuperMap3DColor(options.labelOutlineColor || '#000'),
          outlineWidth: options.labelOutlineWidth,
          style: options.labelOutline
            ? SuperMap3D.LabelStyle.FILL_AND_OUTLINE
            : SuperMap3D.LabelStyle.FILL,
          text: options.labelText,
          font: `${options.labelFontSize * 4}px ${options.labelFontFamily}`,
          scale: 1 / 4,
          backgroundPadding: Array.isArray(options.labelBackgroundPadding)
            ? new SuperMap3D.Cartesian2(
                options.labelBackgroundPadding[0],
                options.labelBackgroundPadding[1]
              )
            : options.labelBackgroundPadding,
          pixelOffset: new SuperMap3D.Cartesian2(options.labelOffsetX, options.labelOffsetY),
          disableDepthTestDistance: options.disableDepthTestDistance
        };
      }
      this.position = markerOptions.position;
      this.billboard = markerOptions.billboard;
      this.label = markerOptions.label;
      return this;
    };
  Entity.__iclientAligned__ = true;
}

function getNewEntity() {
  const SuperMap3D = window.SuperMap3D;
  ensureEntityPrototype();
  return new SuperMap3D.Entity();
}

class EntitiesLayer {
  viewer: any;
  values: any[];

  constructor(viewer: any, _options: Record<string, any> = {}) {
    this.viewer = viewer;
    this.values = [];
  }

  addPoint(position: ViewShedPosition, options: Record<string, any> = {}) {
    const entity = getNewEntity();
    entity.addPoint(position, options);
    entity.addEvents(options);
    const nextEntity = this.viewer?.entities?.add?.(entity);
    if (nextEntity) {
      this.values.push(nextEntity);
    }
    return nextEntity;
  }

  addMarker(position: ViewShedPosition, options: Record<string, any> = {}) {
    const entity = getNewEntity();
    entity.show = options.show ?? true;
    entity.name = options.name;
    entity.addMarker(position, options);
    entity.addEvents(options);
    const nextEntity = this.viewer?.entities?.add?.(entity);
    if (nextEntity) {
      this.values.push(nextEntity);
    }
    return nextEntity;
  }

  getValues() {
    return this.values
      .map(entity => entity?.position)
      .map((position: any) => position?._value ?? position)
      .filter(Boolean);
  }

  removeById(id: string) {
    const entity = this.values.find(value => value?.id === id);
    if (!entity) {
      return;
    }
    this.viewer?.entities?.remove?.(entity);
    this.values = this.values.filter(value => value?.id !== id);
  }

  removeAll() {
    this.values.forEach(entity => {
      this.viewer?.entities?.remove?.(entity);
    });
    this.values = [];
  }
}

function normalizeViewShedPosition(position: ViewShedPosition | number[]) {
  return getArrayPosition(position as ViewShedPosition) as ViewShedPosition;
}

function ensureViewShedPrototype() {
  const SuperMap3D = window.SuperMap3D;
  const ViewShed3D = SuperMap3D?.ViewShed3D?.prototype;
  if (!ViewShed3D || ViewShed3D.__iclientAligned__) {
    return;
  }

  ViewShed3D.hideViewShed3D = function () {
    this._srcDistance = this.distance === 0.01 ? this._srcDistance : this.distance;
    this.distance = 0.01;
  };
  ViewShed3D.showViewShed3D = function () {
    this.distance = this.distance === 0.01 ? this._srcDistance : this.distance;
  };
  ViewShed3D.hide = function () {
    this.hideViewShed3D();
    this.pointEntity && (this.pointEntity.show = false);
  };
  ViewShed3D.show = function () {
    this.showViewShed3D();
    this.pointEntity && (this.pointEntity.show = true);
  };
  ViewShed3D.setPosition = function (position: ViewShedPosition | number[]) {
    this.viewPosition = normalizeViewShedPosition(position);
  };
  ViewShed3D.__iclientAligned__ = true;
}

class ViewShed3DLayer {
  viewer: any;
  values: ViewShedInstance[];
  map: Record<string, ViewShedInstance>;
  pointLayer: EntitiesLayer;

  constructor(viewer: any) {
    this.viewer = viewer;
    this.values = [];
    this.map = {};
    this.pointLayer = new EntitiesLayer(viewer, {
      name: `ViewShed3DPointLayer${generateViewShedId()}`
    });
  }

  add(record: ViewShedRecord | ViewShedInstance) {
    ensureViewShedPrototype();
    const SuperMap3D = window.SuperMap3D;
    let item: ViewShedInstance | undefined;
    let nextRecord: any = record;
    if (record instanceof SuperMap3D?.ViewShed3D) {
      item = record as ViewShedInstance;
      nextRecord = { id: item.id };
    } else {
      nextRecord = {
        visibleAreaColor: 'green',
        hiddenAreaColor: 'red',
        hintLineColor: 'white',
        direction: 0,
        pitch: 0,
        distance: 200,
        verticalFov: 60,
        horizontalFov: 90,
        id: generateViewShedId(),
        ...record
      };
    }
    if (this.map[nextRecord.id]) {
      throw new Error('id重复');
    }
    if (!item) {
      nextRecord.pitch = clamp(nextRecord.pitch ?? 0, -90, 90);
      nextRecord.distance = Math.max(nextRecord.distance ?? 200, 0.01);
      nextRecord.verticalFov = clamp(nextRecord.verticalFov ?? 60, 1, 179);
      nextRecord.horizontalFov = clamp(nextRecord.horizontalFov ?? 90, 1, 179);
      nextRecord.visibleAreaColor = getSuperMap3DColor(nextRecord.visibleAreaColor);
      nextRecord.hiddenAreaColor = getSuperMap3DColor(nextRecord.hiddenAreaColor);
      nextRecord.hintLineColor = getSuperMap3DColor(nextRecord.hintLineColor);
      nextRecord.viewPosition &&
        (nextRecord.viewPosition = normalizeViewShedPosition(nextRecord.viewPosition));
      item = new SuperMap3D.ViewShed3D(this.viewer.scene);
      Object.keys(nextRecord).forEach(key => {
        if (key === 'point' || key === 'data' || key.startsWith('on')) {
          return;
        }
        item[key] = nextRecord[key];
      });
      const pointEntity = this.pointLayer.addPoint(nextRecord.viewPosition, {
        id: item.id,
        color: '#fff',
        pixelSize: 8,
        ...(nextRecord.point || {})
      });
      pointEntity.addEvents(nextRecord, item);
      item.pointEntity = pointEntity;
    }
    this.values.push(item);
    this.map[item.id] = item;
    item.id = item.id || generateViewShedId();
    item.build?.();
    return item;
  }

  getValues() {
    return this.values;
  }

  getById(id: string) {
    return this.map[id];
  }

  remove(item: ViewShedInstance) {
    item.distance = 0.01;
    item.destroy?.();
    this.values = this.values.filter(value => value.id !== item.id);
    delete this.map[item.id];
    this.pointLayer.removeById(item.id);
  }

  removeAll() {
    this.values.forEach(item => {
      item.distance = 0.01;
      item.destroy();
    });
    this.values = [];
    this.map = {};
    this.pointLayer.removeAll();
  }
}

class ViewShedTool {
  viewer: any;
  viewShed3DLayer: ViewShed3DLayer;
  options: ViewShedToolOptions;
  pointHandler: any;
  handler: any;
  tooltip: Tooltip | null;
  viewShed3D: ViewShedInstance | undefined;
  viewFlag: boolean;
  viewPosition: any;

  constructor(viewer: any, viewShed3DLayer: ViewShed3DLayer, options: ViewShedToolOptions) {
    this.viewer = viewer;
    this.viewShed3DLayer = viewShed3DLayer;
    this.options = options;
    this.viewFlag = false;
    this.tooltip = null;
  }

  activate(selectViewPoint = true) {
    if (!selectViewPoint) {
      return undefined;
    }
    const SuperMap3D = window.SuperMap3D;
    if (!this.viewer?.scene || !SuperMap3D?.ScreenSpaceEventHandler) {
      return undefined;
    }
    const scene = this.viewer.scene;
    this._init_();
    this.deactivate(selectViewPoint);
    this.viewFlag = true;
    this.handler = new SuperMap3D.ScreenSpaceEventHandler(scene.canvas);
    this.enableEditStatus(true);
    this.handler.setInputAction((event: any) => {
      if (this.viewFlag) {
        this._getTooltip().showAt(event.endPosition, '<p>单击开始绘制</p>');
        return;
      }
      const cartesian = scene.pickPosition?.(event.endPosition);
      if (
        cartesian &&
        this.viewPosition &&
        SuperMap3D?.Cartesian3?.distance?.(this.viewPosition, cartesian) > 0
      ) {
        const targetPosition = this.normalizePosition(cartesian, 0);
        if (targetPosition) {
          this.viewShed3D?.setDistDirByPoint(targetPosition);
        }
      }
      this._getTooltip().showAt(event.endPosition, '<p>右击完成绘制</p>');
    }, SuperMap3D.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(() => {
      this.viewFlag = true;
      this.enableEditStatus(false);
      if (this.viewShed3D) {
        this.options.onAdd?.(this.viewShed3D);
      }
      this.handler?.removeInputAction?.(SuperMap3D.ScreenSpaceEventType.MOUSE_MOVE);
      this._getTooltip().setVisible(false);
    }, SuperMap3D.ScreenSpaceEventType.RIGHT_CLICK);

    if (!this.pointHandler?.active) {
      this.viewFlag = true;
      this.pointHandler?.activate?.();
    }
    return undefined;
  }

  deactivate(keepResult = false) {
    this.enableEditStatus(false);
    this.pointHandler?.clear?.();
    if (!keepResult) {
      this.viewShed3DLayer?.removeAll?.();
    }
    if (this.handler && !this.handler.isDestroyed?.()) {
      this.handler.destroy();
    }
    this.handler = undefined;
    this.tooltip?.destroy();
    this.tooltip = null;
  }

  destroy() {
    this.deactivate(false);
    this.pointHandler?.destroy?.();
    this.pointHandler = undefined;
    this.viewShed3D = undefined;
  }

  private _init_() {
    const SuperMap3D = window.SuperMap3D;
    if (this.pointHandler || !this.viewer || !SuperMap3D?.DrawHandler) {
      return;
    }
    this.pointHandler = new SuperMap3D.DrawHandler(this.viewer, SuperMap3D.DrawMode.Point);
    this.pointHandler.drawEvt.addEventListener((result: any) => {
      const object = result?.object;
      const cartesian = object?.position;
      if (!cartesian) {
        return;
      }
      object.show = false;
      this.viewPosition = cartesian;
      const viewPosition = this.normalizePosition(cartesian, this.options.offsetHeight ?? 0);
      if (!viewPosition) {
        return;
      }
      if (this.viewFlag) {
        this.viewShed3D = this.viewShed3DLayer.add({
          ...this.options.viewShed,
          distance: 0.1,
          id: this.options.generateId?.() ?? generateViewShedId(),
          viewPosition
        });
        this.viewFlag = false;
      }
    });
  }

  private _getTooltip() {
    if (!this.tooltip) {
      this.tooltip = new Tooltip(this.viewer);
    }
    return this.tooltip;
  }

  private enableEditStatus(enabled: boolean) {
    this.setMouseCursor(enabled ? 'measureCur' : 'normal');
    const canvas = this.viewer?.canvas;
    if (canvas?.classList) {
      enabled ? canvas.classList.add('drawStatus') : canvas.classList.remove('drawStatus');
    }
  }

  private normalizePosition(position: { x: number; y: number; z: number }, offsetHeight = 0) {
    const SuperMap3D = window.SuperMap3D;
    const cartographic = SuperMap3D?.Cartographic?.fromCartesian?.(position);
    if (!cartographic || !SuperMap3D?.Math?.toDegrees) {
      return undefined;
    }
    return [
      SuperMap3D.Math.toDegrees(cartographic.longitude),
      SuperMap3D.Math.toDegrees(cartographic.latitude),
      cartographic.height + offsetHeight
    ] as ViewShedPosition;
  }

  private setMouseCursor(type: 'measureCur' | 'normal') {
    const viewer = this.viewer;
    if (!viewer?._element) {
      return;
    }
    if (type === 'normal') {
      viewer.enableCursorStyle = true;
      document.body.classList.remove('measureCur');
      return;
    }
    viewer.enableCursorStyle = false;
    viewer._element.style.cursor = '';
    document.body.classList.add('measureCur');
  }
}

/**
 * 用于创建、更新和移除场景可视域对象的管理器。
 */
export class ViewShedAnalysis {
  viewer: any;
  options: Required<Omit<ViewShedAnalysisOptions, 'drawHandlerOptions' | 'onAdd'>> & {
    drawHandlerOptions?: DrawHandlerOptions;
    onAdd?: (viewShed3D: ViewShedInstance) => void;
  };
  private viewShedTool: ViewShedTool | undefined;
  private viewShedLayer: ViewShed3DLayer | undefined;
  private currentViewShed3D: ViewShedInstance | undefined;

  constructor(viewer: any, options: ViewShedAnalysisOptions = {}) {
    this.viewer = viewer;
    this.options = {
      ...getDefaultViewShedOptions(),
      drawHandlerOptions: options.drawHandlerOptions,
      ...options
    };
  }

  get currentViewPosition(): ViewShedPosition | undefined {
    return this.currentViewShed3D?.viewPosition;
  }

  updateOptions(options: ViewShedAnalysisOptions = {}) {
    this.options = {
      ...this.options,
      ...options,
      drawHandlerOptions: options.drawHandlerOptions ?? this.options.drawHandlerOptions
    };
    this.applyCurrentViewShedOptions();
    this.syncToolViewShedOptions();
  }

  activate(selectViewPoint = true) {
    return this.getViewShedTool().activate(selectViewPoint);
  }

  deactivate(keepResult = false) {
    this.viewShedTool?.deactivate(keepResult);
  }

  setDirection(direction: number) {
    this.options.direction = direction;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.direction = direction;
    }
  }

  setPitch(pitch: number) {
    this.options.pitch = pitch;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.pitch = pitch;
    }
  }

  setDistance(distance: number) {
    this.options.distance = distance;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.distance = distance;
    }
  }

  setVerticalFov(verticalFov: number) {
    this.options.verticalFov = verticalFov;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.verticalFov = verticalFov;
    }
  }

  setHorizontalFov(horizontalFov: number) {
    this.options.horizontalFov = horizontalFov;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.horizontalFov = horizontalFov;
    }
  }

  setOffsetHeight(offsetHeight: number) {
    this.options.offsetHeight = offsetHeight;
    if (!this.currentViewShed3D?.viewPosition) {
      return;
    }
    const viewPosition = this.currentViewShed3D.viewPosition;
    viewPosition[2] = offsetHeight;
    this.currentViewShed3D.viewPosition = viewPosition;
  }

  setVisibleAreaColor(visibleAreaColor: string) {
    this.options.visibleAreaColor = visibleAreaColor;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.visibleAreaColor = getSuperMap3DColor(visibleAreaColor);
    }
    this.syncToolViewShedOptions();
  }

  setHiddenAreaColor(hiddenAreaColor: string) {
    this.options.hiddenAreaColor = hiddenAreaColor;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.hiddenAreaColor = getSuperMap3DColor(hiddenAreaColor);
    }
    this.syncToolViewShedOptions();
  }

  setHintLineColor(hintLineColor: string) {
    this.options.hintLineColor = hintLineColor;
    if (this.currentViewShed3D) {
      this.currentViewShed3D.hintLineColor = getSuperMap3DColor(hintLineColor);
    }
    this.syncToolViewShedOptions();
  }

  setShowViewPoint(showViewPoint: boolean) {
    this.options.showViewPoint = showViewPoint;
    if (this.currentViewShed3D?.pointEntity) {
      this.currentViewShed3D.pointEntity.show = showViewPoint;
    }
  }

  add(record: ViewShedRecord) {
    const layer = this.getViewShedLayer();
    const viewShed3D = layer.add({
      id: record.id ?? this.generateId(),
      visibleAreaColor: record.visibleAreaColor ?? this.options.visibleAreaColor,
      hiddenAreaColor: record.hiddenAreaColor ?? this.options.hiddenAreaColor,
      hintLineColor: record.hintLineColor ?? this.options.hintLineColor,
      direction: record.direction ?? this.options.direction,
      pitch: record.pitch ?? this.options.pitch,
      distance: record.distance ?? this.options.distance,
      verticalFov: record.verticalFov ?? this.options.verticalFov,
      horizontalFov: record.horizontalFov ?? this.options.horizontalFov,
      viewPosition: [...record.viewPosition]
    });

      if (record.name && layer.pointLayer?.addMarker) {
        layer.pointLayer.addMarker(viewShed3D.viewPosition, {
          labelText: record.name,
          labelColor: '#fff',
          labelFontSize: 14,
          labelAlign: 'top',
          labelOffsetX: -40,
          labelOffsetY: -15
        });
    }

    return viewShed3D;
  }

  addMany(records: ViewShedRecord[]) {
    return records.map(record => this.add(record));
  }

  clear() {
    this.deactivate(false);
    this.currentViewShed3D = undefined;
    this.viewShedLayer?.removeAll();
  }

  destroy() {
    this.clear();
    this.viewShedTool?.destroy();
    this.viewShedTool = undefined;
    this.viewShedLayer = undefined;
  }

  private getViewShedTool() {
    if (!this.viewShedTool) {
      const layer = this.getViewShedLayer();
      this.viewShedTool = new ViewShedTool(this.viewer, layer, {
        viewShed: this.createToolViewShedOptions(),
        offsetHeight: this.options.offsetHeight,
        drawHandlerOptions: this.options.drawHandlerOptions,
        generateId: () => this.generateId(),
        onAdd: (viewShed3D: ViewShedInstance) => {
          this.currentViewShed3D = viewShed3D;
          this.options.direction = viewShed3D.direction;
          this.options.pitch = viewShed3D.pitch;
          this.options.distance = viewShed3D.distance;
          this.options.verticalFov = viewShed3D.verticalFov;
          this.options.horizontalFov = viewShed3D.horizontalFov;
          this.applyCurrentViewShedOptions();
          if (viewShed3D.pointEntity) {
            viewShed3D.pointEntity.show = this.options.showViewPoint;
          }
          this.options.onAdd?.(viewShed3D);
        }
      });
    }

    this.syncToolViewShedOptions();
    return this.viewShedTool;
  }

  private getViewShedLayer() {
    if (!this.viewShedLayer) {
      this.viewShedLayer = new ViewShed3DLayer(this.viewer);
    }
    return this.viewShedLayer;
  }

  private createToolViewShedOptions() {
    return {
      visibleAreaColor: this.options.visibleAreaColor,
      hiddenAreaColor: this.options.hiddenAreaColor,
      hintLineColor: this.options.hintLineColor,
      verticalFov: this.options.verticalFov,
      horizontalFov: this.options.horizontalFov
    };
  }

  private syncToolViewShedOptions() {
    if (!this.viewShedTool) {
      return;
    }
    this.viewShedTool.options = Object.assign(this.viewShedTool.options || {}, {
      viewShed: this.createToolViewShedOptions(),
      offsetHeight: this.options.offsetHeight,
      drawHandlerOptions: this.options.drawHandlerOptions
    });
  }

  private applyCurrentViewShedOptions() {
    const viewShed3D = this.currentViewShed3D;
    if (!viewShed3D) {
      return;
    }

    viewShed3D.direction = this.options.direction;
    viewShed3D.pitch = this.options.pitch;
    viewShed3D.distance = this.options.distance;
    viewShed3D.verticalFov = this.options.verticalFov;
    viewShed3D.horizontalFov = this.options.horizontalFov;
    viewShed3D.visibleAreaColor = getSuperMap3DColor(this.options.visibleAreaColor);
    viewShed3D.hiddenAreaColor = getSuperMap3DColor(this.options.hiddenAreaColor);
    viewShed3D.hintLineColor = getSuperMap3DColor(this.options.hintLineColor);
  }

  private generateId() {
    return generateViewShedId();
  }
}

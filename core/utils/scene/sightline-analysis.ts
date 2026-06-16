import circle from '@turf/circle';
import { DrawHandler, type DrawHandlerOptions } from './draw-handler';
import { Tooltip } from './tooltip';
export {
  ViewShedAnalysis,
  type ViewShedAnalysisOptions,
  type ViewShedPosition,
  type ViewShedRecord
} from './viewshed-analysis';

export type SightlinePosition = [number, number, number];

export interface SightlineAnalysisOptions {
  lineWidth?: number;
  visibleColor?: string;
  hiddenColor?: string;
  offsetHeight?: number;
  onAddViewPoint?: (position: SightlinePosition) => void;
  onAddTargetPoint?: (targetPoint: SightlineTargetPoint) => void;
  drawHandlerOptions?: DrawHandlerOptions;
  showViewPoint?: boolean;
  showTargetPoint?: boolean;
  viewPointColor?: string;
  targetPointColor?: string;
  pointOutlineColor?: string;
  pointPixelSize?: number;
}

export interface SightlineTargetPoint {
  position: SightlinePosition;
  name?: string;
}

export interface SightlineCircleAnalysisOptions {
  center: SightlinePosition | { x: number; y: number; z: number };
  radius: number;
  steps?: number;
  clear?: boolean;
  offsetHeight?: number;
}

const SIGHTLINE_VIEWPOINT_REQUIRED_ERROR = 'Sightline view point is not set';

function isCartesianPosition(
  position: SightlinePosition | { x: number; y: number; z: number }
): position is { x: number; y: number; z: number } {
  return (
    !Array.isArray(position) &&
    typeof position.x === 'number' &&
    typeof position.y === 'number' &&
    typeof position.z === 'number'
  );
}

function getCartesianHeight(position: SightlinePosition): number {
  return Array.isArray(position) && typeof position[2] === 'number' ? position[2] : 0;
}

class CirclePreview {
  viewer: any;
  entity: any;
  center: any;
  radius: number;
  options: Record<string, any>;

  constructor(viewer: any, options: { material: string; outlineColor: string }) {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D?.Color?.fromCssColorString) {
      throw new Error('SuperMap3D.Color.fromCssColorString is not available');
    }
    this.viewer = viewer;
    this.options = {
      material: SuperMap3D.Color.fromCssColorString(options.material),
      outline: true,
      outlineColor: SuperMap3D.Color.fromCssColorString(options.outlineColor),
      clampToGround: true
    };
    this.radius = 0.1;
  }

  setCenter(center: any) {
    this.center = center;
    this.sync();
  }

  setRadius(radius: number) {
    this.radius = Math.max(0.1, radius);
    this.sync();
  }

  getCenter() {
    return this.center;
  }

  getRadius() {
    return this.radius;
  }

  create() {
    const SuperMap3D = window.SuperMap3D;
    if (!this.viewer?.entities || !this.center || !SuperMap3D?.CallbackProperty) {
      return;
    }
    const ellipseOptions = { ...this.options };
    if (ellipseOptions.clampToGround) {
      if ('height' in ellipseOptions) {
        delete ellipseOptions.height;
      }
    } else {
      const degree = this.viewer?.cartesian3ToDegrees?.(this.getCenter());
      ellipseOptions.height = degree?.height;
    }
    this.entity = this.viewer.entities.add({
      position: new SuperMap3D.CallbackProperty(() => this.center, false),
      ellipse: {
        ...ellipseOptions,
        semiMajorAxis: new SuperMap3D.CallbackProperty(() => this.radius, false),
        semiMinorAxis: new SuperMap3D.CallbackProperty(() => this.radius, false)
      }
    });
  }

  remove() {
    if (this.entity && this.viewer?.entities) {
      this.viewer.entities.remove(this.entity);
    }
    this.entity = undefined;
  }

  private sync() {
    if (!this.entity || !this.entity.ellipse) {
      return;
    }
    this.entity.ellipse.material = this.options.material;
    this.entity.ellipse.outline = this.options.outline;
    this.entity.ellipse.outlineColor = this.options.outlineColor;
    this.entity.ellipse.clampToGround = this.options.clampToGround;
  }
}

export class SightlineAnalysis {
  viewer: any;
  sightline: any;
  drawHandler: DrawHandler | undefined;
  pointHandler: any;
  options: SightlineAnalysisOptions;
  viewFlag: boolean;
  hasViewPointFlag: boolean;

  constructor(viewer: any, options: SightlineAnalysisOptions = {}) {
    this.viewer = viewer;
    this.options = {
      lineWidth: 2,
      visibleColor: 'rgba(0,255,0,1)',
      hiddenColor: 'rgba(255,0,0,1)',
      offsetHeight: 0,
      showViewPoint: true,
      showTargetPoint: true,
      viewPointColor: '#ffffff',
      targetPointColor: '#ffffff',
      pointOutlineColor: '#ffffff',
      pointPixelSize: 10,
      ...options
    };
    this.viewFlag = false;
    this.hasViewPointFlag = false;
  }

  get viewPosition(): SightlinePosition | undefined {
    const sightline = this.ensureSightline();
    if (!sightline?.viewPosition) {
      return undefined;
    }
    return [...sightline.viewPosition] as SightlinePosition;
  }

  get hasViewPoint(): boolean {
    return this.hasViewPointFlag;
  }

  updateOptions(options: SightlineAnalysisOptions = {}) {
    this.options = {
      ...this.options,
      ...options,
      drawHandlerOptions: options.drawHandlerOptions ?? this.options.drawHandlerOptions
    };
    this.applyStyle();
  }

  setViewPosition(position: SightlinePosition) {
    const sightline = this.ensureSightline();
    if (!sightline) {
      return undefined;
    }
    sightline.viewPosition = [...position];
    this.hasViewPointFlag = true;
    return this.viewPosition;
  }

  setViewPositionFromCartesian(
    position: { x: number; y: number; z: number },
    offsetHeight = this.options.offsetHeight ?? 0
  ) {
    const normalizedPosition = this.normalizePosition(position, offsetHeight);
    if (!normalizedPosition) {
      return undefined;
    }
    return this.setViewPosition(normalizedPosition);
  }

  setOffsetHeight(height: number) {
    if (!this.hasViewPointFlag) {
      return undefined;
    }
    const position = this.viewPosition;
    if (!position) {
      return undefined;
    }
    position[2] = height;
    return this.setViewPosition(position);
  }

  setLineWidth(lineWidth: number) {
    this.options.lineWidth = lineWidth;
    this.applyStyle();
  }

  setVisibleColor(visibleColor: string) {
    this.options.visibleColor = visibleColor;
    this.applyStyle();
  }

  setHiddenColor(hiddenColor: string) {
    this.options.hiddenColor = hiddenColor;
    this.applyStyle();
  }

  async addViewPoint(_offsetHeight = this.options.offsetHeight ?? 0) {
    this.ensurePointHandler();
    this.remove();
    this.viewFlag = true;
    this.enableEditStatus(true);
    this.getDrawHandler().setMouseCursor('measureCur');
    if (!this.pointHandler?.active) {
      this.viewFlag = true;
      this.pointHandler?.activate?.();
    }
    return undefined;
  }

  async drawViewPoint(offsetHeight = this.options.offsetHeight ?? 0) {
    return this.addViewPoint(offsetHeight);
  }

  private addTargetPointRecord(targetPoint: SightlineTargetPoint) {
    const sightline = this.ensureSightline();
    if (!sightline) {
      return undefined;
    }
    this.assertHasViewPoint();
    sightline.addTargetPoint({
      position: [...targetPoint.position],
      name: targetPoint.name
    });
    this.options.onAddTargetPoint?.(targetPoint);
    return targetPoint.position;
  }

  addTargetPoint(targetPoint: SightlineTargetPoint): SightlinePosition | undefined;
  addTargetPoint(name?: string): Promise<SightlinePosition | undefined>;
  addTargetPoint(targetPointOrName?: SightlineTargetPoint | string) {
    if (
      targetPointOrName &&
      typeof targetPointOrName === 'object' &&
      Array.isArray(targetPointOrName.position)
    ) {
      return this.addTargetPointRecord(targetPointOrName);
    }
    this.assertHasViewPoint();
    this.ensurePointHandler();
    this.viewFlag = false;
    this.enableEditStatus(true);
    this.getDrawHandler().setMouseCursor('measureCur');
    this.pointHandler?.activate?.();
    return Promise.resolve(undefined);
  }

  addTargetPoints(targetPoints: SightlineTargetPoint[]) {
    return targetPoints
      .map(targetPoint => this.addTargetPointRecord(targetPoint))
      .filter((position): position is SightlinePosition => Array.isArray(position));
  }

  async drawTargetPoint(name?: string) {
    return this.addTargetPoint(name);
  }

  async analyzeByCircle(options: SightlineCircleAnalysisOptions) {
    const center = this.normalizePosition(options.center, options.offsetHeight);
    if (!center) {
      return [];
    }

    if (options.clear !== false) {
      this.clearTargetPoints();
    }

    this.setViewPosition(center);

    const steps = options.steps && options.steps > 2 ? options.steps : 128;
    const positions = this.buildCirclePositions(center, options.radius, steps);
    const tilesPositions = await this.resolveTileHeights(positions, getCartesianHeight(center));

    return this.addTargetPoints(
      tilesPositions.map((position, index) => ({
        position,
        name: `point-${index}-${Date.now()}`
      }))
    );
  }

  clearTargetPoints() {
    const sightline = this.ensureSightline();
    sightline?.removeAllTargetPoint?.();
  }

  remove() {
    this.enableEditStatus(false);
    this.pointHandler?.clear?.();
    this.clearTargetPoints();
    this.hasViewPointFlag = false;
  }

  clear() {
    this.remove();
    this.drawHandler?.clear();
  }

  destroy() {
    this.clear();
    this.drawHandler?.destroy();
    this.drawHandler = undefined;
    this.pointHandler = undefined;
    this.sightline = undefined;
  }

  private ensureSightline() {
    const SuperMap3D = window.SuperMap3D;
    if (!this.sightline && this.viewer?.scene && SuperMap3D?.Sightline) {
      this.sightline = new SuperMap3D.Sightline(this.viewer.scene);
      this.sightline.build?.();
    }
    this.applyStyle();
    return this.sightline;
  }

  private applyStyle() {
    const sightline = this.sightline;
    const SuperMap3D = window.SuperMap3D;
    if (!sightline || !SuperMap3D?.Color) {
      return;
    }
    sightline.lineWidth = this.options.lineWidth ?? 2;
    if (this.options.hiddenColor) {
      sightline.hiddenColor = SuperMap3D.Color.fromCssColorString(this.options.hiddenColor);
    }
    if (this.options.visibleColor) {
      sightline.visibleColor = SuperMap3D.Color.fromCssColorString(this.options.visibleColor);
    }
  }

  protected getDrawHandler() {
    if (!this.drawHandler) {
      this.drawHandler = new DrawHandler(this.viewer, this.options.drawHandlerOptions);
    }
    return this.drawHandler;
  }

  private ensurePointHandler(offsetHeight = this.options.offsetHeight ?? 0) {
    const SuperMap3D = window.SuperMap3D;
    if (this.pointHandler || !this.viewer || !SuperMap3D?.DrawHandler) {
      return;
    }
    this.ensureSightline();
    this.pointHandler = new SuperMap3D.DrawHandler(this.viewer, SuperMap3D.DrawMode.Point);
    this.pointHandler.drawEvt.addEventListener((result: any) => {
      const object = result?.object;
      const position = object?.position;
      object && (object.show = true);
      const nextPosition = this.normalizePosition(position, 0);
      if (!nextPosition) {
        this.enableEditStatus(false);
        this.getDrawHandler().setMouseCursor('normal');
        return;
      }
      if (this.viewFlag) {
        this.clearTargetPoints();
        this.setViewPosition(nextPosition);
        this.viewFlag = false;
        this.options.onAddViewPoint?.(nextPosition);
      } else {
        this.addTargetPointRecord({
          position: nextPosition,
          name: `point${Date.now()}`
        });
      }
      this.enableEditStatus(false);
      this.getDrawHandler().setMouseCursor('normal');
    });
  }

  private enableEditStatus(enabled: boolean) {
    const canvas = this.viewer?.canvas;
    if (!canvas?.classList) {
      return;
    }
    if (enabled) {
      canvas.classList.add('drawStatus');
      return;
    }
    canvas.classList.remove('drawStatus');
  }

  protected toCartesian3(position: SightlinePosition) {
    return window.SuperMap3D?.Cartesian3?.fromDegrees?.(position[0], position[1], position[2]);
  }

  protected normalizePosition(
    position: SightlinePosition | { x: number; y: number; z: number } | undefined,
    offsetHeight = 0
  ): SightlinePosition | undefined {
    if (!position) {
      return undefined;
    }

    if (Array.isArray(position)) {
      return [position[0], position[1], position[2] + offsetHeight];
    }

    if (!isCartesianPosition(position)) {
      return undefined;
    }

    const SuperMap3D = window.SuperMap3D;
    const cartographic = SuperMap3D?.Cartographic?.fromCartesian?.(position);
    if (!cartographic || !SuperMap3D?.Math?.toDegrees) {
      return undefined;
    }

    return [
      SuperMap3D.Math.toDegrees(cartographic.longitude),
      SuperMap3D.Math.toDegrees(cartographic.latitude),
      cartographic.height + offsetHeight
    ];
  }

  private async resolveTileHeights(positions: [number, number][], fallbackHeight: number) {
    const tilesHeights = await this.viewer?.getTilesHeight?.(positions);
    if (!Array.isArray(tilesHeights) || tilesHeights.length === 0) {
      return positions.map(
        ([longitude, latitude]) => [longitude, latitude, fallbackHeight] as SightlinePosition
      );
    }

    return tilesHeights
      .map((position: any) => this.normalizePosition(position))
      .filter((position): position is SightlinePosition => Array.isArray(position));
  }

  private assertHasViewPoint() {
    if (!this.hasViewPoint) {
      throw new Error(SIGHTLINE_VIEWPOINT_REQUIRED_ERROR);
    }
  }

  private buildCirclePositions(
    center: SightlinePosition,
    radius: number,
    steps: number
  ): [number, number][] {
    const feature = circle([center[0], center[1]], radius, {
      units: 'meters',
      steps
    });
    return (feature.geometry.coordinates?.[0] ?? []) as [number, number][];
  }
}

export interface SightNetworkAnalysisOptions extends SightlineAnalysisOptions {
  radius?: number;
  previewRadiusColor?: string;
  previewRadiusOutlineColor?: string;
}

export class SightNetworkAnalysis extends SightlineAnalysis {
  options: SightNetworkAnalysisOptions;
  circleDrawHandler: any;
  circleTooltip: Tooltip | null;
  circlePreview: CirclePreview | undefined;

  constructor(viewer: any, options: SightNetworkAnalysisOptions = {}) {
    super(viewer, {
      showViewPoint: false,
      showTargetPoint: false,
      previewRadiusColor: 'rgba(165, 110, 68, 0.65)',
      previewRadiusOutlineColor: '#ffffff',
      ...options
    });
    this.options = {
      ...this.options,
      radius: options.radius ?? 300,
      previewRadiusColor: options.previewRadiusColor ?? 'rgba(165, 110, 68, 0.65)',
      previewRadiusOutlineColor: options.previewRadiusOutlineColor ?? '#ffffff'
    };
    this.circleTooltip = null;
  }

  updateOptions(options: SightNetworkAnalysisOptions = {}) {
    super.updateOptions(options);
    this.options = {
      ...this.options,
      ...options
    };
  }

  setRadius(radius: number) {
    this.options.radius = radius;
  }

  async drawCircleAnalysis(offsetHeight = this.options.offsetHeight ?? 0) {
    this.clear();
    this.options.offsetHeight = offsetHeight;
    this.startCircleDrawing();
    return undefined;
  }

  clear() {
    super.clear();
    this.stopCircleDrawing();
  }

  destroy() {
    super.destroy();
    this.stopCircleDrawing();
  }

  private startCircleDrawing() {
    const SuperMap3D = window.SuperMap3D;
    if (!this.viewer?.scene || !SuperMap3D?.ScreenSpaceEventHandler) {
      return;
    }
    const scene = this.viewer.scene;
    this.stopCircleDrawing();
    this.getDrawHandler().setMouseCursor('measureCur');
    this.circleDrawHandler = new SuperMap3D.ScreenSpaceEventHandler(scene.canvas);
    this.circleDrawHandler.setInputAction((event: any) => {
      const cartesian = scene.pickPosition?.(event.position);
      if (!cartesian) {
        return;
      }
      if (!this.circlePreview) {
        this.circlePreview = new CirclePreview(this.viewer, {
          material: this.options.previewRadiusColor ?? 'rgba(165, 110, 68, 0.65)',
          outlineColor: this.options.previewRadiusOutlineColor ?? '#ffffff'
        });
        this.circlePreview.setCenter(cartesian);
        this.circlePreview.setRadius(0);
        this.circlePreview.create();
        return;
      }
      const center = this.circlePreview.getCenter();
      const radius = this.circlePreview.getRadius();
      this.stopCircleDrawing();
      if (!center || radius <= 0) {
        return;
      }
      void this.finishCircleAnalysis(center, radius);
    }, SuperMap3D.ScreenSpaceEventType.LEFT_DOWN);
    this.circleDrawHandler.setInputAction((event: any) => {
      if (!this.circlePreview) {
        this.getCircleTooltip().showAt(event.endPosition, '<p>点击开始绘制圆</p>');
        return;
      }
      const cartesian = scene.pickPosition?.(event.endPosition);
      if (!cartesian) {
        return;
      }
      const center = this.circlePreview.getCenter();
      if (!center) {
        return;
      }
      this.circlePreview.setRadius(SuperMap3D.Cartesian3.distance(center, cartesian));
      this.getCircleTooltip().showAt(
        event.endPosition,
        '<p>移动鼠标改变圆的半径</p><p>再次点击结束绘制</p>'
      );
    }, SuperMap3D.ScreenSpaceEventType.MOUSE_MOVE);
  }

  private stopCircleDrawing() {
    this.circlePreview?.remove();
    this.circlePreview = undefined;
    if (this.circleDrawHandler && !this.circleDrawHandler.isDestroyed?.()) {
      this.circleDrawHandler.destroy();
    }
    this.circleDrawHandler = undefined;
    if (this.circleTooltip) {
      this.circleTooltip.setVisible(false);
    }
    this.getDrawHandler().setMouseCursor('normal');
  }

  private getCircleTooltip() {
    if (!this.circleTooltip) {
      this.circleTooltip = new Tooltip(this.viewer);
    }
    return this.circleTooltip;
  }

  private toDegreePosition(position: any) {
    const degree = this.viewer?.cartesian3ToDegrees?.(position);
    if (degree && typeof degree.lng === 'number' && typeof degree.lat === 'number') {
      return {
        longitude: degree.lng,
        latitude: degree.lat,
        height: degree.height ?? 0
      };
    }
    const normalizedPosition = this.normalizePosition(position, 0);
    if (!normalizedPosition) {
      return undefined;
    }
    return {
      longitude: normalizedPosition[0],
      latitude: normalizedPosition[1],
      height: normalizedPosition[2]
    };
  }

  private async finishCircleAnalysis(center: any, radius: number) {
    const degree = this.toDegreePosition(center);
    if (!degree) {
      return;
    }
    this.setRadius(radius);
    const viewPosition: SightlinePosition = [
      degree.longitude,
      degree.latitude,
      degree.height + 1.8
    ];
    this.setViewPosition(viewPosition);
    await this.analyzeByCircle({
      center: viewPosition,
      radius,
      offsetHeight: 0
    });
  }
}

export { SIGHTLINE_VIEWPOINT_REQUIRED_ERROR };

import { AnalysisBase } from './common-analysis';

export type OpennessViewPosition = [number, number, number];
export type OpennessDisplayMode = 0 | 1 | 2;

export interface OpennessAnalysisOptions {
  distance?: number;
  startAngle?: number;
  endAngle?: number;
  visibleAreaColor?: string;
  hiddenAreaColor?: string;
  displayMode?: OpennessDisplayMode;
  isClosed?: boolean;
  viewPosition?: OpennessViewPosition;
  onPositionChange?: (position?: OpennessViewPosition) => void;
}

function getDefaultOptions(): Required<Omit<OpennessAnalysisOptions, 'onPositionChange'>> {
  return {
    distance: 100,
    startAngle: 0,
    endAngle: 360,
    visibleAreaColor: '#00B7EF',
    hiddenAreaColor: '#E36C09',
    displayMode: 2,
    isClosed: false,
    viewPosition: [0, 0, 0]
  };
}

function isValidPosition(position: unknown): position is OpennessViewPosition {
  return (
    Array.isArray(position) &&
    position.length >= 3 &&
    typeof position[0] === 'number' &&
    typeof position[1] === 'number' &&
    typeof position[2] === 'number'
  );
}

function clampHeight(height: number) {
  return height < 0 ? 0 : height;
}

export class OpennessAnalysis extends AnalysisBase {
  options: Required<Omit<OpennessAnalysisOptions, 'onPositionChange'>> & {
    onPositionChange?: (position?: OpennessViewPosition) => void;
  };
  viewDomeArray: any[];
  handler: any;
  pointEntity: any;
  longitude: number | undefined;
  latitude: number | undefined;
  height: number | undefined;
  private _refreshTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(viewer: any, options: OpennessAnalysisOptions = {}) {
    super(viewer);
    this.options = {
      ...getDefaultOptions(),
      ...options,
      viewPosition: isValidPosition(options.viewPosition)
        ? [...options.viewPosition]
        : getDefaultOptions().viewPosition
    };
    this.viewDomeArray = [];
    if (isValidPosition(options.viewPosition)) {
      this.setStoredPosition(options.viewPosition);
      this.renderPoint();
    }
  }

  get currentViewDome() {
    return this.viewDomeArray[this.viewDomeArray.length - 1];
  }

  get currentViewPosition(): OpennessViewPosition | undefined {
    if (
      typeof this.longitude === 'number' &&
      typeof this.latitude === 'number' &&
      typeof this.height === 'number'
    ) {
      return [this.longitude, this.latitude, this.height];
    }
    return undefined;
  }

  execute() {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D?.ScreenSpaceEventHandler || !this.scene?.pickPositionAsync) {
      throw new Error('SuperMap3D.ScreenSpaceEventHandler or scene.pickPositionAsync is not available');
    }
    this.enablePickStatus(true);
    this.initViewDome();
    this.destroyHandler();
    this.handler = new SuperMap3D.ScreenSpaceEventHandler(this.scene.canvas);
    this.handler.setInputAction((event: any) => {
      this.scene
        .pickPositionAsync(event.position)
        .then((cartesian: any) => {
          const position = this.normalizeCartesianPosition(cartesian);
          if (!position) {
            return;
          }
          this.enablePickStatus(false);
          this.setStoredPosition(position);
          this.updateCurrentViewDome(position);
          this.destroyHandler();
        })
        .catch(() => {
          this.enablePickStatus(false);
        });
    }, SuperMap3D.ScreenSpaceEventType.LEFT_CLICK);
  }

  clear() {
    this.clearPoint();
    const current = this.currentViewDome;
    if (!current) {
      this.destroyHandler();
      return;
    }
    current.destroy?.();
    this.viewDomeArray.pop();
    if (this.currentViewDome?.viewPosition) {
      this.setStoredPosition(this.currentViewDome.viewPosition);
      this.renderPoint();
    } else {
      this.longitude = undefined;
      this.latitude = undefined;
      this.height = undefined;
      this.options.onPositionChange?.();
    }
    this.destroyHandler();
  }

  destroy() {
    this.enablePickStatus(false);
    this.destroyHandler();
    this.clearPoint();
    this.viewDomeArray.forEach(viewDome => {
      viewDome?.destroy?.();
    });
    this.viewDomeArray = [];
    this.longitude = undefined;
    this.latitude = undefined;
    this.height = undefined;
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = undefined;
    }
  }

  setViewPosition(position: OpennessViewPosition) {
    if (!isValidPosition(position)) {
      return;
    }
    this.setStoredPosition(position);
    this.renderPoint();
    if (!this.currentViewDome) {
      return;
    }
    this.currentViewDome.viewPosition = [...position];
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
    }
    this._refreshTimer = setTimeout(() => {
      if (this.currentViewDome) {
        this.currentViewDome.startAngle = this.options.startAngle;
      }
    }, 500);
  }

  setDistance(distance: number) {
    if (distance <= 0) {
      return;
    }
    this.options.distance = distance;
    if (this.currentViewDome) {
      this.currentViewDome.distance = distance;
    }
  }

  setStartAngle(startAngle: number) {
    this.options.startAngle = startAngle;
    if (this.currentViewDome) {
      this.currentViewDome.startAngle = startAngle;
    }
  }

  setEndAngle(endAngle: number) {
    this.options.endAngle = endAngle;
    if (this.currentViewDome) {
      this.currentViewDome.endAngle = endAngle;
    }
  }

  setVisibleAreaColor(color: string) {
    this.options.visibleAreaColor = color;
    if (this.currentViewDome) {
      this.currentViewDome.visibleAreaColor = this.createAreaColor(color);
    }
  }

  setHiddenAreaColor(color: string) {
    this.options.hiddenAreaColor = color;
    if (this.currentViewDome) {
      this.currentViewDome.hiddenAreaColor = this.createAreaColor(color);
    }
  }

  setDisplayMode(mode: OpennessDisplayMode) {
    this.options.displayMode = mode;
    if (this.currentViewDome) {
      this.currentViewDome.domeType = this.normalizeDisplayMode(mode);
    }
  }

  setClosed(isClosed: boolean) {
    this.options.isClosed = isClosed;
    if (this.currentViewDome) {
      this.currentViewDome.isClosed = isClosed;
    }
  }

  private initViewDome() {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D?.ViewDome) {
      throw new Error('SuperMap3D.ViewDome is not available');
    }
    const viewDome = new SuperMap3D.ViewDome(this.scene);
    viewDome.distance = this.options.distance;
    viewDome.domeType = this.normalizeDisplayMode(this.options.displayMode);
    viewDome.visibleAreaColor = this.createAreaColor(this.options.visibleAreaColor);
    viewDome.hiddenAreaColor = this.createAreaColor(this.options.hiddenAreaColor);
    viewDome.startAngle = this.options.startAngle;
    viewDome.endAngle = this.options.endAngle;
    viewDome.isClosed = this.options.isClosed;
    this.viewDomeArray.push(viewDome);
  }

  private updateCurrentViewDome(position: OpennessViewPosition) {
    const current = this.currentViewDome;
    if (!current) {
      return;
    }
    current.viewPosition = [...position];
    current.build?.();
    this.renderPoint();
  }

  private renderPoint() {
    const SuperMap3D = window.SuperMap3D;
    if (!SuperMap3D?.Entity || !SuperMap3D?.PointGraphics || !SuperMap3D?.Cartesian3?.fromDegrees) {
      throw new Error('SuperMap3D point render dependencies are not available');
    }
    if (
      typeof this.longitude !== 'number' ||
      typeof this.latitude !== 'number' ||
      typeof this.height !== 'number'
    ) {
      return;
    }
    this.clearPoint();
    this.pointEntity = this.viewer.entities.add(
      new SuperMap3D.Entity({
        point: new SuperMap3D.PointGraphics({
          color: new SuperMap3D.Color(1, 0, 0),
          pixelSize: 6,
          outlineColor: new SuperMap3D.Color(0, 1, 1)
        }),
        position: SuperMap3D.Cartesian3.fromDegrees(
          this.longitude,
          this.latitude,
          this.height + 0.5
        )
      })
    );
  }

  private clearPoint() {
    if (this.pointEntity) {
      this.viewer.entities.remove(this.pointEntity);
      this.pointEntity = undefined;
    }
  }

  private setStoredPosition(position: OpennessViewPosition) {
    this.longitude = position[0];
    this.latitude = position[1];
    this.height = position[2];
    this.options.viewPosition = [...position];
    this.options.onPositionChange?.([...position]);
  }

  private normalizeCartesianPosition(cartesian: any): OpennessViewPosition | undefined {
    const SuperMap3D = window.SuperMap3D;
    const cartographic = SuperMap3D?.Cartographic?.fromCartesian?.(cartesian);
    if (!cartographic || !SuperMap3D?.Math?.toDegrees) {
      return undefined;
    }
    return [
      SuperMap3D.Math.toDegrees(cartographic.longitude),
      SuperMap3D.Math.toDegrees(cartographic.latitude),
      clampHeight(cartographic.height)
    ];
  }

  private createAreaColor(color: string) {
    const SuperMap3D = window.SuperMap3D;
    const baseColor = SuperMap3D?.Color?.fromCssColorString?.(color);
    if (!baseColor || !SuperMap3D?.Color?.fromAlpha) {
      throw new Error('SuperMap3D.Color is not available');
    }
    return SuperMap3D.Color.fromAlpha(baseColor, 0.5);
  }

  private normalizeDisplayMode(mode: OpennessDisplayMode) {
    const viewDomeType = window.SuperMap3D?.ViewDomeType;
    switch (mode) {
      case 0:
        return viewDomeType?.VISIBLEDOME ?? 0;
      case 1:
        return viewDomeType?.HIDDENDOME ?? 1;
      case 2:
      default:
        return viewDomeType?.ALLDOME ?? 2;
    }
  }

  private enablePickStatus(enabled: boolean) {
    const canvas = this.viewer?.canvas;
    if (!canvas?.classList) {
      return;
    }
    this.viewer.enableCursorStyle = !enabled;
    if (enabled) {
      this.viewer._element.style.cursor = '';
      document.body.classList.add('measureCur');
      canvas.classList.add('drawStatus');
      return;
    }
    document.body.classList.remove('measureCur');
    canvas.classList.remove('drawStatus');
  }

  private destroyHandler() {
    if (this.handler) {
      this.handler.removeInputAction?.(window.SuperMap3D?.ScreenSpaceEventType?.LEFT_CLICK);
      if (!this.handler.isDestroyed?.()) {
        this.handler.destroy();
      }
      this.handler = undefined;
    }
  }
}

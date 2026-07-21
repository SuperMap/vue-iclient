/**
 * 鼠标提示类。
 * DrawHandler 的 windowPosition 为画布坐标，需换算到挂载容器坐标系。
 */
class MouseTip {
  body: HTMLElement;
  canvas?: HTMLCanvasElement;
  _div!: HTMLElement;
  _title!: HTMLElement;
  message: string;
  private _useFixed: boolean;

  constructor(body: HTMLElement, canvas?: HTMLCanvasElement) {
    this.body = body;
    this.canvas = canvas;
    this.message = '';
    this._useFixed = body === document.body;
    this.init();
  }

  init(): void {
    const div = document.createElement('DIV');
    // is-left：提示在鼠标左侧，箭头朝右指向鼠标
    div.className = 'sm-scene-tooltip is-left';
    div.style.position = this._useFixed ? 'fixed' : 'absolute';
    div.style.zIndex = '10000';
    div.style.pointerEvents = 'none';

    this._div = div;
    this._title = div;
    this.body.appendChild(div);
  }

  setVisible(visible: boolean): void {
    this._div.style.display = visible ? 'block' : 'none';
    this._div.style.opacity = visible ? '1' : '0';
  }

  /** 将画布坐标转换为 tip 挂载容器的定位坐标 */
  private toContainerPosition(position: { x: number; y: number }): { x: number; y: number } {
    if (!this.canvas) {
      return { x: position.x, y: position.y };
    }
    const canvasRect = this.canvas.getBoundingClientRect();
    if (this._useFixed) {
      return {
        x: position.x + canvasRect.left,
        y: position.y + canvasRect.top
      };
    }
    const bodyRect = this.body.getBoundingClientRect();
    return {
      x: position.x + canvasRect.left - bodyRect.left,
      y: position.y + canvasRect.top - bodyRect.top
    };
  }

  showAt(position: { x: number; y: number }, message: string): void {
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this.message = message;
      const { x, y } = this.toContainerPosition(position);
      const tipWidth = this._div.clientWidth || 0;
      // 提示放在鼠标左侧
      this._div.style.left = `${x - tipWidth - 10}px`;
      this._div.style.top = `${y - this._div.clientHeight / 2}px`;
    }
  }

  destroy(): void {
    this.setVisible(false);
  }
}

/**
 * 绘制处理器配置。
 */
export interface DrawHandlerOptions {
  /** 是否启用鼠标提示框。 */
  openMouseTip?: boolean;
  /** 是否使用内置默认提示文案。 */
  useDefaultTip?: boolean;
  /** 自定义提示文案。 */
  tipContent?: {
    /** 绘制点位时显示的提示。 */
    pointMoving?: string;
    /** 绘制折线过程中显示的提示。 */
    polylineMoving?: string;
    /** 绘制折线结束前显示的提示。 */
    polylineFinish?: string;
    /** 绘制多边形过程中显示的提示。 */
    polygonMoving?: string;
    /** 绘制多边形结束前显示的提示。 */
    polygonFinish?: string;
  };
  /** 提示框挂载的容器元素。 */
  body?: HTMLElement;
}

/**
 * 默认提示文案集合。
 */
export interface DefaultTipContent {
  /** 绘制点位时显示的提示。 */
  pointMoving: string;
  /** 绘制折线过程中显示的提示。 */
  polylineMoving: string;
  /** 绘制折线结束前显示的提示。 */
  polylineFinish: string;
  /** 绘制多边形过程中显示的提示。 */
  polygonMoving: string;
  /** 绘制多边形结束前显示的提示。 */
  polygonFinish: string;
}

/**
 * 一次绘制操作返回的结果。
 */
export interface DrawHandlerResult {
  /** 当前绘制生成的对象信息。 */
  object?: {
    /** 点对象的坐标。 */
    position?: any;
    /** 线或面的坐标集合。 */
    positions?: any[];
  };
  /** 返回的坐标集合。 */
  positions?: any[];
}

/**
 * 场景绘制处理器，负责点、线、面的交互式拾取与结果返回。
 */
export class DrawHandler {
  viewer: any;
  handlerPoint: any;
  handlePolyline: any;
  handlePolygon: any;
  isDrawing: boolean;
  mouseTip: MouseTip;
  handlerRightClick: any;
  openMouseTip: boolean;
  useDefaultTip: boolean;
  tipContent?: {
    pointMoving?: string;
    polylineMoving?: string;
    polylineFinish?: string;
    polygonMoving?: string;
    polygonFinish?: string;
  };
  defaultTipContent: DefaultTipContent;
  private _pointResolve: ((value: any) => void) | null = null;
  private _polylineResolve: ((value: any) => void) | null = null;
  private _polygonResolve: ((value: any) => void) | null = null;

  constructor(viewer: any, options?: DrawHandlerOptions) {
    this.viewer = viewer;
    this.handlerPoint = null;
    this.handlePolyline = null;
    this.handlePolygon = null;
    this.isDrawing = false;
    // 默认挂到场景容器，与 DrawHandler 的画布坐标一致，避免提示偏离鼠标
    const body = options?.body ? options.body : viewer?.container || document.body;
    this.mouseTip = new MouseTip(body, viewer?.scene?.canvas);
    this.handlerRightClick = new window.SuperMap3D.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.defaultTipContent = {
      pointMoving: '点击左键添加',
      polylineMoving: '点击左键添加线节点，点击右键结束绘制',
      polylineFinish: '点击左键继续添加节点，点击右键获取线节点数据',
      polygonMoving: '点击左键添加面节点，点击右键结束绘制',
      polygonFinish: '点击左键继续添加节点，点击右键获取面节点数据'
    };
    this.openMouseTip = true;
    this.useDefaultTip = true;
    this.init(options);
  }

  init(parmas: DrawHandlerOptions = {}): void {
    this.openMouseTip = parmas.openMouseTip === false ? false : true;
    this.useDefaultTip = parmas.useDefaultTip === false ? false : true;
    this.tipContent = parmas.tipContent;

    const SuperMap3D = window.SuperMap3D;

    // 新增右键结束事件
    this.handlerRightClick.setInputAction(
      () => {
        this.setMouseCursor('normal');
        this.mouseTip.setVisible(false);
        this.isDrawing = false;

        // 关闭点绘制
        if (this.handlerPoint) {
          this.closePoint();
        }

        // 关闭线绘制
        if (this.handlePolyline && this.handlePolyline.positions.length <= 1) {
          this.closePolyline();
        }

        // 关闭面绘制（点数不足时取消并结束 Promise）
        if (this.handlePolygon && this.handlePolygon.positions.length <= 2) {
          this.closePolygon();
        }
      },
      SuperMap3D.ScreenSpaceEventType.RIGHT_CLICK
    );
  }
  // 开启绘制点
  startPoint(): Promise<any> {
    this.isDrawing = true;
    const SuperMap3D = window.SuperMap3D;
    return new Promise((resolve, reject) => {
      try {
        this.closePoint(); // 先销毁之前的，再重新创建
        this._pointResolve = resolve;
        const clampmode = 0; // 是否贴地贴模型：todo...
        this.handlerPoint = new SuperMap3D.DrawHandler(this.viewer, SuperMap3D.DrawMode.Point, clampmode);
        this.handlerPoint.activeEvt.addEventListener((isActive: boolean) => {
          if (isActive === true) {
            this.setMouseCursor('measureCur');
          } else {
            this.setMouseCursor('normal');
          }
        });

        this.handlerPoint.movingEvt.addEventListener((windowPosition: any) => {
          if (this.openMouseTip) {
            const tipContent = this.computedMouseTipContent('point');
            tipContent && tipContent !== '' ? this.mouseTip.showAt(windowPosition, `<p>${tipContent}</p>`) : this.mouseTip.setVisible(false);
          }
        });

        this.handlerPoint.drawEvt.addEventListener((result: DrawHandlerResult) => {
          this.handlerPoint.point.show = false;
          this.handlerPoint.deactivate();
          this.mouseTip.setVisible(false);
          this.isDrawing = false;
          this._pointResolve = null;
          // 对数据做简单处理在返回：直接返回对应坐标
          if (result && result.object && result.object.position) {
            const newArray = [].concat(result.object.position); // 重新创建一个坐标数组，避免引用清空
            resolve(newArray[0]);
          } else {
            resolve(undefined);
          }
        });

        this.handlerPoint.activate();
      } catch (error) {
        this._pointResolve = null;
        reject(error);
      }
    });
  }

  closePoint(): void {
    this.setMouseCursor('normal');
    this.mouseTip.setVisible(false);
    if (this.handlerPoint) {
      this.handlerPoint.deactivate();
      this.handlerPoint.clear();
    }
    if (this._pointResolve) {
      this._pointResolve(undefined);
      this._pointResolve = null;
    }
  }

  // 开启绘制线
  startPolyline(): Promise<any> {
    this.isDrawing = true;
    const SuperMap3D = window.SuperMap3D;

    return new Promise((resolve, reject) => {
      try {
        this.closePolyline(); // 先销毁之前的，再重新创建
        this._polylineResolve = resolve;

        const clampmode = 0; // 是否贴地贴模型：todo...
        this.handlePolyline = new SuperMap3D.DrawHandler(this.viewer, SuperMap3D.DrawMode.Line, clampmode);
        this.handlePolyline.activeEvt.addEventListener((isActive: boolean) => {
          if (isActive === true) {
            this.setMouseCursor('drawCur');
          } else {
            this.setMouseCursor('normal');
          }
        });

        this.handlePolyline.movingEvt.addEventListener((windowPosition: any) => {
          if (this.openMouseTip) {
            const tipContent = this.computedMouseTipContent('polyline');
            tipContent && tipContent !== '' ? this.mouseTip.showAt(windowPosition, `<p>${tipContent}</p>`) : this.mouseTip.setVisible(false);
          }
        });

        this.handlePolyline.drawEvt.addEventListener((result: DrawHandlerResult) => {
          this.handlePolyline.polyline.show = false;
          this.handlePolyline.deactivate();
          this.mouseTip.setVisible(false);
          this.isDrawing = false;
          this._polylineResolve = null;

          // 直接返回坐标
          if (result && result.positions) {
            const newArray = [].concat(result.positions);
            resolve(newArray);
          } else if (result && result.object.positions) {
            const newArray = [].concat(result.object.positions);
            resolve(newArray);
          } else {
            resolve(undefined);
          }
        });

        this.handlePolyline.activate();
      } catch (error) {
        this._polylineResolve = null;
        reject(error);
      }
    });
  }

  closePolyline(): void {
    this.setMouseCursor('normal');
    this.mouseTip.setVisible(false);
    if (this.handlePolyline) {
      this.handlePolyline.deactivate();
      this.handlePolyline.clear();
    }
    if (this._polylineResolve) {
      this._polylineResolve(undefined);
      this._polylineResolve = null;
    }
  }

  // 开启绘制面
  startPolygon(): Promise<any> {
    this.isDrawing = true;
    const SuperMap3D = window.SuperMap3D;

    return new Promise((resolve, reject) => {
      try {
        this.closePolygon(); // 先销毁之前的，再重新创建
        this._polygonResolve = resolve;

        const clampmode = 0; // 是否贴地贴模型：todo...
        this.handlePolygon = new SuperMap3D.DrawHandler(this.viewer, SuperMap3D.DrawMode.Polygon, clampmode);
        this.handlePolygon.activeEvt.addEventListener((isActive: boolean) => {
          if (isActive === true) {
            this.setMouseCursor('drawCur');
          } else {
            this.setMouseCursor('normal');
          }
        });

        this.handlePolygon.movingEvt.addEventListener((windowPosition: any) => {
          if (this.openMouseTip) {
            const tipContent = this.computedMouseTipContent('polygon');
            tipContent && tipContent !== '' ? this.mouseTip.showAt(windowPosition, `<p>${tipContent}</p>`) : this.mouseTip.setVisible(false);
          }
        });

        this.handlePolygon.drawEvt.addEventListener((result: DrawHandlerResult) => {
          this.handlePolygon.polygon.show = false;
          this.handlePolygon.polyline.show = false;
          this.handlePolygon.deactivate();
          this.mouseTip.setVisible(false);
          this.isDrawing = false;
          this._polygonResolve = null;

          // 优先使用 entity 上的 positions（与官方限高体示例一致）
          const rawPositions = result?.object?.positions ?? result?.positions;
          if (rawPositions && rawPositions.length) {
            resolve(Array.from(rawPositions));
          } else {
            resolve(undefined);
          }
        });

        this.handlePolygon.activate();
      } catch (error) {
        this._polygonResolve = null;
        reject(error);
      }
    });
  }

  closePolygon(): void {
    this.setMouseCursor('normal');
    this.mouseTip.setVisible(false);
    if (this.handlePolygon) {
      this.handlePolygon.deactivate();
      this.handlePolygon.clear();
    }
    if (this._polygonResolve) {
      this._polygonResolve(undefined);
      this._polygonResolve = null;
    }
  }

  // 计算鼠标移动时的显示内容
  computedMouseTipContent(type: string): string | undefined {
    if (!type) return;

    let tipContent: string | undefined;

    if (type === 'polyline') {
      if (!this.handlePolyline && !this.handlePolyline.active) return '';
      if (this.handlePolyline.positions.length <= 1) {
        tipContent = this.useDefaultTip ? this.defaultTipContent.polylineMoving : this.tipContent?.polylineMoving;
      } else {
        tipContent = this.useDefaultTip ? this.defaultTipContent.polylineFinish : this.tipContent?.polylineFinish;
      }
    } else if (type === 'polygon') {
      if (!this.handlePolygon && !this.handlePolygon.active) return '';
      if (this.handlePolygon.positions.length <= 2) {
        tipContent = this.useDefaultTip ? this.defaultTipContent.polygonMoving : this.tipContent?.polygonMoving;
      } else {
        tipContent = this.useDefaultTip ? this.defaultTipContent.polygonFinish : this.tipContent?.polygonFinish;
      }
    } else if (type === 'point') {
      if (!this.handlerPoint && !this.handlerPoint.active) return '';
      tipContent = this.useDefaultTip ? this.defaultTipContent.pointMoving : this.tipContent?.pointMoving;
    } else {
      tipContent = '计算失败';
    }

    return tipContent;
  }

  // 设置鼠标样式
  setMouseCursor(type: string): void {
    if (!this.viewer) return;
    const container = this.viewer.container as HTMLElement | undefined;
    const element = this.viewer._element as HTMLElement | undefined;
    const canvas = this.viewer.scene?.canvas as HTMLElement | undefined;
    const applyCursor = (cursor: string) => {
      document.body.style.cursor = cursor;
      if (container) container.style.cursor = cursor;
      if (element) element.style.cursor = cursor;
      if (canvas) canvas.style.cursor = cursor;
    };

    if (type === 'normal') {
      this.viewer.enableCursorStyle = true;
      applyCursor('');
    } else if (type === 'drawCur') {
      this.viewer.enableCursorStyle = false;
      applyCursor('crosshair');
    } else if (type === 'measureCur') {
      this.viewer.enableCursorStyle = false;
      applyCursor('crosshair');
    } else {
      this.viewer.enableCursorStyle = true;
      applyCursor('');
    }
  }

  // 获取当前绘制状态
  getIsDrawing(): boolean {
    return this.isDrawing;
  }

  // 清除点线面
  clear(): void {
    this.isDrawing = false;
    this.setMouseCursor('normal');
    this.mouseTip.setVisible(false);
    this.closePoint();
    this.closePolyline();
    this.closePolygon();
  }

  // 销毁点线面
  destroy(): void {
    this.clear();

    this.handlerPoint = null;
    this.handlePolyline = null;
    this.handlePolygon = null;

    const SuperMap3D = window.SuperMap3D;
    this.handlerRightClick.removeInputAction(SuperMap3D.ScreenSpaceEventType.RIGHT_CLICK);
  }
}

/**
 * 鼠标提示类
 */
class MouseTip {
  body: HTMLElement;
  _div!: HTMLElement;
  _title!: HTMLElement;
  message: string;

  constructor(body: HTMLElement) {
    this.body = body;
    this.message = '';
    this.init();
  }

  init(): void {
    const div = document.createElement('DIV');
    div.className = 'twipsy right';

    const arrow = document.createElement('DIV');
    arrow.className = 'twipsy-arrow';
    div.appendChild(arrow);

    const title = document.createElement('DIV');
    title.className = 'twipsy-inner';
    div.appendChild(title);

    this._div = div;
    this._title = title;

    // add to frame div and display coordinates
    this.body.appendChild(div);
    const that = this;
    div.onmousemove = function (evt: MouseEvent) {
      that.showAt({ x: evt.clientX, y: evt.clientY }, that.message);
    };
  }

  setVisible(visible: boolean): void {
    this._div.style.display = visible ? 'block' : 'none';
  }

  showAt(position: { x: number; y: number }, message: string): void {
    if (position && message) {
      this.setVisible(true);
      this._title.innerHTML = message;
      this._div.style.left = position.x + 10 + 'px';
      this._div.style.top = position.y - this._div.clientHeight / 2 + 'px';
      this.message = message;
    }
  }

  destroy(): void {
    this.setVisible(false);
  }
}

export interface DrawHandlerOptions {
  openMouseTip?: boolean;
  useDefaultTip?: boolean;
  tipContent?: {
    pointMoving?: string;
    polylineMoving?: string;
    polylineFinish?: string;
    polygonMoving?: string;
    polygonFinish?: string;
  };
  body?: HTMLElement;
}

export interface DefaultTipContent {
  pointMoving: string;
  polylineMoving: string;
  polylineFinish: string;
  polygonMoving: string;
  polygonFinish: string;
}

export interface DrawHandlerResult {
  object?: {
    position?: any;
    positions?: any[];
  };
  positions?: any[];
}

export  class DrawHandler {
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

  constructor(viewer: any, options?: DrawHandlerOptions) {
    this.viewer = viewer;
    this.handlerPoint = null;
    this.handlePolyline = null;
    this.handlePolygon = null;
    this.isDrawing = false;
    const body = options?.body ? options.body : document.body;
    this.mouseTip = new MouseTip(body);
    this.handlerRightClick = new window.SuperMap3D.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.defaultTipContent = {
      pointMoving: '点击左键添加，点击右键结束',
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

        // 关闭面绘制
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
  }

  // 开启绘制线
  startPolyline(): Promise<any> {
    this.isDrawing = true;
    const SuperMap3D = window.SuperMap3D;

    return new Promise((resolve, reject) => {
      try {
        this.closePolyline(); // 先销毁之前的，再重新创建

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
  }

  // 开启绘制面
  startPolygon(): Promise<any> {
    this.isDrawing = true;
    const SuperMap3D = window.SuperMap3D;

    return new Promise((resolve, reject) => {
      try {
        this.closePolygon(); // 先销毁之前的，再重新创建

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

        this.handlePolygon.activate();
      } catch (error) {
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
    if (type === 'normal') {
      this.viewer.enableCursorStyle = true;
      document.body.classList.remove('measureCur');
      document.body.classList.remove('drawCur');
    } else if (type === 'drawCur') {
      this.viewer.enableCursorStyle = false;
      this.viewer._element.style.cursor = '';
      document.body.classList.add('drawCur');
    } else if (type === 'measureCur') {
      this.viewer.enableCursorStyle = false;
      this.viewer._element.style.cursor = '';
      document.body.classList.add('measureCur');
    } else {
      this.viewer.enableCursorStyle = true;
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

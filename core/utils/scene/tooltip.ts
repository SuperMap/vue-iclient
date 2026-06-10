interface TooltipOptions {
  className?: string;
  offsetX?: number;
  offsetY?: number;
}

interface ScreenPosition {
  x: number;
  y: number;
}

export class Tooltip {
  viewer: any;
  scene: any;
  container: HTMLElement;
  tooltipDiv: HTMLElement;
  offsetX: number;
  offsetY: number;
  isVisible: boolean;

  /**
   * @param viewer - SuperMap3D.Viewer 实例，用于坐标转换和获取场景
   * @param options - 配置项
   * @param options.className - 自定义CSS类名，用于覆盖默认样式
   * @param options.offsetX - X轴偏移量(像素) 默认15
   * @param options.offsetY - Y轴偏移量(像素) 默认15
   */
  constructor(viewer: any, options: TooltipOptions = {}) {
    if (!viewer || !viewer.scene) {
      throw new Error('Tooltip: 需要传入有效的 Viewer 实例');
    }
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.container = viewer.container;
    this.offsetX = options.offsetX !== undefined ? options.offsetX : 15;
    this.offsetY = options.offsetY !== undefined ? options.offsetY : 15;
    this.isVisible = false;

    this.tooltipDiv = document.createElement('div');
    this.tooltipDiv.className = options.className || 'sm-scene-tooltip';

    this.container.appendChild(this.tooltipDiv);
  }

  /**
   * 核心显示方法
   * @param position - 屏幕坐标 {x, y}
   * @param htmlString - 要显示的HTML内容
   * @returns 是否成功显示
   */
  showAt(position: ScreenPosition, htmlString: string): boolean {
    if (!position) return false;

    this.tooltipDiv.innerHTML = htmlString;
    this.updatePosition(position.x, position.y);
    this.setVisible(true);
    return true;
  }

  /**
   * 更新tooltip的位置 (相对于视口)，带边缘检测
   * @param screenX - 屏幕X坐标
   * @param screenY - 屏幕Y坐标
   */
  updatePosition(screenX: number, screenY: number): void {
    const rect = this.tooltipDiv.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const canvasRect = this.scene.canvas.getBoundingClientRect();
    let left = canvasRect.left + screenX + this.offsetX;
    let top = canvasRect.top + screenY + this.offsetY;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left + width > viewportWidth - 5) {
      left = screenX - width - this.offsetX;
      if (left < 5) left = 5;
    }
    if (top + height > viewportHeight - 5) {
      top = screenY - height - this.offsetY;
      if (top < 5) top = 5;
    }

    this.tooltipDiv.style.left = left + 'px';
    this.tooltipDiv.style.top = top + 'px';
  }

  /**
   * 仅更新提示框内容
   * @param htmlString - HTML内容
   */
  setContent(htmlString: string): void {
    this.tooltipDiv.innerHTML = htmlString;
  }

  /**
   * 控制显隐
   * @param visible - 是否显示
   */
  setVisible(visible: boolean): void {
    // this.isVisible = visible;
    // if (visible) {
    //   this.tooltipDiv.style.visibility = 'visible';
    //   this.tooltipDiv.style.opacity = '1';
    // } else {
    //   this.tooltipDiv.style.visibility = 'hidden';
    //   this.tooltipDiv.style.opacity = '0';
    // }
  }

  /**
   * 销毁tooltip，移除DOM元素
   */
  destroy(): void {
    if (this.tooltipDiv && this.tooltipDiv.parentNode) {
      this.tooltipDiv.parentNode.removeChild(this.tooltipDiv);
    }
  }
}

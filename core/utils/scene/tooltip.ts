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
  tooltipDiv: HTMLDivElement;
  offsetX: number;
  offsetY: number;
  arrowOffset: number;
  isVisible: boolean;

  constructor(viewer: any, options: TooltipOptions = {}) {
    if (!viewer || !viewer.scene || !viewer.container) {
      throw new Error('Tooltip: 需要传入有效的 Viewer 实例');
    }
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.container = viewer.container;
    this.offsetX = options.offsetX ?? 16;
    this.offsetY = options.offsetY ?? 0;
    this.arrowOffset = 8;
    this.isVisible = false;

    const div = document.createElement('div');
    div.className = options.className || 'sm-scene-tooltip';
    this.tooltipDiv = div;
    this.container.appendChild(div);
  }

  showAt(position: ScreenPosition, htmlString: string): boolean {
    if (!position || !htmlString) {
      return false;
    }
    this.tooltipDiv.innerHTML = htmlString;
    this.setVisible(true);
    this.updatePosition(position.x, position.y);
    return true;
  }

  updatePosition(screenX: number, screenY: number): void {
    const tooltipWidth = this.tooltipDiv.offsetWidth;
    const tooltipHeight = this.tooltipDiv.offsetHeight;
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    let left = screenX + this.offsetX + this.arrowOffset;
    let top = screenY - tooltipHeight / 2 + this.offsetY;

    if (left + tooltipWidth > containerWidth - 5) {
      left = screenX - tooltipWidth - this.offsetX - this.arrowOffset;
    }
    if (left < 5) {
      left = 5;
    }

    if (top + tooltipHeight > containerHeight - 5) {
      top = containerHeight - tooltipHeight - 5;
    }
    if (top < 5) {
      top = 5;
    }

    this.tooltipDiv.style.left = `${left}px`;
    this.tooltipDiv.style.top = `${top}px`;
  }

  setContent(htmlString: string): void {
    this.tooltipDiv.innerHTML = htmlString;
  }

  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (visible) {
      this.tooltipDiv.style.display = 'block';
      this.tooltipDiv.style.opacity = '1';
      return;
    }
    this.tooltipDiv.style.display = 'none';
    this.tooltipDiv.style.opacity = '0';
  }

  remove(): void {
    if (this.tooltipDiv && this.tooltipDiv.parentNode) {
      this.tooltipDiv.parentNode.removeChild(this.tooltipDiv);
    }
  }

  destroy(): void {
    this.remove();
  }
}

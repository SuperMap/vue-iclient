/// <reference path="../../types/supermap3d.d.ts" />

/**
 * 多视口分屏类
 * 支持 window.SuperMap3D.MultiViewportMode   'QUAD', 'TRIPLE', 'VerticalTrisection', 'NONE', 'HORIZONTAL', 'VERTICAL'
 */

interface DividersStyleConfig {
  [key: string]: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
    width?: string;
    height?: string;
    transform?: string;
  };
}

// 每个视口的个数
export const modeCount: Record<string, number> = {
  NONE: 1,
  HORIZONTAL: 2,
  VERTICAL: 2,
  QUAD: 4,
  TRIPLE: 3,
  VerticalTrisection: 3
};

export const dividersStyleConfig: DividersStyleConfig = {
  sm_split_up: {
    left: '50%',
    bottom: '50%',
    width: '2px',
    height: '50%',
    transform: 'translate(-50%, 0)'
  },
  sm_split_bottom: {
    left: '50%',
    top: '50%',
    width: '2px',
    height: '50%',
    transform: 'translate(-50%, 0)'
  },
  sm_split_left: {
    right: '50%',
    bottom: '50%',
    height: '2px',
    width: '50%',
    transform: 'translate(0, -50%)'
  },
  sm_split_right: {
    left: '50%',
    bottom: '50%',
    height: '2px',
    width: '50%',
    transform: 'translate(0, -50%)'
  },
  sm_split_vertical_trisection_left: {
    left: '33.33%',
    top: '0',
    height: '100%',
    width: '2px'
  },
  sm_split_vertical_trisection_right: {
    right: '33.33%',
    top: '0',
    height: '100%',
    width: '2px'
  }
};

interface Viewer {
  container: HTMLElement;
  scene: {
    multiViewportMode: number;
  };
}

export class SplitScreen {
  viewer: Viewer;
  parent: HTMLElement;
  divs: Record<string, HTMLElement>;
  currentType: string;

  constructor(viewer: Viewer) {
    if (!viewer) throw new Error('viewer is required');
    const supermap3d = window.SuperMap3D;
    if (!supermap3d) throw new Error('SuperMap3D is not loaded');
    this.viewer = viewer;
    this.currentType = 'NONE';
    // 初始化时设置为 NONE 模式
    this.setViewportType(this.currentType);
    this.parent = this.viewer.container.parentElement!;
    this.divs = {};
    // 确保父容器相对定位
    const pos = window.getComputedStyle(this.parent).position;
    if (!['relative', 'absolute', 'fixed'].includes(pos)) {
      this.parent.style.position = 'relative';
    }

    this._createDividers();
  }

  // 获取当前分屏模式下的视口数量
  getViewModeCount(type = this.currentType): number {
    return modeCount[type] || 1;
  }

  // 获取当前分屏模式下的默认视口索引
  getViewportIndices(type = this.currentType): number[] {
    const count = this.getViewModeCount(type);
    return Array.from({ length: count }, (_, i) => i);
  }

  getCurrentType(): string {
    return this.currentType;
  }

  /**
   * 设置分屏模式
   * @param type - 模式名称，如 'QUAD', 'TRIPLE', 'VerticalTrisection' 等
   */
  setViewportType(type: string): void {
    if (type === this.currentType) return;
    const supermap3d = window.SuperMap3D;
    // 设置场景多视口模式
    const modeEnum = supermap3d.MultiViewportMode[type];
    if (modeEnum !== undefined && this.viewer.scene) {
      this.viewer.scene.multiViewportMode = modeEnum;
    } else {
      console.warn(`Unsupported or invalid MultiViewportMode: ${type}`);
      this.viewer.scene.multiViewportMode = supermap3d.MultiViewportMode.NONE;
      return;
    }
    this.currentType = type;
    this.showDividers(type);
  }

  /**
   * 设置图层在某（些）视口中的可见性
   * @param layer - 图层对象（需有 setVisibleInViewport 方法）
   * @param viewportIndices - 视口索引 0~3
   * @param visible - 是否可见
   */
  setLayerVisibility(
    layer: { setVisibleInViewport: (index: number, visible: boolean) => void },
    viewportIndices: number | number[],
    visible: boolean
  ): void {
    if (!layer || typeof layer.setVisibleInViewport !== 'function') {
      console.error('Invalid layer or missing setVisibleInViewport method');
      return;
    }
    const indices = Array.isArray(viewportIndices) ? viewportIndices : [viewportIndices];
    indices.forEach(idx => {
      if (idx >= 0 && idx <= 3) {
        layer.setVisibleInViewport(idx, visible);
      } else {
        console.warn(`Invalid viewport index: ${idx}`);
      }
    });
  }

  /**
   * 删除图层（在所有视口中隐藏）
   */
  removeLayer(
    layer: { setVisibleInViewport?: (index: number, visible: boolean) => void }
  ): void {
    if (!layer) return;
    for (let i = 0; i < 4; i++) {
      if (layer.setVisibleInViewport) {
        try {
          layer.setVisibleInViewport(i, false);
        } catch (e) {
          console.warn(`Failed to hide layer in viewport ${i}:`, e);
        }
      }
    }
  }

  /**
   * 创建所有分割线 DOM，并应用样式
   * @private
   */
  _createDividers(config: DividersStyleConfig = dividersStyleConfig): void {
    const commonStyle = {
      position: 'absolute',
      backgroundColor: 'white',
      pointerEvents: 'none',
      zIndex: '100',
      display: 'none'
    };
    for (const [id, styles] of Object.entries(config)) {
      let div = document.getElementById(id);
      if (!div) {
        div = document.createElement('div');
        div.id = id;
        Object.assign(div.style, styles, commonStyle);
        this.parent.appendChild(div);
      }
      this.divs[id] = div;
    }
  }

  /**
   * 显示指定的分割线，隐藏其他所有分割线
   * @param divIds - 需要显示的分割线 ID 数组
   */
  show(divIds: string[] = []): void {
    // 先隐藏所有
    this.hide(this.divs);
    // 显示指定的
    divIds.forEach(id => {
      if (this.divs[id]) {
        this.divs[id].style.display = 'block';
      }
    });
  }

  /**
   * 隐藏所有分割线
   */
  hide(divs: Record<string, HTMLElement> = this.divs): void {
    Object.values(divs).forEach(div => {
      div.style.display = 'none';
    });
  }

  /**
   * 根据分屏模式统一显示对应的分割线
   * @param mode - 分屏模式
   */
  showDividers(mode: string): void {
    switch (mode) {
      case 'NONE':
        this.show([]);
        break;
      case 'HORIZONTAL':
        this.show(['sm_split_up', 'sm_split_bottom']);
        break;
      case 'VERTICAL':
        this.show(['sm_split_left', 'sm_split_right']);
        break;
      case 'TRIPLE':
        this.show(['sm_split_up', 'sm_split_left', 'sm_split_right']);
        break;
      case 'VerticalTrisection':
        this.show(['sm_split_vertical_trisection_left', 'sm_split_vertical_trisection_right']);
        break;
      default: // QUAD 或其他
        this.show(['sm_split_up', 'sm_split_bottom', 'sm_split_left', 'sm_split_right']);
        break;
    }
  }

  destroy(): void {
    Object.values(this.divs).forEach(div => div.remove());
    this.divs = {};
  }
}

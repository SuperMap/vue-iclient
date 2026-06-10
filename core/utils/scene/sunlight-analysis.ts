import { AnalysisBase } from './common-analysis';
import { Tooltip } from './tooltip';

/**
 * 日照分析配置选项
 */
export interface SunlightAnalysisOptions {
  /** 分析日期，格式 YYYY-MM-DD */
  date?: string;
  /** 开始时间（小时），0-24 */
  startTime?: number;
  /** 结束时间（小时），0-24 */
  endTime?: number;
  /** 显示模式，0:日照模式，1:阴影模式 */
  displayMode?: number;
  /** 预设色带 '1'~'5' 或自定义颜色数组 */
  sunshineColor?: {
    value: number;
    color: { red: number; green: number; blue: number; alpha?: number };
  }[];
  /** 阴影分析最远距离（米） */
  maxDistance?: number;
}

/**
 * 日照分析核心类（纯逻辑，Viewer 外部传入，不负责场景初始化）
 * 依赖：SuperMap3D (全局)
 */
export class SunlightAnalysis extends AnalysisBase {
  sunlightAnalysis: any;
  private _cachedStartHour: number | undefined;
  private _cachedEndHour: number | undefined;
  private _screenSpaceEventHandler: any;
  tooltip: Tooltip;

  /**
   * @param viewer - 已初始化的 SuperMap3D.Viewer 实例（场景已包含建筑物模型）
   * @param options - 可选配置项
   */
  constructor(viewer: any, options: SunlightAnalysisOptions = {}) {
    super(viewer);
    this.sunlightAnalysis = this.scene.sunlightAnalysis;

    // 应用配置选项
    if (options.date) this.setDate(options.date);
    if (options.startTime !== undefined) this.setStartTime(options.startTime);
    if (options.endTime !== undefined) this.setEndTime(options.endTime);
    if (options.displayMode !== undefined) this.setDisplayMode(options.displayMode);
    if (options.sunshineColor) this.setSunshineColor(options.sunshineColor);
    if (options.maxDistance !== undefined) this.setMaxDistance(options.maxDistance);
    this.init();
  }

  /**
   * 初始化日照分析功能, 设置图层阴影模式
   */
  init(): void {
    this._initAllLayersShadow();
    this.startMouseEventListener();
  }

  /**
   * 初始化所有图层（所有模型都产生阴影）
   */
  _initAllLayersShadow(): void {
    const layerArr = this.scene.layers.layerQueue;
    console.log(layerArr);
    layerArr?.forEach((layer: any) => {
      layer.shadowType = 2;
    });
  }

  /**
   * 清除所有图层的阴影
   */
  _clearLayersShadow(): void {
    const layerArr = this.scene.layers.layerQueue;
    console.log(layerArr);
    layerArr?.forEach((layer: any) => {
      layer.shadowType = window.SuperMap3D.ShadowType.NONE;
    });
  }
  /**
   * 设置分析日期
   * @param dateStr - 格式 YYYY-MM-DD
   */
  setDate(dateStr: string): void {
    if (!this.sunlightAnalysis) return;
    const startHour = this.getStartTime();
    const endHour = this.getEndTime();
    const startDate = new Date(dateStr);
    startDate.setHours(startHour);
    this.sunlightAnalysis.startTime = window.SuperMap3D.JulianDate.fromDate(startDate);
    const endDate = new Date(dateStr);
    endDate.setHours(endHour);
    this.sunlightAnalysis.endTime = window.SuperMap3D.JulianDate.fromDate(endDate);
  }

  /**
   * 设置开始时间（小时）
   * @param hour - 0-24
   */
  setStartTime(hour: number): void {
    if (!this.sunlightAnalysis) return;
    const currentStart = this.sunlightAnalysis.startTime;
    const date = currentStart ? window.SuperMap3D.JulianDate.toDate(currentStart) : new Date();
    date.setHours(hour);
    this.sunlightAnalysis.startTime = window.SuperMap3D.JulianDate.fromDate(date);
    this._cachedStartHour = hour;
  }

  /**
   * 获取当前开始时间（小时）
   */
  getStartTime(): number {
    if (this._cachedStartHour !== undefined) return this._cachedStartHour;
    if (this.sunlightAnalysis && this.sunlightAnalysis.startTime) {
      const date = window.SuperMap3D.JulianDate.toDate(this.sunlightAnalysis.startTime);
      return date.getHours();
    }
    return 10;
  }

  /**
   * 设置结束时间（小时）
   * @param hour - 0-24
   */
  setEndTime(hour: number): void {
    if (!this.sunlightAnalysis) return;
    const currentEnd = this.sunlightAnalysis.endTime;
    const date = currentEnd ? window.SuperMap3D.JulianDate.toDate(currentEnd) : new Date();
    date.setHours(hour);
    this.sunlightAnalysis.endTime = window.SuperMap3D.JulianDate.fromDate(date);
    this._cachedEndHour = hour;
  }

  /**
   * 获取当前结束时间（小时）
   */
  getEndTime(): number {
    if (this._cachedEndHour !== undefined) return this._cachedEndHour;
    if (this.sunlightAnalysis && this.sunlightAnalysis.endTime) {
      const date = window.SuperMap3D.JulianDate.toDate(this.sunlightAnalysis.endTime);
      return date.getHours();
    }
    return 18;
  }

  /**
   * 设置显示模式
   * @param mode - 0:日照模式，1:阴影模式
   */
  setDisplayMode(mode: number): void {
    if (!this.sunlightAnalysis) return;
    this.sunlightAnalysis.displayMode = mode;
  }

  /**
   * 设置颜色表（用于日照模式）
   * @param colors - 自定义颜色数组 [{ value: number; color: string }]
   */
  setSunshineColor(
    colors: { value: number; color: { red: number; green: number; blue: number; alpha?: number } }[]
  ): void {
    if (!this.sunlightAnalysis) return;
    const ct = new window.SuperMap3D.ColorTable();
    this._applyColorTablePreset(ct, colors);
    this.setColorTable(ct);
  }

  /**
   * 设置颜色表（用于日照模式）
   * @param colorTable - 颜色表实例
   */
  setColorTable(colorTable) {
    this.sunlightAnalysis?.setColorTable(colorTable);
  }

  /**
   * 设置单色（用于阴影模式）
   * @param cssColor - CSS 颜色字符串，如 '#ff0000' 或 'rgba(255,0,0,0.5)'
   */
  setVisualizationColor(cssColor: string): void {
    if (!this.sunlightAnalysis) return;
    const color = window.SuperMap3D.Color.fromCssColorString(cssColor);
    this.sunlightAnalysis.visualizationColor = color;
  }

  /**
   * 设置阴影分析的最远距离（米）
   * @param distance - 距离值
   */
  setMaxDistance(distance: number): void {
    if (this.sunlightAnalysis && this.sunlightAnalysis._shadowMap) {
      this.sunlightAnalysis._shadowMap.maximumDistance = distance;
    }
  }

  /**
   * 执行日照/阴影分析
   */
  execute(): void {
    if (!this.sunlightAnalysis) return;
    this.sunlightAnalysis.run();
  }

  /**
   * 清除分析结果
   */
  clear(): void {
    this.sunlightAnalysis?.clear();
  }

  /**
   * 获取指定屏幕坐标点的日照/阴影时长
   * @param screenX - 屏幕 X 坐标
   * @param screenY - 屏幕 Y 坐标
   * @returns 秒数，失败返回 -1
   */
  async getDurationAtPosition(screenX: number, screenY: number): Promise<number> {
    if (!this.sunlightAnalysis || !this.sunlightAnalysis.enabled) return -1;
    try {
      const position = { x: screenX, y: screenY };
      const seconds = await this.sunlightAnalysis.getDurationAsync(position);
      return seconds;
    } catch {
      return -1;
    }
  }

  /**
   * 鼠标移动事件回调（用于显示 tooltip）
   * @param e - 事件对象
   * @param mode - 模式 'sunshine' | 'shadow'
   */
  private async mouseEvent(e: any, mode = this.sunlightAnalysis.displayMode === 0 ? 'sunshine' : 'shadow'): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const domWidth = this.viewer.container.offsetWidth;
    const domHeight = this.viewer.container.offsetHeight;
    const canvasWidth = this.viewer.canvas.width;
    const canvasHeight = this.viewer.canvas.height;
    const scaleWidth = canvasWidth / domWidth;
    const scaleHeight = canvasHeight / domHeight;

    const posWC = e.endPosition || e.position;
    const scalePosWC = { x: posWC.x * scaleWidth, y: posWC.y * scaleHeight };

    try {
      const seconds = await this.sunlightAnalysis.getDurationAsync(scalePosWC);
      let minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      minutes = minutes % 60;

      if (seconds !== -1 && this.tooltip) {
        const durationLabel = mode === 'sunshine' ? 'sunshineDuration' : 'shadowDuration';
        this.tooltip.showAt(posWC, `<p style="margin-bottom: 0;">${durationLabel}：${hours} hours ${minutes} minutes</p>`);
      }
    } catch {
      // ignore
    }
  }

  /**
   * 开始监听鼠标移动事件
   * @param tooltip - tooltip 实例
   */
  private startMouseEventListener(): void {
    if (!this.tooltip) {
      this.tooltip = new Tooltip(this.viewer);
    }
    this._screenSpaceEventHandler = new window.SuperMap3D.ScreenSpaceEventHandler(
      this.scene.canvas
    );
    this._screenSpaceEventHandler.setInputAction((e: any) => {
      // 获取鼠标位置
      this.mouseEvent(e);
    }, window.SuperMap3D.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * 停止监听鼠标移动事件
   */
  private stopMouseEventListener(): void {
    if (this._screenSpaceEventHandler) {
      this._screenSpaceEventHandler.destroy();
      this._screenSpaceEventHandler = undefined;
    }
    if (this.tooltip) {
      this.tooltip.setVisible(false);
      this.tooltip = undefined;
    }
  }

  /**
   * 检查分析是否已启用
   */
  isEnabled(): boolean {
    return this.sunlightAnalysis ? this.sunlightAnalysis.enabled : false;
  }

  /**
   * 销毁实例（不销毁外部传入的 viewer）
   */
  destroy(): void {
    this.stopMouseEventListener();
    this._clearLayersShadow();
    if (this.sunlightAnalysis) {
      this.sunlightAnalysis.clear();
    }
    this.sunlightAnalysis = null;
  }

  /**
   * 应用预设颜色表
   */
  private _applyColorTablePreset(
    colorTable: any,
    colors: { color: { red: number; green: number; blue: number; alpha?: number }; value: number }[]
  ): void {
    const Color = window.SuperMap3D.Color;
    colors.forEach(item => {
      const colorObj = item.color;
      colorTable.insert(
        item.value,
        new Color(
          colorObj.red > 1 ? colorObj.red / 255 : colorObj.red,
          colorObj.green > 1 ? colorObj.green / 255 : colorObj.green,
          colorObj.blue > 1 ? colorObj.blue / 255 : colorObj.blue,
          colorObj.alpha || 1
        )
      );
    });
  }
}

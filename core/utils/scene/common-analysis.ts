/**
 * 场景分析工具基类，负责提供基础校验和统一生命周期约束。
 */
export abstract class AnalysisBase {
  viewer: any;
  scene: any;

  constructor(viewer: any) {
    if (!viewer || !viewer.scene) {
      throw new Error('无效的 viewer 实例，请确保已创建 SuperMap3D.Viewer');
    }
    if (!window.SuperMap3D) {
      throw new Error('SuperMap3D 库未加载，请先引入 SuperMap3D.js');
    }
    this.viewer = viewer;
    this.scene = viewer.scene;
  }

  /**
   * 执行分析。
   */
  abstract execute(): void;

  /**
   * 清除分析结果。
   */
  abstract clear(): void;

  /**
   * 销毁实例。
   */
  abstract destroy(): void;
}

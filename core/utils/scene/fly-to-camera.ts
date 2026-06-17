type ScenePositionLatLng = { lon?: number; lng?: number; lat: number; height?: number };
type ScenePositionXYZ = { x?: number; y?: number; z?: number };

/**
 * 场景导航工具使用的目标位置。
 * 支持经纬度数组、经纬度对象和笛卡尔坐标对象。
 */
export type ScenePosition =
  | [number, number, number?]
  | ScenePositionLatLng
  | ScenePositionXYZ;

/**
 * 场景相机飞行时使用的附加参数。
 */
export interface FlyToOptions {
  /** 相机朝向配置。 */
  hpr?: any;
  /** 飞行时长，单位为秒。 */
  duration?: number;
  /** 飞行被取消时触发的回调。 */
  cancel?: () => void;
  /** 飞行完成时触发的回调。 */
  complete?: () => void;
  /** 飞行过程中使用的缓动函数。 */
  easingFunction?: any;
}

interface ViewerLike {
  camera?: {
    flyTo?: (options: Record<string, any>) => void;
  };
}

function getSuperMap3D(): any {
  const SuperMap3D = (window as any)?.SuperMap3D;
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available');
  }
  return SuperMap3D;
}

function isDefined(value: any) {
  return value != null;
}

function isLngLatPosition(
  position: ScenePosition
): position is ScenePositionLatLng {
  return !Array.isArray(position) && 'lat' in position && isDefined(position.lat);
}

/**
 * 将场景位置统一转换为 `[lng, lat, height]` 数组格式。
 */
export function getArrayPosition(position: ScenePosition) {
  if (position === void 0) {
    throw new Error('position is invalid');
  }
  if (Array.isArray(position)) {
    return [position[0], position[1], position[2] ?? 0];
  }
  if (isLngLatPosition(position)) {
    return [position.lon ?? position.lng ?? 0, position.lat, position.height ?? 0];
  }
  return position;
}

/**
 * 将场景位置转换为三维坐标对象。
 */
export function getSuperMap3DCartesian3(position: ScenePosition) {
  const SuperMap3D = getSuperMap3D();
  if (position === void 0) {
    throw new Error('position is invalid');
  }
  if (Array.isArray(position) || isLngLatPosition(position)) {
    const nextPosition = getArrayPosition(position);
    return SuperMap3D.Cartesian3.fromDegrees(nextPosition[0], nextPosition[1], nextPosition[2]);
  }
  if (isDefined(position?.x) && isDefined(position?.y) && isDefined(position?.z)) {
    return new SuperMap3D.Cartesian3(position.x, position.y, position.z);
  }
  return position;
}

/**
 * 将朝向配置统一转换为可用于相机飞行的格式。
 */
export function getSuperMap3DHeadingPitchRoll(hpr: any) {
  const SuperMap3D = getSuperMap3D();
  if (hpr === void 0) {
    throw new Error('hpr is invalid');
  }
  if (hpr instanceof SuperMap3D.HeadingPitchRoll) {
    return hpr;
  }
  if (hpr.heading !== void 0) {
    return SuperMap3D.HeadingPitchRoll.fromDegrees(hpr.heading || 0, hpr.pitch || 0, hpr.roll || 0);
  }
  return hpr;
}

/**
 * 控制场景相机飞行到指定位置。
 */
export function flyToCamera(viewer: ViewerLike, destination: ScenePosition, options: FlyToOptions = {}) {
  if (!viewer?.camera?.flyTo) {
    throw new Error('viewer.camera.flyTo is not available');
  }
  const { hpr, duration, cancel, complete, easingFunction } = options;
  viewer.camera.flyTo({
    destination: getSuperMap3DCartesian3(destination),
    duration,
    cancel,
    complete,
    easingFunction,
    ...(hpr && { orientation: getSuperMap3DHeadingPitchRoll(hpr) })
  });
}

export default flyToCamera;

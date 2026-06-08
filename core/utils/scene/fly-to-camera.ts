export type ScenePosition =
  | [number, number, number?]
  | { lon?: number; lng?: number; lat: number; height?: number }
  | { x: number; y: number; z: number };

export interface FlyToOptions {
  hpr?: any;
  duration?: number;
  cancel?: () => void;
  complete?: () => void;
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

function isLngLatPosition(
  position: ScenePosition
): position is { lon?: number; lng?: number; lat: number; height?: number } {
  return !Array.isArray(position) && 'lat' in position;
}

function isCartesianPosition(position: ScenePosition): position is { x: number; y: number; z: number } {
  return !Array.isArray(position) && 'x' in position && 'y' in position && 'z' in position;
}

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

export function getSuperMap3DCartesian3(position: ScenePosition) {
  const SuperMap3D = getSuperMap3D();
  if (position === void 0) {
    throw new Error('position is invalid');
  }
  if (Array.isArray(position) || isLngLatPosition(position)) {
    const nextPosition = getArrayPosition(position);
    return SuperMap3D.Cartesian3.fromDegrees(nextPosition[0], nextPosition[1], nextPosition[2]);
  }
  if (isCartesianPosition(position)) {
    return new SuperMap3D.Cartesian3(position.x, position.y, position.z);
  }
  return position;
}

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

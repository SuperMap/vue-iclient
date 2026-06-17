function getSuperMap3D(): any {
  const SuperMap3D = (window as any)?.SuperMap3D
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available');
  }
  return SuperMap3D;
}
/**
 * 让指定元素进入全屏。
 */
export function openFullscreen(target: Element = document.body) {
  const SuperMap3D = getSuperMap3D();
  SuperMap3D.Fullscreen.requestFullscreen(target);
}
/**
 * 退出当前全屏状态。
 */
export function closeFullscreen() {
  const SuperMap3D = getSuperMap3D();
  SuperMap3D.Fullscreen.exitFullscreen();
}
/**
 * 切换指定元素的全屏状态。
 */
export function toggleFullscreen(target: Element = document.body as Element) {
  const SuperMap3D = getSuperMap3D();
  if (SuperMap3D.Fullscreen.fullscreen) {
    closeFullscreen();
    return;
  }
  openFullscreen(target);
}

export default toggleFullscreen;

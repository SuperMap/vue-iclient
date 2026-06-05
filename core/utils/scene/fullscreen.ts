function getSuperMap3D(): any {
  const SuperMap3D = (window as any)?.SuperMap3D
  if (!SuperMap3D) {
    throw new Error('SuperMap3D is not available');
  }
  return SuperMap3D;
}

export function openFullscreen(target: Element = document.body as Element) {
  const SuperMap3D = getSuperMap3D();
  SuperMap3D.Fullscreen.requestFullscreen(target);
}

export function closeFullscreen() {
  const SuperMap3D = getSuperMap3D();
  SuperMap3D.Fullscreen.exitFullscreen();
}

export function toggleFullscreen(target: Element = document.body as Element) {
  const SuperMap3D = getSuperMap3D();
  if (SuperMap3D.Fullscreen.fullscreen) {
    closeFullscreen();
    return;
  }
  openFullscreen(target);
}

export default toggleFullscreen;

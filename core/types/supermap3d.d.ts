interface SuperMap3DInstance {
  MultiViewportMode: Record<string, number>;
}

declare global {
  interface Window {
    SuperMap3D: SuperMap3DInstance;
  }
}

export {};

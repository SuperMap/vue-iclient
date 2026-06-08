interface Cartographic {
  longitude: number;
  latitude: number;
  height: number;
}

interface Cartesian3 {
  x: number;
  y: number;
  z: number;
}

interface HeadingPitchRoll {
  heading: number;
  pitch: number;
  roll: number;
}

interface Color {
  fromCssColorString(color: string): Color;
}

interface Math {
  toDegrees(radians: number): number;
  fromDegrees(degrees: number): number;
}

interface S3MInstanceCollection {
  add(name: string, config: any, buffer: ArrayBuffer | Uint8Array, async: boolean): void;
  getInstance(name: string, id: number): { updateColor(color: Color): void };
  removeCollection(name: string): void;
}

interface Skyline {
  ignoreGlobe: boolean;
  viewPosition: [number, number, number];
  pitch: number;
  direction: number;
  radius: number;
  color: Color;
  displayStyle: number;
  lineWidth: number;
  build(): void;
  clear(): void;
  getSkylineSectorParameter(): any;
  getSkyline2D(): { x: number[]; y: number[] };
  getObjectIds(): Record<number, number[]>;
  removeLimitbody(name: string): void;
  addLimitbody(params: { position: number[]; name: string }): void;
}

interface DrawHandler {
  startPolygon(): Promise<Cartesian3[]>;
  startPolyline(): Promise<Cartesian3[]>;
  startPoint(): Promise<Cartesian3>;
  deactivate(): void;
  clear(): void;
}

interface SuperMap3DInstance {
  MultiViewportMode: Record<string, number>;
  S3MInstanceCollection: new (context: any) => S3MInstanceCollection;
  Skyline: new (scene: any) => Skyline;
  DrawHandler: new (viewer: any, mode: number, clampmode: number) => DrawHandler;
  DrawMode: {
    Point: number;
    Line: number;
    Polygon: number;
  };
  ScreenSpaceEventHandler: any;
  ScreenSpaceEventType: {
    RIGHT_CLICK: number;
  };
  Color: Color;
  Math: Math;
  Cartesian3: {
    fromDegrees(lon: number, lat: number, height?: number): Cartesian3;
    fromCartesian(cartesian: Cartesian3): Cartographic;
  };
  HeadingPitchRoll: new (heading: number, pitch: number, roll: number) => HeadingPitchRoll;
  defined(value: any): boolean;
  Cartographic: {
    fromCartesian(cartesian: Cartesian3): Cartographic;
  };
}

declare global {
  interface Window {
    SuperMap3D: any;
  }
}

export {};

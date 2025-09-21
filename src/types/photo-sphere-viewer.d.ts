declare module 'photo-sphere-viewer' {
  namespace PhotoSphereViewer {
    interface ViewerOptions {
      container: HTMLElement;
      panorama: string;
      navbar?: (string | Record<string, unknown>)[];
      touchmoveTwoFingers?: boolean;
      defaultLat?: number;
      defaultLong?: number;
    }

    class Viewer {
      constructor(options: ViewerOptions);
      destroy(): void;
    }
  }

  export default PhotoSphereViewer;
}

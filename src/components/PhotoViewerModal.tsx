import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PhotoSphereViewer from 'photo-sphere-viewer';
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css';
import type { Photo } from '../types';
import { Button } from './ui/Button';
import { useAuth } from '../providers/AuthProvider';
import { CommentSection } from './comments/CommentSection';

interface PhotoViewerModalProps {
  photo: Photo;
  onClose: () => void;
}

const modalRoot = typeof document !== 'undefined' ? document.body : null;

export const PhotoViewerModal = ({ photo, onClose }: PhotoViewerModalProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PhotoSphereViewer.Viewer | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (photo.is360 && containerRef.current && photo.signedUrl && !viewerRef.current) {
      viewerRef.current = new PhotoSphereViewer.Viewer({
        container: containerRef.current,
        panorama: photo.signedUrl ?? '',
        navbar: ['zoom', 'autorotate', 'gyroscope', 'fullscreen'],
        touchmoveTwoFingers: true,
        defaultLat: 0,
        defaultLong: 0
      });
    }

    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [photo]);

  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-6">
      <div className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{photo.title}</h3>
            <p className="text-sm text-slate-500">Dag {photo.day}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Sluiten
          </Button>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-0 md:grid-cols-[1.4fr,1fr]">
          <div className="flex flex-col">
            {photo.is360 ? (
              <div className="flex-1">
                {photo.signedUrl ? (
                  <div ref={containerRef} className="h-full min-h-[320px] w-full" />
                ) : (
                  <div className="flex h-full min-h-[320px] w-full items-center justify-center bg-slate-200 text-sm text-slate-500">
                    Geen 360° bron gevonden
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center bg-slate-900">
                {photo.signedUrl ? (
                  <img src={photo.signedUrl} alt={photo.title} className="h-full max-h-[520px] w-full object-contain" />
                ) : (
                  <div className="text-sm text-slate-200">Geen afbeelding beschikbaar</div>
                )}
              </div>
            )}
            {photo.description && (
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
                {photo.description}
              </div>
            )}
          </div>
          <div className="flex h-full flex-col border-t border-slate-200 md:border-l md:border-t-0">
            <CommentSection photoId={photo.id} canComment={Boolean(profile)} />
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Photo, Trip } from '../types';
import { Spinner } from '../components/ui/Spinner';
import { PhotoViewerModal } from '../components/PhotoViewerModal';

const createSignedUrl = async (path: string | null) => {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('photos').createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('Signed URL error', error);
    return null;
  }
  return data?.signedUrl ?? null;
};

const fetchTrip = async (id: string): Promise<Trip> => {
  const { data, error } = await supabase.from('trips').select('*').eq('id', id).maybeSingle();
  if (error || !data) {
    throw error ?? new Error('Trip niet gevonden');
  }
  return data as Trip;
};

const fetchPhotos = async (tripId: string): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_id', tripId)
    .order('day', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const photos = (data ?? []) as Photo[];

  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      signedUrl: (await createSignedUrl(photo.storage_path)) ?? undefined,
      signedThumbUrl: (await createSignedUrl(photo.thumb_path)) ?? undefined
    }))
  );
};

export const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
    error: tripErrorData
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => fetchTrip(id!),
    enabled: Boolean(id)
  });

  const {
    data: photos,
    isLoading: photosLoading,
    isError: photosError,
    error: photosErrorData
  } = useQuery({
    queryKey: ['trip-photos', id],
    queryFn: () => fetchPhotos(id!),
    enabled: Boolean(id)
  });

  if (tripLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        Kon trip niet laden: {tripErrorData?.message ?? 'Onbekende fout'}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{trip.title}</h1>
        {trip.description && <p className="text-base text-slate-600">{trip.description}</p>}
        {trip.polarsteps_url && (
          <a
            href={trip.polarsteps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Bekijk trip op Polarsteps
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Foto's</h2>

        {photosLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {photosError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Kon foto's niet laden: {photosErrorData instanceof Error ? photosErrorData.message : 'Onbekende fout'}
          </div>
        )}

        {photos && photos.length === 0 && !photosLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Nog geen foto's voor deze reis.
          </div>
        )}

        {photos && photos.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={photo.signedThumbUrl ?? photo.signedUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">Dag {photo.day}</p>
                  <h3 className="text-base font-semibold text-slate-900">{photo.title}</h3>
                  {photo.is360 && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600">
                      360°
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {trip.polarsteps_embed_url && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Polarsteps kaart</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow">
            <iframe
              src={trip.polarsteps_embed_url}
              width="100%"
              height="600"
              style={{ border: 'none', borderRadius: '12px' }}
              allowFullScreen
              loading="lazy"
              title="Polarsteps kaart"
            />
          </div>
        </section>
      )}

      {selectedPhoto && (
        <PhotoViewerModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
    </div>
  );
};

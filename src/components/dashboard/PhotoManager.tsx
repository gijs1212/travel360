import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Photo, Trip } from '../../types';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useAuth } from '../../providers/AuthProvider';

interface PhotoManagerProps {
  trip: Trip;
}

interface PhotoFormValues {
  title: string;
  day: string;
  description: string;
  is360: boolean;
  file?: FileList;
}

const createSignedUrl = async (path: string | null) => {
  if (!path) return null;
  const { data } = await supabase.storage.from('photos').createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
};

const fetchPhotos = async (tripId: string): Promise<Photo[]> => {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });

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

export const PhotoManager = ({ trip }: PhotoManagerProps) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<PhotoFormValues>({
    defaultValues: {
      title: '',
      day: '',
      description: '',
      is360: false
    }
  });

  const {
    data: photos,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['trip-photos', trip.id],
    queryFn: () => fetchPhotos(trip.id)
  });

  const uploadMutation = useMutation({
    mutationFn: async (values: PhotoFormValues) => {
      if (!profile) throw new Error('Geen gebruiker geladen');
      const file = values.file?.[0];
      if (!file) throw new Error('Selecteer een bestand');

      const extension = file.name.includes('.') ? file.name.split('.').pop() : undefined;
      const uuid =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const filePath = `${trip.id}/${uuid}${extension ? `.${extension}` : ''}`;

      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file, {
        upsert: false,
        contentType: file.type
      });
      if (uploadError) {
        throw uploadError;
      }

      const { error: insertError } = await supabase.from('photos').insert({
        trip_id: trip.id,
        storage_path: filePath,
        thumb_path: filePath,
        title: values.title,
        day: values.day,
        description: values.description || null,
        is360: values.is360,
        created_by: profile.id
      });
      if (insertError) {
        throw insertError;
      }
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['trip-photos', trip.id] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (photo: Photo) => {
      const { error: deleteError } = await supabase.from('photos').delete().eq('id', photo.id);
      if (deleteError) {
        throw deleteError;
      }
      if (photo.storage_path) {
        await supabase.storage.from('photos').remove([photo.storage_path]);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip-photos', trip.id] });
    }
  });

  const handleUpload = form.handleSubmit(async (values) => {
    await uploadMutation.mutateAsync(values);
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Foto's beheren — {trip.title}</h2>
      <p className="mb-4 text-sm text-slate-600">Upload nieuwe foto's of beheer bestaande items.</p>

      <form className="space-y-4" onSubmit={handleUpload}>
        <div>
          <Label htmlFor="photo-title">Titel</Label>
          <Input id="photo-title" {...form.register('title', { required: true })} />
        </div>
        <div>
          <Label htmlFor="photo-day">Dag (nummer of datum)</Label>
          <Input id="photo-day" placeholder="Bijv. 3 of 2024-07-18" {...form.register('day', { required: true })} />
        </div>
        <div>
          <Label htmlFor="photo-description">Beschrijving</Label>
          <Textarea id="photo-description" rows={3} {...form.register('description')} />
        </div>
        <div className="flex items-center gap-2">
          <input id="is360" type="checkbox" {...form.register('is360')} className="h-4 w-4 rounded border-slate-300" />
          <Label htmlFor="is360" className="mb-0">
            360° foto
          </Label>
        </div>
        <div>
          <Label htmlFor="file">Bestand</Label>
          <Input id="file" type="file" accept="image/*" {...form.register('file', { required: true })} />
        </div>
        <Button type="submit" loading={uploadMutation.isPending}>
          Uploaden
        </Button>
      </form>

      <div className="mt-8 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Bestaande foto's</h3>
        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}
        {isError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            Kon foto's niet laden: {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
        )}
        {photos && photos.length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">Nog geen foto's voor deze reis.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {photos?.map((photo) => (
            <div key={photo.id} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="h-20 w-20 overflow-hidden rounded bg-slate-200">
                {photo.signedThumbUrl || photo.signedUrl ? (
                  <img src={photo.signedThumbUrl ?? photo.signedUrl} alt={photo.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">Geen preview</div>
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-slate-800">{photo.title}</p>
                <p className="text-xs text-slate-500">Dag {photo.day}</p>
                {photo.is360 && <p className="text-xs font-medium text-primary-600">360°</p>}
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-red-600 hover:text-red-700"
                  onClick={() => deleteMutation.mutate(photo)}
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

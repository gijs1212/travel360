import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import type { Trip } from '../types';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { normalizePolarstepsUrls } from '../utils/polarsteps';
import { PhotoManager } from '../components/dashboard/PhotoManager';

interface TripFormValues {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  polarsteps: string;
}

const fetchTrips = async (): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return (data ?? []) as Trip[];
};

export const DashboardPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  const {
    data: trips,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['dashboard-trips'],
    queryFn: fetchTrips
  });

  useEffect(() => {
    if (!activeTripId && trips && trips.length > 0) {
      setActiveTripId(trips[0].id);
    }
  }, [trips, activeTripId]);

  const activeTrip = useMemo(() => trips?.find((trip) => trip.id === activeTripId) ?? null, [trips, activeTripId]);

  const form = useForm<TripFormValues>({
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      polarsteps: ''
    }
  });

  const createTripMutation = useMutation({
    mutationFn: async (values: TripFormValues) => {
      if (!profile) throw new Error('Geen profiel geladen');
      const { url, embedUrl } = normalizePolarstepsUrls(values.polarsteps);
      const payload = {
        title: values.title,
        description: values.description || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        polarsteps_url: url,
        polarsteps_embed_url: embedUrl,
        created_by: profile.id
      };
      const { error: insertError } = await supabase.from('trips').insert(payload);
      if (insertError) {
        throw insertError;
      }
    },
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['dashboard-trips'] });
    }
  });

  const updatePolarstepsMutation = useMutation({
    mutationFn: async ({ tripId, value }: { tripId: string; value: string }) => {
      const { url, embedUrl } = normalizePolarstepsUrls(value);
      const { error: updateError } = await supabase
        .from('trips')
        .update({ polarsteps_url: url, polarsteps_embed_url: embedUrl })
        .eq('id', tripId);
      if (updateError) {
        throw updateError;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dashboard-trips'] });
    }
  });

  const handleCreateTrip = form.handleSubmit(async (values) => {
    await createTripMutation.mutateAsync(values);
  });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Uploader dashboard</h1>
        <p className="text-sm text-slate-600">Beheer reizen, upload foto's en koppel Polarsteps.</p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr,1.5fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Nieuwe reis aanmaken</h2>
            <form className="space-y-4" onSubmit={handleCreateTrip}>
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input id="title" {...form.register('title', { required: true })} />
              </div>
              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea id="description" rows={3} {...form.register('description')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="start_date">Startdatum</Label>
                  <Input id="start_date" type="date" {...form.register('start_date')} />
                </div>
                <div>
                  <Label htmlFor="end_date">Einddatum</Label>
                  <Input id="end_date" type="date" {...form.register('end_date')} />
                </div>
              </div>
              <div>
                <Label htmlFor="polarsteps">Polarsteps link</Label>
                <Input id="polarsteps" placeholder="https://www.polarsteps.com/..." {...form.register('polarsteps')} />
                <p className="mt-1 text-xs text-slate-500">Plak een publieke Polarsteps URL, de embed link wordt automatisch gemaakt.</p>
              </div>
              <Button type="submit" loading={createTripMutation.isPending}>
                Reis opslaan
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Reizen</h2>
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}
            {isError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                Kon reizen niet laden: {error instanceof Error ? error.message : 'Onbekende fout'}
              </div>
            )}
            {trips && trips.length === 0 && !isLoading && (
              <p className="text-sm text-slate-500">Nog geen reizen aangemaakt.</p>
            )}
            <div className="space-y-2">
              {trips?.map((trip) => (
                <button
                  key={trip.id}
                  type="button"
                  onClick={() => setActiveTripId(trip.id)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                    activeTripId === trip.id
                      ? 'border-primary-300 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{trip.title}</span>
                    {trip.polarsteps_url && <span className="text-xs text-primary-600">Polarsteps ✓</span>}
                  </div>
                  {trip.description && <p className="mt-1 text-xs text-slate-500">{trip.description}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {activeTrip ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Polarsteps koppelen</h2>
                <p className="mb-4 text-sm text-slate-600">Werk de Polarsteps link bij voor de geselecteerde reis.</p>
                <form
                  key={activeTrip.id}
                  className="space-y-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget as HTMLFormElement);
                    const value = formData.get('polarsteps') as string;
                    await updatePolarstepsMutation.mutateAsync({ tripId: activeTrip.id, value });
                  }}
                >
                  <Input
                    name="polarsteps"
                    defaultValue={activeTrip.polarsteps_url ?? ''}
                    placeholder="https://www.polarsteps.com/Gijs/..."
                  />
                  <Button type="submit" loading={updatePolarstepsMutation.isPending}>
                    Bijwerken
                  </Button>
                </form>
                {activeTrip.polarsteps_embed_url && (
                  <p className="mt-3 text-xs text-slate-500">Embed URL: {activeTrip.polarsteps_embed_url}</p>
                )}
              </div>

              <PhotoManager trip={activeTrip} />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Selecteer een reis om foto's te beheren.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

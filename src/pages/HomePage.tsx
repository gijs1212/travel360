import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { TripCard } from '../components/TripCard';
import type { Trip } from '../types';
import { Spinner } from '../components/ui/Spinner';

const fetchTrips = async (): Promise<Trip[]> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data as Trip[];
};

export const HomePage = () => {
  const { data: trips, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips
  });

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-hero p-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-wide text-primary-100/80">Reisfoto's & 360°</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Beleef de reizen van Gijs opnieuw</h1>
          <p className="text-base text-primary-50/90">
            Blader door trips, bekijk 360° panorama's en volg de Polarsteps-route. Maak een account aan om te reageren op
            jouw favoriete momenten.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Recente reizen</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Vernieuwen
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Er ging iets mis bij het laden van de reizen: {error instanceof Error ? error.message : 'Onbekende fout'}
          </div>
        )}

        {!isLoading && trips && trips.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Nog geen reizen toegevoegd. Log in als Gijs om te beginnen.
          </div>
        )}

        {trips && trips.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

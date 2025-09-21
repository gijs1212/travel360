import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { Trip } from '../types';

const formatDateRange = (start: string | null, end: string | null) => {
  if (!start && !end) return null;
  if (start && end) {
    return `${format(new Date(start), 'd MMM yyyy', { locale: nl })} – ${format(new Date(end), 'd MMM yyyy', { locale: nl })}`;
  }
  if (start) {
    return `Vanaf ${format(new Date(start), 'd MMM yyyy', { locale: nl })}`;
  }
  return `Tot ${format(new Date(end!), 'd MMM yyyy', { locale: nl })}`;
};

export const TripCard = ({ trip }: { trip: Trip }) => {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  return (
    <Link
      to={`/trip/${trip.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600">{trip.title}</h3>
          {dateRange && <p className="text-sm text-slate-500">{dateRange}</p>}
        </div>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">Bekijk</span>
      </div>
      {trip.description && <p className="mt-4 text-sm text-slate-600">{trip.description}</p>}
      {trip.polarsteps_url && (
        <p className="mt-4 text-xs text-primary-600">Polarsteps gekoppeld</p>
      )}
    </Link>
  );
};

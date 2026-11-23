import React, { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Clock, Filter, Train as TrainIcon } from 'lucide-react';
import { ALL_DAYS, CLASS_METADATA } from '../data/railwayData';
import {
  DepartureWindow,
  MatchedTrainSegment,
  SortOption,
  TrainType,
  TravelClassCode,
} from '../types/railway';
import { formatCurrency, formatDisplayDate, formatDuration, getStationByCode } from '../utils/railwayHelpers';
import { SearchQuery } from './SearchPanel';

interface TrainResultsProps {
  query: SearchQuery;
  results: MatchedTrainSegment[];
  onSelectTrainClass: (segment: MatchedTrainSegment, travelClass: TravelClassCode) => void;
  onShiftDate: (days: number) => void;
}

const DEPARTURE_WINDOWS: Array<{ id: DepartureWindow; label: string }> = [
  { id: 'ALL', label: 'Any Time' },
  { id: 'EARLY_MORNING', label: '00:00 – 06:00' },
  { id: 'MORNING', label: '06:00 – 12:00' },
  { id: 'AFTERNOON', label: '12:00 – 18:00' },
  { id: 'NIGHT', label: '18:00 – 24:00' },
];

const TRAIN_TYPES: Array<TrainType | 'ALL'> = ['ALL', 'Rajdhani', 'Shatabdi', 'Vande Bharat', 'Duronto', 'Superfast', 'Express'];

export const TrainResults: React.FC<TrainResultsProps> = ({
  query,
  results,
  onSelectTrainClass,
  onShiftDate,
}) => {
  const [departureWindow, setDepartureWindow] = useState<DepartureWindow>('ALL');
  const [classFilter, setClassFilter] = useState<TravelClassCode | 'ALL'>(query.travelClass);
  const [typeFilter, setTypeFilter] = useState<TrainType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('EARLIEST');
  const [expandedTrainNumber, setExpandedTrainNumber] = useState<string | null>(null);

  // Keep classFilter synced when user triggers a new top-level search class
  React.useEffect(() => {
    setClassFilter(query.travelClass);
  }, [query.travelClass]);

  const filteredAndSorted = useMemo(() => {
    const filtered = results.filter((seg) => {
      const hour = Number(seg.departureTime.split(':')[0]);
      if (departureWindow === 'EARLY_MORNING' && !(hour >= 0 && hour < 6)) return false;
      if (departureWindow === 'MORNING' && !(hour >= 6 && hour < 12)) return false;
      if (departureWindow === 'AFTERNOON' && !(hour >= 12 && hour < 18)) return false;
      if (departureWindow === 'NIGHT' && !(hour >= 18 && hour <= 23)) return false;

      if (typeFilter !== 'ALL' && seg.train.type !== typeFilter) return false;

      if (classFilter !== 'ALL') {
        const hasClass = seg.segmentClasses.some((c) => c.code === classFilter);
        if (!hasClass) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'FASTEST') return a.durationMinutes - b.durationMinutes;
      if (sortBy === 'CHEAPEST') {
        const minA = Math.min(...a.segmentClasses.map((c) => c.segmentFare));
        const minB = Math.min(...b.segmentClasses.map((c) => c.segmentFare));
        return minA - minB;
      }
      return a.departureTime.localeCompare(b.departureTime);
    });
  }, [results, departureWindow, classFilter, typeFilter, sortBy]);

  const fromSt = getStationByCode(query.fromCode);
  const toSt = getStationByCode(query.toCode);

  const resetFilters = () => {
    setDepartureWindow('ALL');
    setClassFilter('ALL');
    setTypeFilter('ALL');
  };

  return (
    <section aria-labelledby="results-heading" className="mt-6 space-y-4">
      {/* Results header & sort bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="results-heading" className="text-lg font-bold text-slate-900 dark:text-white">
            {fromSt?.city || query.fromCode} to {toSt?.city || query.toCode}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-mono font-medium tabular-nums">{filteredAndSorted.length}</span> trains found
            <span aria-hidden="true"> · </span>
            <span>{formatDisplayDate(query.travelDate)}</span>
            <span aria-hidden="true"> · </span>
            <span>
              {query.passengerCount} {query.passengerCount === 1 ? 'Passenger' : 'Passengers'}
            </span>
          </p>
        </div>

        {/* Sort segmented control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sort:</span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            {(
              [
                { id: 'EARLIEST', label: 'Earliest' },
                { id: 'FASTEST', label: 'Fastest' },
                { id: 'CHEAPEST', label: 'Cheapest' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  sortBy === opt.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Filters
            </span>

            {/* Departure time filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-departure" className="text-xs text-slate-500 dark:text-slate-400">
                Departure:
              </label>
              <select
                id="filter-departure"
                value={departureWindow}
                onChange={(e) => setDepartureWindow(e.target.value as DepartureWindow)}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {DEPARTURE_WINDOWS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Class filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-class" className="text-xs text-slate-500 dark:text-slate-400">
                Class:
              </label>
              <select
                id="filter-class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value as TravelClassCode | 'ALL')}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="ALL">All Classes</option>
                {(Object.keys(CLASS_METADATA) as TravelClassCode[]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Train type filter */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="filter-type" className="text-xs text-slate-500 dark:text-slate-400">
                Type:
              </label>
              <select
                id="filter-type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TrainType | 'ALL')}
                className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {TRAIN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'ALL' ? 'All Train Types' : t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(departureWindow !== 'ALL' || classFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 lg:self-auto"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <TrainIcon className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No direct trains match this search
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {results.length > 0
              ? 'Try clearing your active time, class, or train type filters.'
              : 'No trains run between these stations on the selected weekday. Try shifting your date or selecting a major hub route.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {results.length > 0 ? (
              <button
                type="button"
                onClick={resetFilters}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onShiftDate(1)}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Check Next Day
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSorted.map((seg) => {
            const isExpanded = expandedTrainNumber === seg.train.number;
            const visibleClasses =
              classFilter === 'ALL'
                ? seg.segmentClasses
                : seg.segmentClasses.filter((c) => c.code === classFilter);

            return (
              <article
                key={seg.train.number}
                className="rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="p-5">
                  {/* Top row: Train identity + running days */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">
                          {seg.train.number}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{seg.train.type}</span>
                        {seg.train.pantryAvailable && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Pantry Car</span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                        {seg.train.name}
                      </h3>
                    </div>

                    {/* Running days as clean typography */}
                    <div className="flex items-center gap-1.5 text-xs" aria-label="Running days">
                      <span className="mr-1 text-slate-500 dark:text-slate-400">Runs:</span>
                      {ALL_DAYS.map((day) => {
                        const runs = seg.train.runningDays.includes(day);
                        return (
                          <span
                            key={day}
                            className={`font-mono ${
                              runs
                                ? 'font-semibold text-slate-900 dark:text-slate-100'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          >
                            {day.slice(0, 1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Middle row: Departure -> Duration -> Arrival */}
                  <div className="mt-4 grid grid-cols-3 items-center gap-3 border-y border-slate-100 py-4 dark:border-slate-800">
                    <div>
                      <div className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {seg.departureTime}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {seg.fromStation.code} · {seg.fromStation.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Platform {seg.fromStop.platform}
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{formatDuration(seg.durationMinutes)}</span>
                      </div>
                      <div className="my-1.5 flex w-full max-w-[140px] items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                        <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
                        <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {seg.distanceKm} km
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                        {seg.arrivalTime}
                        {seg.dayDelta > 0 && (
                          <span className="ml-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                            +{seg.dayDelta}d
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {seg.toStation.code} · {seg.toStation.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Platform {seg.toStop.platform}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Class cards with availability + fare */}
                  <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleClasses.map((cls) => {
                      const statusColor =
                        cls.status === 'AVAILABLE'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : cls.status === 'RAC'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-rose-700 dark:text-rose-400';

                      const statusText =
                        cls.status === 'AVAILABLE'
                          ? `Available ${cls.count}`
                          : cls.status === 'RAC'
                          ? `RAC ${cls.count}`
                          : `WL ${cls.count}`;

                      return (
                        <button
                          key={cls.code}
                          type="button"
                          onClick={() => onSelectTrainClass(seg, cls.code)}
                          className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:border-blue-600 hover:bg-blue-50/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                              {cls.code}
                            </span>
                            <span className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                              {formatCurrency(cls.segmentFare)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className={`font-mono text-xs font-semibold ${statusColor}`}>
                              {statusText}
                            </span>
                            <span className="text-xs font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                              Select
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Route preview toggle */}
                  <div className="mt-3.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedTrainNumber(isExpanded ? null : seg.train.number)}
                      aria-expanded={isExpanded}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Hide route stops</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>View all {seg.train.stops.length} stops</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Fare per passenger · Select a class to choose seats
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 overflow-x-auto border-t border-slate-100 pt-3 dark:border-slate-800">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-slate-500 dark:text-slate-400">
                            <th className="py-1.5 pr-3 font-medium">Station</th>
                            <th className="py-1.5 pr-3 font-medium">Arr</th>
                            <th className="py-1.5 pr-3 font-medium">Dep</th>
                            <th className="py-1.5 pr-3 font-medium">Halt</th>
                            <th className="py-1.5 pr-3 font-medium">Day</th>
                            <th className="py-1.5 text-right font-medium">Distance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {seg.train.stops.map((stop) => {
                            const st = getStationByCode(stop.stationCode);
                            const isEndpoint =
                              stop.stationCode === query.fromCode || stop.stationCode === query.toCode;
                            return (
                              <tr
                                key={stop.stationCode}
                                className={
                                  isEndpoint
                                    ? 'font-semibold text-blue-700 dark:text-blue-300'
                                    : 'text-slate-700 dark:text-slate-300'
                                }
                              >
                                <td className="py-1.5 pr-3">
                                  <span className="font-mono">{stop.stationCode}</span> · {st?.name}
                                </td>
                                <td className="py-1.5 pr-3 font-mono tabular-nums">
                                  {stop.arrivalTime || 'Origin'}
                                </td>
                                <td className="py-1.5 pr-3 font-mono tabular-nums">
                                  {stop.departureTime || 'Terminus'}
                                </td>
                                <td className="py-1.5 pr-3 font-mono tabular-nums">
                                  {stop.haltMinutes > 0 ? `${stop.haltMinutes}m` : '—'}
                                </td>
                                <td className="py-1.5 pr-3 font-mono tabular-nums">Day {stop.day}</td>
                                <td className="py-1.5 text-right font-mono tabular-nums">{stop.distanceKm} km</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

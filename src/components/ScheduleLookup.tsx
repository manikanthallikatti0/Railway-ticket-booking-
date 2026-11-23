import React, { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { ALL_DAYS, TRAINS } from '../data/railwayData';
import { Train } from '../types/railway';
import { getStationByCode } from '../utils/railwayHelpers';

interface ScheduleLookupProps {
  onQuickBookRoute: (fromCode: string, toCode: string) => void;
}

export const ScheduleLookup: React.FC<ScheduleLookupProps> = ({ onQuickBookRoute }) => {
  const [query, setQuery] = useState('');
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>(TRAINS[0].number);

  const filteredTrains = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRAINS;
    return TRAINS.filter(
      (t) =>
        t.number.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        t.stops.some((s) => s.stationCode.toLowerCase().includes(q))
    );
  }, [query]);

  const activeTrain: Train | undefined =
    TRAINS.find((t) => t.number === selectedTrainNumber) || filteredTrains[0];

  const originCode = activeTrain?.stops[0]?.stationCode;
  const destCode = activeTrain?.stops[activeTrain.stops.length - 1]?.stationCode;

  return (
    <section aria-labelledby="schedule-heading" className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 id="schedule-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          Train Schedule Lookup
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Explore full station timetables, halt durations, platforms, and cumulative distances across all 16 trains.
        </p>

        <div className="mt-4 relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Filter trains by number, name, or station code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search train number, name, or station code..."
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Train directory list */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Trains ({filteredTrains.length})
          </div>
          <div className="max-h-[460px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
            {filteredTrains.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No matching trains found.
              </div>
            ) : (
              filteredTrains.map((train) => {
                const isSelected = activeTrain?.number === train.number;
                const start = train.stops[0].stationCode;
                const end = train.stops[train.stops.length - 1].stationCode;
                return (
                  <button
                    key={train.number}
                    type="button"
                    onClick={() => setSelectedTrainNumber(train.number)}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {train.number}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{train.type}</span>
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                      {train.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {start} → {end} · {train.stops.length} stops
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Timetable detail */}
        <div className="lg:col-span-8">
          {activeTrain ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {activeTrain.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeTrain.type}</span>
                    <span aria-hidden="true">·</span>
                    <span>Classes: {activeTrain.classes.map((c) => c.code).join(', ')}</span>
                  </div>
                  <h2 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                    {activeTrain.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Runs:</span>
                    {ALL_DAYS.map((d) => (
                      <span
                        key={d}
                        className={`font-mono ${
                          activeTrain.runningDays.includes(d)
                            ? 'font-semibold text-slate-900 dark:text-white'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      >
                        {d.slice(0, 1)}
                      </span>
                    ))}
                  </div>
                </div>

                {originCode && destCode && (
                  <button
                    type="button"
                    onClick={() => onQuickBookRoute(originCode, destCode)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
                  >
                    <span>Book {originCode} → {destCode}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <th className="py-2 pr-3 font-medium">#</th>
                      <th className="py-2 pr-3 font-medium">Station</th>
                      <th className="py-2 pr-3 font-medium">Arr</th>
                      <th className="py-2 pr-3 font-medium">Dep</th>
                      <th className="py-2 pr-3 font-medium">Halt</th>
                      <th className="py-2 pr-3 font-medium">PF</th>
                      <th className="py-2 pr-3 font-medium">Day</th>
                      <th className="py-2 text-right font-medium">Dist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeTrain.stops.map((stop, idx) => {
                      const st = getStationByCode(stop.stationCode);
                      return (
                        <tr key={stop.stationCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 pr-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {st?.name || stop.stationCode}
                            </div>
                            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                              {stop.stationCode} · {st?.zone}
                            </div>
                          </td>
                          <td className="py-3 pr-3 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                            {stop.arrivalTime || 'Starts'}
                          </td>
                          <td className="py-3 pr-3 font-mono text-xs tabular-nums font-semibold text-blue-700 dark:text-blue-400">
                            {stop.departureTime || 'Ends'}
                          </td>
                          <td className="py-3 pr-3 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {stop.haltMinutes > 0 ? `${stop.haltMinutes} min` : '—'}
                          </td>
                          <td className="py-3 pr-3 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {stop.platform}
                          </td>
                          <td className="py-3 pr-3 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            Day {stop.day}
                          </td>
                          <td className="py-3 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                            {stop.distanceKm} km
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

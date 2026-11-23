import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, ArrowLeftRight, Calendar, MapPin, Search, Users } from 'lucide-react';
import { CLASS_METADATA, POPULAR_ROUTES, STATIONS, getOffsetDate } from '../data/railwayData';
import { Station, TravelClassCode } from '../types/railway';

export interface SearchQuery {
  fromCode: string;
  toCode: string;
  travelDate: string;
  travelClass: TravelClassCode | 'ALL';
  passengerCount: number;
}

interface SearchPanelProps {
  query: SearchQuery;
  onSearch: (nextQuery: SearchQuery) => void;
}

interface StationAutocompleteProps {
  id: string;
  label: string;
  selectedCode: string;
  onSelect: (station: Station) => void;
  placeholder: string;
  error?: string;
}

const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  id,
  label,
  selectedCode,
  onSelect,
  placeholder,
  error,
}) => {
  const selectedStation = STATIONS.find((s) => s.code === selectedCode);
  const [inputValue, setInputValue] = useState(
    selectedStation ? `${selectedStation.city} (${selectedStation.code})` : ''
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const st = STATIONS.find((s) => s.code === selectedCode);
    setInputValue(st ? `${st.name} (${st.code})` : '');
  }, [selectedCode]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        const st = STATIONS.find((s) => s.code === selectedCode);
        setInputValue(st ? `${st.name} (${st.code})` : '');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [selectedCode]);

  const trimmed = inputValue.trim().toLowerCase();
  const filteredStations = STATIONS.filter((st) => {
    if (!trimmed) return true;
    const formatted = `${st.name} (${st.code})`.toLowerCase();
    if (formatted === trimmed) return true;
    return (
      st.code.toLowerCase().includes(trimmed) ||
      st.name.toLowerCase().includes(trimmed) ||
      st.city.toLowerCase().includes(trimmed) ||
      st.state.toLowerCase().includes(trimmed)
    );
  });

  const chooseStation = (st: Station) => {
    onSelect(st);
    setInputValue(`${st.name} (${st.code})`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredStations.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        (prev - 1 + Math.max(1, filteredStations.length)) % Math.max(1, filteredStations.length)
      );
    } else if (e.key === 'Enter' && filteredStations[highlightedIndex]) {
      e.preventDefault();
      chooseStation(filteredStations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          className={`h-11 w-full rounded-lg border bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            error ? 'border-red-500 dark:border-red-500' : 'border-slate-300 dark:border-slate-700'
          }`}
        />
      </div>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          {filteredStations.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400">
              No matching stations found. Try NDLS, BCT, HWH, MAS, or SBC.
            </li>
          ) : (
            filteredStations.map((st, idx) => {
              const active = idx === highlightedIndex;
              return (
                <li
                  key={st.code}
                  role="option"
                  aria-selected={st.code === selectedCode}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    chooseStation(st);
                  }}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200'
                      : 'text-slate-800 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-medium">{st.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {st.city}, {st.state}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{st.code}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export const SearchPanel: React.FC<SearchPanelProps> = ({ query, onSearch }) => {
  const [fromCode, setFromCode] = useState(query.fromCode);
  const [toCode, setToCode] = useState(query.toCode);
  const [travelDate, setTravelDate] = useState(query.travelDate);
  const [travelClass, setTravelClass] = useState<TravelClassCode | 'ALL'>(query.travelClass);
  const [passengerCount, setPassengerCount] = useState(query.passengerCount);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFromCode(query.fromCode);
    setToCode(query.toCode);
    setTravelDate(query.travelDate);
    setTravelClass(query.travelClass);
    setPassengerCount(query.passengerCount);
  }, [query]);

  const minDate = getOffsetDate(0);
  const maxDate = getOffsetDate(120);

  const handleSwap = () => {
    setFromCode(toCode);
    setToCode(fromCode);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCode || !toCode) {
      setFormError('Please select both origin and destination stations.');
      return;
    }
    if (fromCode === toCode) {
      setFormError('Origin and destination stations cannot be the same. Choose a different destination.');
      return;
    }
    if (!travelDate || travelDate < minDate) {
      setFormError('Please select today or a future travel date.');
      return;
    }
    setFormError(null);
    onSearch({ fromCode, toCode, travelDate, travelClass, passengerCount });
  };

  const handleQuickRoute = (from: string, to: string) => {
    setFromCode(from);
    setToCode(to);
    setFormError(null);
    onSearch({ fromCode: from, toCode: to, travelDate, travelClass, passengerCount });
  };

  return (
    <section
      aria-labelledby="search-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="search-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
            style={{ textWrap: 'balance' }}
          >
            Book Railway Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Search direct routes across 18 major stations, compare classes, and pick your exact berth.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-12 md:items-end">
          {/* From station */}
          <div className="md:col-span-3">
            <StationAutocomplete
              id="from-station"
              label="From Station"
              selectedCode={fromCode}
              onSelect={(st) => {
                setFromCode(st.code);
                setFormError(null);
              }}
              placeholder="City, station, or code"
              error={formError && fromCode === toCode ? 'Invalid' : undefined}
            />
          </div>

          {/* Swap button */}
          <div className="flex justify-center md:col-span-1">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap origin and destination stations"
              title="Swap stations"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-slate-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:bg-blue-950/60"
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* To station */}
          <div className="md:col-span-3">
            <StationAutocomplete
              id="to-station"
              label="To Station"
              selectedCode={toCode}
              onSelect={(st) => {
                setToCode(st.code);
                setFormError(null);
              }}
              placeholder="City, station, or code"
              error={formError && fromCode === toCode ? 'Invalid' : undefined}
            />
          </div>

          {/* Journey Date */}
          <div className="md:col-span-2">
            <label htmlFor="travel-date" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Journey Date
            </label>
            <div className="relative">
              <Calendar
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="travel-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={travelDate}
                onChange={(e) => {
                  setTravelDate(e.target.value);
                  setFormError(null);
                }}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-2.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Class */}
          <div className="md:col-span-2">
            <label htmlFor="travel-class" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Travel Class
            </label>
            <select
              id="travel-class"
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value as TravelClassCode | 'ALL')}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="ALL">All Classes</option>
              {(Object.keys(CLASS_METADATA) as TravelClassCode[]).map((code) => (
                <option key={code} value={code}>
                  {CLASS_METADATA[code].label}
                </option>
              ))}
            </select>
          </div>

          {/* Passengers */}
          <div className="md:col-span-1">
            <label htmlFor="passenger-count" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pax
            </label>
            <div className="relative">
              <Users
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="passenger-count"
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="mt-3.5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          {/* Popular quick-fill routes */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">Popular routes:</span>
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                type="button"
                onClick={() => handleQuickRoute(route.from, route.to)}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {route.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search Trains</span>
          </button>
        </div>
      </form>
    </section>
  );
};

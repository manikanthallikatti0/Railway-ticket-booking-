import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Search, XCircle } from 'lucide-react';
import { BookingRecord } from '../types/railway';
import { formatDisplayDate, formatDuration } from '../utils/railwayHelpers';

interface PnrCheckerProps {
  bookings: BookingRecord[];
}

export const PnrChecker: React.FC<PnrCheckerProps> = ({ bookings }) => {
  const [pnrInput, setPnrInput] = useState(bookings[0]?.pnr || '');
  const [checkedPnr, setCheckedPnr] = useState<string>(bookings[0]?.pnr || '');
  const [error, setError] = useState<string | null>(null);

  const matchedBooking = checkedPnr
    ? bookings.find((b) => b.pnr === checkedPnr) || null
    : null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pnrInput.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit PNR number.');
      return;
    }
    setError(null);
    setCheckedPnr(cleaned);
  };

  return (
    <section aria-labelledby="pnr-heading" className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 id="pnr-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          PNR Status Checker
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enter a 10-digit PNR number to inspect current booking status, coach berth allotment, and chart preparation.
        </p>

        <form onSubmit={handleCheck} noValidate className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 max-w-md">
            <label htmlFor="pnr-lookup-input" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              10-Digit PNR Number
            </label>
            <input
              id="pnr-lookup-input"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => {
                setPnrInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                setError(null);
              }}
              placeholder="e.g. 4829104752"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 font-mono text-sm tracking-wider text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Check Status</span>
          </button>
        </form>

        {bookings.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Session PNRs:</span>
            {bookings.slice(0, 5).map((b) => (
              <button
                key={b.pnr}
                type="button"
                onClick={() => {
                  setPnrInput(b.pnr);
                  setCheckedPnr(b.pnr);
                  setError(null);
                }}
                className="font-mono font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {b.pnr}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-3.5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Status result */}
      {checkedPnr && !error && (
        matchedBooking ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    PNR {matchedBooking.pnr}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {matchedBooking.chartPrepared ? 'Chart Prepared' : 'Chart Not Prepared'}
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {matchedBooking.trainNumber} · {matchedBooking.trainName}
                </h2>
              </div>

              <div className="inline-flex items-center gap-1.5 font-mono text-sm font-bold">
                {matchedBooking.status === 'CANCELLED' ? (
                  <>
                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <span className="text-red-600 dark:text-red-400">CANCELLED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    <span className="text-emerald-700 dark:text-emerald-400">{matchedBooking.status}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 border-b border-slate-100 pb-4 text-sm sm:grid-cols-3 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">From</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {matchedBooking.fromCode} · {matchedBooking.fromName}
                </div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {formatDisplayDate(matchedBooking.travelDate)} · {matchedBooking.departureTime}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">To</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {matchedBooking.toCode} · {matchedBooking.toName}
                </div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Arr {matchedBooking.arrivalTime} · {formatDuration(matchedBooking.durationMinutes)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Class</div>
                <div className="font-mono font-semibold text-slate-900 dark:text-white">
                  {matchedBooking.travelClass}
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">Passenger</th>
                    <th className="py-2 pr-3 font-medium">Booking Status</th>
                    <th className="py-2 text-right font-medium">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {matchedBooking.passengers.map((p, idx) => (
                    <tr key={`${p.name}-${idx}`}>
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                        {idx + 1}. {p.name}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {p.bookingStatus}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
                        {p.currentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              PNR {checkedPnr} not found
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              No booking with this PNR exists in the current session. Select one of the session PNRs above or create a new booking.
            </p>
          </div>
        )
      )}
    </section>
  );
};

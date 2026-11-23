import React, { useMemo, useState } from 'react';
import { AlertTriangle, Eye, Search, Ticket, X, XCircle } from 'lucide-react';
import { BookingRecord } from '../types/railway';
import { calculateCancellationRefund, formatCurrency, formatDisplayDate } from '../utils/railwayHelpers';
import { TicketView } from './TicketView';

interface MyBookingsProps {
  bookings: BookingRecord[];
  onCancelBooking: (pnr: string, refundAmount: number, cancellationFee: number) => void;
  onGoToSearch: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  onCancelBooking,
  onGoToSearch,
}) => {
  const [searchPnr, setSearchPnr] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>('ALL');
  const [viewingTicket, setViewingTicket] = useState<BookingRecord | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingRecord | null>(null);

  const filteredBookings = useMemo(() => {
    const q = searchPnr.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter === 'ACTIVE' && b.status === 'CANCELLED') return false;
      if (statusFilter === 'CANCELLED' && b.status !== 'CANCELLED') return false;
      if (!q) return true;
      return (
        b.pnr.toLowerCase().includes(q) ||
        b.trainNumber.toLowerCase().includes(q) ||
        b.trainName.toLowerCase().includes(q) ||
        b.fromCode.toLowerCase().includes(q) ||
        b.toCode.toLowerCase().includes(q)
      );
    });
  }, [bookings, searchPnr, statusFilter]);

  if (viewingTicket) {
    return (
      <div className="space-y-4">
        <div className="no-print flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewingTicket(null)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>← Back to My Bookings</span>
          </button>
        </div>
        <TicketView booking={viewingTicket} />
      </div>
    );
  }

  const refundPreview = cancelTarget ? calculateCancellationRefund(cancelTarget) : null;

  return (
    <section aria-labelledby="my-bookings-heading" className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 id="my-bookings-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage your active journeys, view printable e-tickets, or cancel tickets with instant refund calculation.
            </p>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'ACTIVE', label: 'Upcoming' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Look up by PNR / Train */}
        <div className="mt-4">
          <label htmlFor="bookings-pnr-search" className="sr-only">
            Filter bookings by PNR, train number, or station
          </label>
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="bookings-pnr-search"
              type="text"
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              placeholder="Look up by PNR, train number, or station..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Ticket className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No bookings found
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {searchPnr
              ? 'No session tickets matched that PNR or train query.'
              : 'Book a train ticket to see it appear here for the current session.'}
          </p>
          <button
            type="button"
            onClick={onGoToSearch}
            className="mt-5 inline-flex h-10 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Search Trains
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isCancelled = booking.status === 'CANCELLED';
            return (
              <article
                key={booking.pnr}
                className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        PNR {booking.pnr}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          isCancelled
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Class {booking.travelClass}</span>
                    </div>
                    <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      {booking.trainNumber} · {booking.trainName}
                    </h2>
                  </div>

                  <div className="sm:text-right">
                    <div className="font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(booking.fare.total)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {booking.passengers.length}{' '}
                      {booking.passengers.length === 1 ? 'Passenger' : 'Passengers'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {booking.fromCode} ({booking.fromName}) → {booking.toCode} ({booking.toName})
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {formatDisplayDate(booking.travelDate)} · Dep {booking.departureTime} · Arr {booking.arrivalTime}
                    </div>
                    {isCancelled && typeof booking.refundAmount === 'number' && (
                      <div className="mt-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Refund processed: {formatCurrency(booking.refundAmount)} (Cancellation fee:{' '}
                        {formatCurrency(booking.cancellationFee || 0)})
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setViewingTicket(booking)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>View E-Ticket</span>
                    </button>

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setCancelTarget(booking)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Cancel Ticket</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Cancellation & Refund Confirmation Dialog */}
      {cancelTarget && refundPreview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <h2 id="cancel-dialog-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm Ticket Cancellation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                aria-label="Close cancellation dialog"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel PNR{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {cancelTarget.pnr}
              </span>{' '}
              ({cancelTarget.fromCode} → {cancelTarget.toCode})?
            </p>

            <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                <span className="font-mono font-medium tabular-nums text-slate-900 dark:text-white">
                  {formatCurrency(cancelTarget.fare.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Cancellation Fee</span>
                <span className="font-mono font-medium tabular-nums text-red-600 dark:text-red-400">
                  −{formatCurrency(refundPreview.cancellationFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold dark:border-slate-800">
                <span className="text-slate-900 dark:text-white">Estimated Refund</span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(refundPreview.refundAmount)}
                </span>
              </div>
              <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">
                {refundPreview.policyNote}
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Keep Ticket
              </button>
              <button
                type="button"
                onClick={() => {
                  onCancelBooking(
                    cancelTarget.pnr,
                    refundPreview.refundAmount,
                    refundPreview.cancellationFee
                  );
                  setCancelTarget(null);
                }}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                Cancel & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

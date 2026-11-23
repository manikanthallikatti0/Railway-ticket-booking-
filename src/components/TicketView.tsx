import React, { useMemo } from 'react';
import { CheckCircle2, Download, Plus, Printer, XCircle } from 'lucide-react';
import { BookingRecord } from '../types/railway';
import {
  downloadETicketHtml,
  formatCurrency,
  formatDisplayDate,
  formatDuration,
  generateQrMatrix,
} from '../utils/railwayHelpers';

interface TicketViewProps {
  booking: BookingRecord;
  onBookAnother?: () => void;
  onViewAllBookings?: () => void;
}

export const TicketView: React.FC<TicketViewProps> = ({
  booking,
  onBookAnother,
  onViewAllBookings,
}) => {
  const qrMatrix = useMemo(() => generateQrMatrix(booking.pnr), [booking.pnr]);
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="space-y-5">
      {/* Top confirmation banner */}
      <div className="no-print flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          {isCancelled ? (
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isCancelled ? 'Ticket Cancelled' : 'Booking Confirmed'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isCancelled
                ? `Refund of ${formatCurrency(booking.refundAmount || 0)} has been initiated to your original payment method.`
                : `E-ticket generated for ${booking.passengers.length} ${
                    booking.passengers.length === 1 ? 'passenger' : 'passengers'
                  }. Confirmation sent to ${booking.contact.email}.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Print Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => downloadETicketHtml(booking)}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Download E-Ticket</span>
          </button>
        </div>
      </div>

      {/* Printable E-Ticket Card */}
      <article className="print-ticket overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Ticket Blue Header */}
        <div className="flex flex-col gap-4 bg-blue-700 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-blue-100">Electronic Reservation Slip</div>
            <h3 className="mt-0.5 text-xl font-bold">
              {booking.trainNumber} · {booking.trainName}
            </h3>
            <div className="mt-1 text-xs text-blue-100">
              {booking.trainType}
              <span aria-hidden="true"> · </span>
              Class {booking.travelClass}
              <span aria-hidden="true"> · </span>
              {booking.status}
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs font-medium text-blue-100">PNR Number</div>
            <div className="font-mono text-2xl font-bold tracking-wider tabular-nums">
              {booking.pnr}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 border-b border-slate-200 pb-6 md:grid-cols-12 dark:border-slate-800">
            {/* Journey details */}
            <div className="md:col-span-9 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Boarding</div>
                <div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                  {booking.fromCode} · {booking.fromName}
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {booking.departureTime}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDisplayDate(booking.travelDate)}
                </div>
              </div>

              <div className="sm:text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Travel Time</div>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDuration(booking.durationMinutes)}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {booking.chartPrepared ? 'Chart Prepared' : 'Chart Not Prepared'}
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Destination</div>
                <div className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                  {booking.toCode} · {booking.toName}
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {booking.arrivalTime}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Scheduled Arrival
                </div>
              </div>
            </div>

            {/* Deterministic SVG QR Code */}
            <div className="flex flex-col items-center justify-center md:col-span-3 md:border-l md:border-slate-200 md:pl-6 dark:md:border-slate-800">
              <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700">
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 21 21"
                  role="img"
                  aria-label={`QR verification code for PNR ${booking.pnr}`}
                  shapeRendering="crispEdges"
                >
                  <rect width="21" height="21" fill="#ffffff" />
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0f172a" /> : null
                    )
                  )}
                </svg>
              </div>
              <span className="mt-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Scan at boarding
              </span>
            </div>
          </div>

          {/* Passenger Table */}
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Passenger & Berth Details</h4>
            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Passenger Name</th>
                    <th className="py-2 pr-3 font-medium">Age / Gender</th>
                    <th className="py-2 pr-3 font-medium">Booking Status</th>
                    <th className="py-2 text-right font-medium">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {booking.passengers.map((p, idx) => (
                    <tr key={`${p.name}-${idx}`}>
                      <td className="py-3 pr-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                        {p.age} · {p.gender}
                      </td>
                      <td className="py-3 pr-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {p.bookingStatus}
                      </td>
                      <td
                        className={`py-3 text-right font-mono text-xs font-semibold ${
                          isCancelled
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {p.currentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Contact Footer */}
          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:text-slate-400">
            <div>
              <span>Payment: {booking.paymentMethod}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono">TXN {booking.transactionId}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Total Paid: <span className="font-mono tabular-nums">{formatCurrency(booking.fare.total)}</span>
            </div>
          </div>
        </div>
      </article>

      {/* Bottom quick actions */}
      {(onBookAnother || onViewAllBookings) && (
        <div className="no-print flex flex-wrap items-center justify-end gap-3">
          {onViewAllBookings && (
            <button
              type="button"
              onClick={onViewAllBookings}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>View My Bookings</span>
            </button>
          )}
          {onBookAnother && (
            <button
              type="button"
              onClick={onBookAnother}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Book Another Ticket</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

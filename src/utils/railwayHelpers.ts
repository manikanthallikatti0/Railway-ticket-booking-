import { STATIONS, TRAINS } from '../data/railwayData';
import {
  BerthType,
  BookingRecord,
  DayOfWeek,
  FareSummary,
  MatchedTrainSegment,
  Station,
  TravelClassCode,
} from '../types/railway';

export const BERTH_LABELS: Record<BerthType, string> = {
  LB: 'Lower Berth',
  MB: 'Middle Berth',
  UB: 'Upper Berth',
  SL: 'Side Lower',
  SU: 'Side Upper',
  W: 'Window Seat',
  M: 'Middle Seat',
  A: 'Aisle Seat',
};

export function getStationByCode(code: string): Station | undefined {
  return STATIONS.find((s) => s.code === code);
}

/**
 * Converts HH:MM + 1-indexed journey day to total minutes from Day 1 00:00.
 */
export function toAbsoluteMinutes(timeStr: string, day: number): number {
  const [hh, mm] = timeStr.split(':').map(Number);
  return (day - 1) * 1440 + hh * 60 + mm;
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, '0')}m`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getDayOfWeekFromDate(dateStr: string): DayOfWeek {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const map: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[dt.getDay()];
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Finds all trains running between fromCode and toCode (supporting any intermediate stops along the route).
 */
export function findTrainsForRoute(
  fromCode: string,
  toCode: string,
  travelDate?: string
): MatchedTrainSegment[] {
  const fromStation = getStationByCode(fromCode);
  const toStation = getStationByCode(toCode);
  if (!fromStation || !toStation || fromCode === toCode) return [];

  const travelDay = travelDate ? getDayOfWeekFromDate(travelDate) : null;
  const results: MatchedTrainSegment[] = [];

  for (const train of TRAINS) {
    const fromIdx = train.stops.findIndex((s) => s.stationCode === fromCode);
    const toIdx = train.stops.findIndex((s) => s.stationCode === toCode);
    if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) continue;

    // If a travel date is given, still return trains running on that day (or show all if user wants,
    // actually filtering by runningDay makes date search authentic!).
    if (travelDay && !train.runningDays.includes(travelDay)) {
      continue;
    }

    const fromStop = train.stops[fromIdx];
    const toStop = train.stops[toIdx];
    const depTime = fromStop.departureTime || fromStop.arrivalTime || '00:00';
    const arrTime = toStop.arrivalTime || toStop.departureTime || '00:00';

    const depAbs = toAbsoluteMinutes(depTime, fromStop.day);
    const arrAbs = toAbsoluteMinutes(arrTime, toStop.day);
    const durationMinutes = Math.max(30, arrAbs - depAbs);

    const totalRouteDistance = train.stops[train.stops.length - 1].distanceKm || 1;
    const segmentDistance = Math.max(50, toStop.distanceKm - fromStop.distanceKm);
    const distanceRatio = Math.max(0.28, segmentDistance / totalRouteDistance);

    const segmentClasses = train.classes.map((cls) => ({
      ...cls,
      segmentFare: Math.round((cls.baseFareFullRoute * distanceRatio) / 5) * 5,
    }));

    results.push({
      train,
      fromStop,
      toStop,
      fromStation,
      toStation,
      departureTime: depTime,
      arrivalTime: arrTime,
      durationMinutes,
      distanceKm: segmentDistance,
      dayDelta: toStop.day - fromStop.day,
      segmentClasses,
    });
  }

  return results;
}

/**
 * Calculates itemized fare summary including reservation, convenience fee, and GST.
 */
export function calculateFareSummary(
  baseFarePerPassenger: number,
  passengerCount: number,
  travelClass: TravelClassCode
): FareSummary {
  const subtotal = baseFarePerPassenger * passengerCount;
  const reservationPerPax = travelClass === 'SL' ? 20 : travelClass === '3A' || travelClass === 'CC' ? 40 : 50;
  const reservationFee = reservationPerPax * passengerCount;
  const convenienceFee = travelClass === 'SL' ? 20 : 35;
  const isAcClass = travelClass !== 'SL';
  const gstAmount = isAcClass ? Math.round((subtotal + reservationFee) * 0.05) : 0;
  const total = subtotal + reservationFee + convenienceFee + gstAmount;

  return {
    baseFarePerPassenger,
    passengerCount,
    subtotal,
    reservationFee,
    convenienceFee,
    gstAmount,
    total,
  };
}

/**
 * Generates a realistic 10-digit PNR number.
 */
export function generatePNR(): string {
  const firstDigit = Math.floor(Math.random() * 8) + 2; // 2-9
  let rest = '';
  for (let i = 0; i < 9; i++) {
    rest += Math.floor(Math.random() * 10).toString();
  }
  return `${firstDigit}${rest}`;
}

export function generateTransactionId(): string {
  return `TXN${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
}

/**
 * Computes cancellation fee and refund amount based on hours remaining until departure and ticket status.
 */
export function calculateCancellationRefund(booking: BookingRecord): {
  refundAmount: number;
  cancellationFee: number;
  policyNote: string;
} {
  const depDateTime = new Date(`${booking.travelDate}T${booking.departureTime}:00`);
  const hoursRemaining = (depDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const paid = booking.fare.total;

  if (booking.status === 'WAITLISTED' || booking.status === 'RAC') {
    const fee = Math.min(paid, booking.passengers.length * 60);
    return {
      cancellationFee: fee,
      refundAmount: Math.max(0, paid - fee),
      policyNote: 'Waitlist / RAC clerkage charge of ₹60 per passenger applies.',
    };
  }

  if (hoursRemaining >= 48) {
    const perPaxFee = booking.travelClass === '1A' ? 240 : booking.travelClass === '2A' ? 200 : booking.travelClass === '3A' || booking.travelClass === 'CC' ? 180 : 120;
    const fee = Math.min(paid, perPaxFee * booking.passengers.length);
    return {
      cancellationFee: fee,
      refundAmount: Math.max(0, paid - fee),
      policyNote: 'More than 48 hrs before departure: flat class-wise cancellation fee.',
    };
  }

  if (hoursRemaining >= 12) {
    const fee = Math.round(paid * 0.25);
    return {
      cancellationFee: fee,
      refundAmount: Math.max(0, paid - fee),
      policyNote: '12 to 48 hrs before departure: 25% cancellation deduction applies.',
    };
  }

  const fee = Math.round(paid * 0.5);
  return {
    cancellationFee: fee,
    refundAmount: Math.max(0, paid - fee),
    policyNote: 'Less than 12 hrs before departure: 50% cancellation deduction applies.',
  };
}

/**
 * Generates a deterministic 21x21 QR-style visual matrix from a PNR string (for crisp SVG rendering).
 */
export function generateQrMatrix(seedText: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (r === 6 || c === 6) {
        grid[r][c] = (r + c) % 2 === 0;
        continue;
      }

      const bitSeed = (hash ^ (r * 31 + c * 17)) >>> 0;
      grid[r][c] = bitSeed % 11 < 5;
    }
  }

  return grid;
}

/**
 * Exports a clean, standalone printable HTML file for a given booking E-Ticket.
 */
export function downloadETicketHtml(booking: BookingRecord): void {
  const rows = booking.passengers
    .map(
      (p, idx) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${idx + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;">${p.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">${p.age} / ${p.gender}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${p.bookingStatus}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:600;color:#1d4ed8;">${p.currentStatus}</td>
      </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>RailVista E-Ticket - PNR ${booking.pnr}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:32px; }
  .card { max-width:760px; margin:0 auto; background:#fff; border:1px solid #cbd5e1; border-radius:12px; overflow:hidden; }
  .header { background:#1d4ed8; color:#fff; padding:20px 28px; display:flex; justify-content:space-between; align-items:center; }
  .body { padding:24px 28px; }
  table { width:100%; border-collapse:collapse; margin-top:12px; font-size:14px; }
  th { text-align:left; padding:10px 12px; background:#f1f5f9; font-size:12px; text-transform:uppercase; color:#475569; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div style="font-size:20px;font-weight:700;">RailVista Electronic Reservation Slip</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px;">${booking.trainNumber} · ${booking.trainName} (${booking.travelClass})</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;opacity:0.85;">PNR NUMBER</div>
        <div style="font-size:22px;font-weight:700;font-family:monospace;">${booking.pnr}</div>
      </div>
    </div>
    <div class="body">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:16px;">
        <div>
          <div style="font-size:12px;color:#64748b;">FROM</div>
          <div style="font-size:18px;font-weight:700;">${booking.fromCode} · ${booking.fromName}</div>
          <div style="font-size:14px;font-family:monospace;margin-top:4px;">Dep: ${booking.departureTime} · ${formatDisplayDate(booking.travelDate)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:#64748b;">TO</div>
          <div style="font-size:18px;font-weight:700;">${booking.toCode} · ${booking.toName}</div>
          <div style="font-size:14px;font-family:monospace;margin-top:4px;">Arr: ${booking.arrivalTime} · ${formatDuration(booking.durationMinutes)}</div>
        </div>
      </div>
      <h3 style="margin:0 0 8px;font-size:15px;">Passenger Details</h3>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Age / Gender</th><th>Booking Status</th><th>Current Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:14px;">
        <div>Payment: ${booking.paymentMethod} · TXN ${booking.transactionId}</div>
        <div style="font-weight:700;">Total Paid: ${formatCurrency(booking.fare.total)}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RailVista-Ticket-${booking.pnr}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

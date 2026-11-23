import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { CLASS_METADATA, generateCoachSeats } from '../data/railwayData';
import { MatchedTrainSegment, SeatNode, SelectedSeat, TravelClassCode } from '../types/railway';
import { BERTH_LABELS, calculateFareSummary, formatCurrency, formatDisplayDate } from '../utils/railwayHelpers';

interface SeatSelectionProps {
  segment: MatchedTrainSegment;
  travelClass: TravelClassCode;
  travelDate: string;
  passengerCount: number;
  selectedSeats: SelectedSeat[];
  onChangeSeats: (seats: SelectedSeat[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const SeatSelection: React.FC<SeatSelectionProps> = ({
  segment,
  travelClass,
  travelDate,
  passengerCount,
  selectedSeats,
  onChangeSeats,
  onBack,
  onContinue,
}) => {
  const classInfo = segment.segmentClasses.find((c) => c.code === travelClass) || segment.segmentClasses[0];
  const [activeCoach, setActiveCoach] = useState<string>(classInfo.coaches[0] || 'B1');
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);

  const isWaitlistOrRac = classInfo.status !== 'AVAILABLE';

  const coachSeats: SeatNode[] = useMemo(() => {
    const base = generateCoachSeats(segment.train.number, travelClass, activeCoach);
    return base.map((seat) => {
      const isSelected = selectedSeats.some(
        (s) => s.coach === seat.coach && s.seatNumber === seat.number
      );
      return isSelected ? { ...seat, status: 'SELECTED' } : seat;
    });
  }, [segment.train.number, travelClass, activeCoach, selectedSeats]);

  const fareSummary = calculateFareSummary(classInfo.segmentFare, passengerCount, travelClass);

  const toggleSeat = (seat: SeatNode) => {
    if (seat.status === 'BOOKED') return;
    setSelectionNotice(null);

    const exists = selectedSeats.some(
      (s) => s.coach === seat.coach && s.seatNumber === seat.number
    );

    if (exists) {
      onChangeSeats(
        selectedSeats.filter((s) => !(s.coach === seat.coach && s.seatNumber === seat.number))
      );
      return;
    }

    if (selectedSeats.length >= passengerCount) {
      // Replace oldest selection cleanly if passengerCount is 1, otherwise show clear notice
      if (passengerCount === 1) {
        onChangeSeats([{ coach: seat.coach, seatNumber: seat.number, berthType: seat.berthType }]);
      } else {
        setSelectionNotice(
          `You already selected ${passengerCount} seats. Deselect one seat before choosing another.`
        );
      }
      return;
    }

    onChangeSeats([
      ...selectedSeats,
      { coach: seat.coach, seatNumber: seat.number, berthType: seat.berthType },
    ]);
  };

  const handleAutoAssign = () => {
    setSelectionNotice(null);
    const available = coachSeats.filter((s) => s.status !== 'BOOKED');
    if (available.length < passengerCount) {
      // Gather across coaches if needed
      const collected: SelectedSeat[] = [];
      for (const cId of classInfo.coaches) {
        const list = generateCoachSeats(segment.train.number, travelClass, cId);
        for (const s of list) {
          if (s.status === 'AVAILABLE' && collected.length < passengerCount) {
            collected.push({ coach: s.coach, seatNumber: s.number, berthType: s.berthType });
          }
        }
        if (collected.length >= passengerCount) break;
      }
      onChangeSeats(collected);
      if (collected.length > 0) setActiveCoach(collected[0].coach);
      return;
    }

    const picked = available.slice(0, passengerCount).map((s) => ({
      coach: s.coach,
      seatNumber: s.number,
      berthType: s.berthType,
    }));
    onChangeSeats(picked);
  };

  const handleProceed = () => {
    if (!isWaitlistOrRac && selectedSeats.length < passengerCount) {
      setSelectionNotice(
        `Please select ${passengerCount - selectedSeats.length} more ${
          passengerCount - selectedSeats.length === 1 ? 'seat' : 'seats'
        } (or click Auto-Select Best Seats).`
      );
      return;
    }
    setSelectionNotice(null);
    onContinue();
  };

  // Group seats into realistic bays / rows for visual coach rendering
  const renderCoachMap = () => {
    if (travelClass === 'CC') {
      // Chair Car: rows of 5 (3 left + aisle + 2 right)
      const rows: SeatNode[][] = [];
      for (let i = 0; i < coachSeats.length; i += 5) {
        rows.push(coachSeats.slice(i, i + 5));
      }
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-6 gap-2 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>W</span>
            <span>M</span>
            <span>A</span>
            <span aria-hidden="true">Aisle</span>
            <span>A</span>
            <span>W</span>
          </div>
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-6 items-center gap-2">
              {row.slice(0, 3).map((seat) => (
                <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
              ))}
              <div className="text-center font-mono text-[11px] text-slate-400 dark:text-slate-600">
                R{rowIdx + 1}
              </div>
              {row.slice(3, 5).map((seat) => (
                <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    // Sleeper / 3A (8 berths per bay), 2A (6 per bay), 1A (4 per cabin)
    const baySize = travelClass === '2A' ? 6 : travelClass === '1A' ? 4 : 8;
    const bays: SeatNode[][] = [];
    for (let i = 0; i < coachSeats.length; i += baySize) {
      bays.push(coachSeats.slice(i, i + baySize));
    }

    return (
      <div className="space-y-3">
        {bays.map((bay, bayIdx) => {
          const mainBerths = travelClass === '1A' ? bay : bay.slice(0, baySize - 2);
          const sideBerths = travelClass === '1A' ? [] : bay.slice(baySize - 2);

          return (
            <div
              key={bayIdx}
              className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold">
                  {travelClass === '1A' ? `Cabin ${bayIdx + 1}` : `Bay ${bayIdx + 1}`}
                </span>
                <span>{travelClass === '1A' ? 'Private Coupe' : 'Main Compartment · Side Corridor'}</span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Main compartment: 2 columns of berths */}
                <div
                  className={`grid gap-2 flex-1 ${
                    travelClass === '3A' || travelClass === 'SL' ? 'grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  {mainBerths.map((seat) => (
                    <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
                  ))}
                </div>

                {/* Side berths (SL & SU) */}
                {sideBerths.length > 0 && (
                  <div className="flex sm:flex-col gap-2 sm:border-l sm:border-dashed sm:border-slate-300 sm:pl-3 dark:sm:border-slate-700">
                    {sideBerths.map((seat) => (
                      <SeatButton key={seat.id} seat={seat} onClick={() => toggleSeat(seat)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Coach & Seat Map */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {segment.train.number}
                </span>
                <span aria-hidden="true">·</span>
                <span>{segment.train.name}</span>
                <span aria-hidden="true">·</span>
                <span>{CLASS_METADATA[travelClass].label}</span>
              </div>
              <h2 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                {isWaitlistOrRac ? 'Review Coach & Availability' : 'Select Your Seats'}
              </h2>
            </div>

            {!isWaitlistOrRac && (
              <button
                type="button"
                onClick={handleAutoAssign}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 whitespace-nowrap shrink-0 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-950"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Auto-Select Best Seats</span>
              </button>
            )}
          </div>

          {isWaitlistOrRac && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
              This class currently shows{' '}
              <span className="font-mono font-semibold">
                {classInfo.status} {classInfo.count}
              </span>
              . Berths will be allotted automatically upon chart preparation; you can preview coach layout below or proceed directly.
            </div>
          )}

          {/* Coach switcher tabs */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Coach selector">
              <span className="mr-1 text-xs font-medium text-slate-500 dark:text-slate-400">Coach:</span>
              {classInfo.coaches.map((coachId) => {
                const active = coachId === activeCoach;
                const countInCoach = selectedSeats.filter((s) => s.coach === coachId).length;
                return (
                  <button
                    key={coachId}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCoach(coachId)}
                    className={`h-9 rounded-lg px-3 font-mono text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {coachId}
                    {countInCoach > 0 ? ` (${countInCoach})` : ''}
                  </button>
                );
              })}
            </div>

            {/* Seat state legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-blue-600" />
                Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-slate-200 dark:bg-slate-800" />
                Booked
              </span>
            </div>
          </div>

          {/* Seat Grid */}
          <div className="mt-4">{renderCoachMap()}</div>

          {selectionNotice && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{selectionNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Summary & Actions */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Journey Summary</h3>
          <div className="mt-3 space-y-2 border-b border-slate-100 pb-4 text-sm dark:border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Route</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {segment.fromStation.code} → {segment.toStation.code}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatDisplayDate(travelDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Timing</span>
              <span className="font-mono text-slate-900 dark:text-white">
                {segment.departureTime} – {segment.arrivalTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Class</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">{travelClass}</span>
            </div>
          </div>

          {/* Selected seats list */}
          <div className="mt-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Selected Seats</span>
              <span className="font-mono tabular-nums">
                {isWaitlistOrRac ? `${passengerCount} Pax` : `${selectedSeats.length} / ${passengerCount}`}
              </span>
            </div>

            {isWaitlistOrRac ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Seats will be assigned under {classInfo.status} quota.
              </p>
            ) : selectedSeats.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Tap available berths on the coach map to reserve them.
              </p>
            ) : (
              <ul className="mt-2.5 space-y-1.5">
                {selectedSeats.map((s) => (
                  <li
                    key={`${s.coach}-${s.seatNumber}`}
                    className="flex items-center justify-between text-xs text-slate-800 dark:text-slate-200"
                  >
                    <span className="inline-flex items-center gap-1.5 font-mono font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      {s.coach} · Seat {s.seatNumber}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">{BERTH_LABELS[s.berthType]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Estimated fare */}
          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>
                Base fare ({passengerCount} × {formatCurrency(fareSummary.baseFarePerPassenger)})
              </span>
              <span className="font-mono tabular-nums">{formatCurrency(fareSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Taxes & charges</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(fareSummary.reservationFee + fareSummary.convenienceFee + fareSummary.gstAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <span>Total</span>
              <span className="font-mono tabular-nums">{formatCurrency(fareSummary.total)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleProceed}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span>Continue to Passenger Info</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Change Train</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

interface SeatButtonProps {
  seat: SeatNode;
  onClick: () => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, onClick }) => {
  const isBooked = seat.status === 'BOOKED';
  const isSelected = seat.status === 'SELECTED';

  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Coach ${seat.coach} seat ${seat.number}, ${BERTH_LABELS[seat.berthType]}, ${
        isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'
      }`}
      className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
        isBooked
          ? 'cursor-not-allowed border-slate-200 bg-slate-200/80 text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-600'
          : isSelected
          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
          : 'border-slate-300 bg-white text-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:bg-blue-950/40'
      }`}
    >
      <span className="font-mono text-xs font-bold leading-tight">{seat.number}</span>
      <span
        className={`text-[10px] font-medium leading-tight ${
          isSelected ? 'text-blue-100' : isBooked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {seat.berthType}
      </span>
    </button>
  );
};

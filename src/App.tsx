/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { BookingStepper } from './components/BookingStepper';
import { MyBookings } from './components/MyBookings';
import { Navbar } from './components/Navbar';
import { PassengerForm } from './components/PassengerForm';
import { PaymentStep } from './components/PaymentStep';
import { PnrChecker } from './components/PnrChecker';
import { ScheduleLookup } from './components/ScheduleLookup';
import { SearchPanel, SearchQuery } from './components/SearchPanel';
import { SeatSelection } from './components/SeatSelection';
import { TicketView } from './components/TicketView';
import { TrainResults } from './components/TrainResults';
import { INITIAL_BOOKINGS, getOffsetDate } from './data/railwayData';
import {
  AppSection,
  BookedPassenger,
  BookingRecord,
  BookingStep,
  ContactInfo,
  MatchedTrainSegment,
  MockUser,
  PassengerInput,
  SelectedSeat,
  TravelClassCode,
} from './types/railway';
import {
  calculateFareSummary,
  findTrainsForRoute,
  generatePNR,
  generateTransactionId,
} from './utils/railwayHelpers';

function createEmptyPassengers(count: number): PassengerInput[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `pax-${idx + 1}`,
    name: '',
    age: '',
    gender: 'Male',
    berthPreference: 'No Preference',
  }));
}

export default function App() {
  // Theme state (persisted in-memory + optional system default check)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Top-level navigation & auth state
  const [activeSection, setActiveSection] = useState<AppSection>('BOOK');
  const [user, setUser] = useState<MockUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // In-memory session bookings
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);

  // Search & active booking flow state
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    fromCode: 'NDLS',
    toCode: 'BCT',
    travelDate: getOffsetDate(2),
    travelClass: 'ALL',
    passengerCount: 1,
  });

  const [bookingStep, setBookingStep] = useState<BookingStep>('SEARCH');
  const [selectedSegment, setSelectedSegment] = useState<MatchedTrainSegment | null>(null);
  const [selectedClass, setSelectedClass] = useState<TravelClassCode>('3A');
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [passengers, setPassengers] = useState<PassengerInput[]>(() => createEmptyPassengers(1));
  const [contact, setContact] = useState<ContactInfo>({ email: '', phone: '' });
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const searchResults = useMemo(
    () => findTrainsForRoute(searchQuery.fromCode, searchQuery.toCode, searchQuery.travelDate),
    [searchQuery.fromCode, searchQuery.toCode, searchQuery.travelDate]
  );

  const handleSearch = (nextQuery: SearchQuery) => {
    setSearchQuery(nextQuery);
    setBookingStep('SEARCH');
    setSelectedSegment(null);
    setSelectedSeats([]);
  };

  const handleShiftDate = (days: number) => {
    const [y, m, d] = searchQuery.travelDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    const nextDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(
      dt.getDate()
    ).padStart(2, '0')}`;
    setSearchQuery((prev) => ({ ...prev, travelDate: nextDate }));
  };

  const handleSelectTrainClass = (segment: MatchedTrainSegment, travelClass: TravelClassCode) => {
    setSelectedSegment(segment);
    setSelectedClass(travelClass);
    setSelectedSeats([]);
    setPassengers(createEmptyPassengers(searchQuery.passengerCount));
    if (user && !contact.email) {
      setContact({ email: user.email, phone: user.phone });
    }
    setBookingStep('SEATS');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFareSummary = useMemo(() => {
    if (!selectedSegment) return null;
    const cls =
      selectedSegment.segmentClasses.find((c) => c.code === selectedClass) ||
      selectedSegment.segmentClasses[0];
    return calculateFareSummary(cls.segmentFare, searchQuery.passengerCount, selectedClass);
  }, [selectedSegment, selectedClass, searchQuery.passengerCount]);

  const handlePaymentSuccess = (paymentMethodLabel: string) => {
    if (!selectedSegment || !activeFareSummary) return;
    const clsInfo =
      selectedSegment.segmentClasses.find((c) => c.code === selectedClass) ||
      selectedSegment.segmentClasses[0];

    const isConfirmed = clsInfo.status === 'AVAILABLE';
    const bookedPassengers: BookedPassenger[] = passengers.map((p, idx) => {
      const seat = selectedSeats[idx];
      if (isConfirmed && seat) {
        const statusStr = `CNF / ${seat.coach} / ${seat.seatNumber} / ${seat.berthType}`;
        return {
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
          bookingStatus: statusStr,
          currentStatus: statusStr,
          coach: seat.coach,
          seatNumber: seat.seatNumber,
          berthType: seat.berthType,
        };
      }

      const fallbackCoach = clsInfo.coaches[0] || 'PQ';
      const label =
        clsInfo.status === 'RAC'
          ? `RAC ${clsInfo.count + idx}`
          : `WL ${clsInfo.count + idx}`;
      return {
        name: p.name.trim(),
        age: Number(p.age),
        gender: p.gender,
        bookingStatus: label,
        currentStatus: label,
        coach: fallbackCoach,
        seatNumber: null,
        berthType: p.berthPreference,
      };
    });

    const newBooking: BookingRecord = {
      pnr: generatePNR(),
      trainNumber: selectedSegment.train.number,
      trainName: selectedSegment.train.name,
      trainType: selectedSegment.train.type,
      fromCode: selectedSegment.fromStation.code,
      fromName: selectedSegment.fromStation.name,
      toCode: selectedSegment.toStation.code,
      toName: selectedSegment.toStation.name,
      travelDate: searchQuery.travelDate,
      departureTime: selectedSegment.departureTime,
      arrivalTime: selectedSegment.arrivalTime,
      durationMinutes: selectedSegment.durationMinutes,
      travelClass: selectedClass,
      passengers: bookedPassengers,
      contact: { ...contact },
      fare: activeFareSummary,
      paymentMethod: paymentMethodLabel,
      transactionId: generateTransactionId(),
      status:
        clsInfo.status === 'AVAILABLE'
          ? 'CONFIRMED'
          : clsInfo.status === 'RAC'
          ? 'RAC'
          : 'WAITLISTED',
      chartPrepared: false,
      bookedAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setConfirmedBooking(newBooking);
    setBookingStep('CONFIRMATION');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelBooking = (pnr: string, refundAmount: number, cancellationFee: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.pnr === pnr
          ? {
              ...b,
              status: 'CANCELLED',
              cancelledAt: new Date().toISOString(),
              refundAmount,
              cancellationFee,
              passengers: b.passengers.map((p) => ({ ...p, currentStatus: 'CAN' })),
            }
          : b
      )
    );
  };

  const handleQuickBookFromSchedule = (fromCode: string, toCode: string) => {
    setSearchQuery((prev) => ({ ...prev, fromCode, toCode }));
    setActiveSection('BOOK');
    setBookingStep('SEARCH');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookAnother = () => {
    setBookingStep('SEARCH');
    setSelectedSegment(null);
    setSelectedSeats([]);
    setConfirmedBooking(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={() => setUser(null)}
        bookingsCount={bookings.length}
      />

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {activeSection === 'BOOK' && (
          <div>
            <BookingStepper
              currentStep={bookingStep}
              onStepClick={(step) => {
                setBookingStep(step);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {bookingStep === 'SEARCH' && (
              <>
                <SearchPanel query={searchQuery} onSearch={handleSearch} />
                <TrainResults
                  query={searchQuery}
                  results={searchResults}
                  onSelectTrainClass={handleSelectTrainClass}
                  onShiftDate={handleShiftDate}
                />
              </>
            )}

            {bookingStep === 'SEATS' && selectedSegment && (
              <SeatSelection
                segment={selectedSegment}
                travelClass={selectedClass}
                travelDate={searchQuery.travelDate}
                passengerCount={searchQuery.passengerCount}
                selectedSeats={selectedSeats}
                onChangeSeats={setSelectedSeats}
                onBack={() => setBookingStep('SEARCH')}
                onContinue={() => {
                  setBookingStep('PASSENGERS');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {bookingStep === 'PASSENGERS' && selectedSegment && (
              <PassengerForm
                passengers={passengers}
                contact={contact}
                selectedSeats={selectedSeats}
                travelClass={selectedClass}
                user={user}
                onChangePassengers={setPassengers}
                onChangeContact={setContact}
                onBack={() => setBookingStep('SEATS')}
                onContinue={() => {
                  setBookingStep('PAYMENT');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {bookingStep === 'PAYMENT' && selectedSegment && activeFareSummary && (
              <PaymentStep
                segment={selectedSegment}
                travelClass={selectedClass}
                travelDate={searchQuery.travelDate}
                passengers={passengers}
                fare={activeFareSummary}
                onBack={() => setBookingStep('PASSENGERS')}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {bookingStep === 'CONFIRMATION' && confirmedBooking && (
              <TicketView
                booking={confirmedBooking}
                onBookAnother={handleBookAnother}
                onViewAllBookings={() => setActiveSection('BOOKINGS')}
              />
            )}
          </div>
        )}

        {activeSection === 'BOOKINGS' && (
          <MyBookings
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onGoToSearch={() => {
              setActiveSection('BOOK');
              setBookingStep('SEARCH');
            }}
          />
        )}

        {activeSection === 'PNR' && <PnrChecker bookings={bookings} />}

        {activeSection === 'SCHEDULE' && (
          <ScheduleLookup onQuickBookRoute={handleQuickBookFromSchedule} />
        )}
      </main>

      <footer className="no-print border-t border-slate-200 bg-white py-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-slate-400">
          <div>RailVista · Session-based railway reservation demo</div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('BOOK')}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Book Tickets
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PNR')}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              PNR Status
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('SCHEDULE')}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Schedules
            </button>
          </div>
        </div>
      </footer>

      {authOpen && (
        <AuthModal
          currentUser={user}
          onClose={() => setAuthOpen(false)}
          onSignIn={(nextUser) => {
            setUser(nextUser);
            setContact({ email: nextUser.email, phone: nextUser.phone });
          }}
        />
      )}
    </div>
  );
}

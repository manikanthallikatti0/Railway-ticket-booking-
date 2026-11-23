/**
 * Core domain models for the RailVista railway ticket booking application.
 */

export type TravelClassCode = 'SL' | '3A' | '2A' | '1A' | 'CC';

export type TrainType = 'Superfast' | 'Express' | 'Rajdhani' | 'Shatabdi' | 'Vande Bharat' | 'Duronto';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type AvailabilityType = 'AVAILABLE' | 'RAC' | 'WAITLIST';

export type BerthType = 'LB' | 'MB' | 'UB' | 'SL' | 'SU' | 'W' | 'M' | 'A';

export type DepartureWindow = 'ALL' | 'EARLY_MORNING' | 'MORNING' | 'AFTERNOON' | 'NIGHT';

export type SortOption = 'EARLIEST' | 'FASTEST' | 'CHEAPEST';

export type AppSection = 'BOOK' | 'BOOKINGS' | 'PNR' | 'SCHEDULE';

export type BookingStep = 'SEARCH' | 'SEATS' | 'PASSENGERS' | 'PAYMENT' | 'CONFIRMATION';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
}

export interface RouteStop {
  stationCode: string;
  arrivalTime: string | null; // null for origin
  departureTime: string | null; // null for terminus
  haltMinutes: number;
  day: number; // 1-indexed journey day
  distanceKm: number; // cumulative km from origin
  platform: string;
}

export interface ClassAvailability {
  code: TravelClassCode;
  status: AvailabilityType;
  count: number; // e.g., Available 24, RAC 6, WL 12
  baseFareFullRoute: number; // Full-route fare in INR
  coaches: string[];
}

export interface Train {
  number: string;
  name: string;
  type: TrainType;
  runningDays: DayOfWeek[];
  stops: RouteStop[];
  classes: ClassAvailability[];
  pantryAvailable: boolean;
}

/** Represents a matched train segment between the searched From & To stations */
export interface MatchedTrainSegment {
  train: Train;
  fromStop: RouteStop;
  toStop: RouteStop;
  fromStation: Station;
  toStation: Station;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  distanceKm: number;
  dayDelta: number;
  segmentClasses: Array<ClassAvailability & { segmentFare: number }>;
}

export interface SeatNode {
  id: string; // e.g., "B1-14"
  coach: string;
  number: number;
  berthType: BerthType;
  status: 'AVAILABLE' | 'BOOKED' | 'SELECTED';
}

export interface SelectedSeat {
  coach: string;
  seatNumber: number;
  berthType: BerthType;
}

export interface PassengerInput {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Non-Binary';
  berthPreference: 'No Preference' | 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'Aisle';
  assignedSeat?: SelectedSeat;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

export interface FareSummary {
  baseFarePerPassenger: number;
  passengerCount: number;
  subtotal: number;
  reservationFee: number;
  convenienceFee: number;
  gstAmount: number;
  total: number;
}

export interface BookedPassenger {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-Binary';
  bookingStatus: string; // e.g. "CNF / B1 / 24 / LB" or "RAC 4"
  currentStatus: string;
  coach: string;
  seatNumber: number | null;
  berthType: string;
}

export interface BookingRecord {
  pnr: string;
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  travelDate: string; // YYYY-MM-DD
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  travelClass: TravelClassCode;
  passengers: BookedPassenger[];
  contact: ContactInfo;
  fare: FareSummary;
  paymentMethod: string;
  transactionId: string;
  status: 'CONFIRMED' | 'RAC' | 'WAITLISTED' | 'CANCELLED';
  chartPrepared: boolean;
  bookedAt: string; // ISO string
  cancelledAt?: string;
  refundAmount?: number;
  cancellationFee?: number;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

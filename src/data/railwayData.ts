import { BookingRecord, DayOfWeek, SeatNode, Station, Train, TravelClassCode, BerthType } from '../types/railway';

/**
 * Human-readable metadata for each supported travel class.
 */
export const CLASS_METADATA: Record<TravelClassCode, { label: string; shortLabel: string; description: string }> = {
  SL: { label: 'Sleeper Class (SL)', shortLabel: 'SL', description: 'Non-AC 3-tier sleeping berths' },
  '3A': { label: 'AC 3 Tier (3A)', shortLabel: '3A', description: 'Air-conditioned 3-tier sleeper coaches' },
  '2A': { label: 'AC 2 Tier (2A)', shortLabel: '2A', description: 'Air-conditioned 2-tier spacious berths with curtains' },
  '1A': { label: 'AC First Class (1A)', shortLabel: '1A', description: 'Private lockable AC cabins and coupes' },
  CC: { label: 'AC Chair Car (CC)', shortLabel: 'CC', description: 'Reclining air-conditioned daytime seating' },
};

export const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * 18 Major Railway Stations across India for autocomplete and multi-stop routing.
 */
export const STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi', zone: 'NR' },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra', zone: 'CR' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR' },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', zone: 'SWR' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Hyderabad', state: 'Telangana', zone: 'SCR' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh', zone: 'NCR' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh', zone: 'WCR' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra', zone: 'CR' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat', zone: 'WR' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat', zone: 'WR' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan', zone: 'WCR' },
];

/**
 * 14 Realistic Trains with multi-stop itineraries, fares, running days, and availability.
 */
export const TRAINS: Train[] = [
  {
    number: '12952',
    name: 'Mumbai Rajdhani Express',
    type: 'Rajdhani',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '16:55', haltMinutes: 0, day: 1, distanceKm: 0, platform: '3' },
      { stationCode: 'KOTA', arrivalTime: '21:40', departureTime: '21:50', haltMinutes: 10, day: 1, distanceKm: 465, platform: '1' },
      { stationCode: 'BRC', arrivalTime: '03:41', departureTime: '03:51', haltMinutes: 10, day: 2, distanceKm: 992, platform: '2' },
      { stationCode: 'ST', arrivalTime: '05:18', departureTime: '05:23', haltMinutes: 5, day: 2, distanceKm: 1121, platform: '1' },
      { stationCode: 'BCT', arrivalTime: '08:35', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1384, platform: '4' },
    ],
    classes: [
      { code: '3A', status: 'AVAILABLE', count: 38, baseFareFullRoute: 2480, coaches: ['B1', 'B2', 'B3', 'B4'] },
      { code: '2A', status: 'AVAILABLE', count: 16, baseFareFullRoute: 3490, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'AVAILABLE', count: 6, baseFareFullRoute: 5820, coaches: ['H1'] },
    ],
  },
  {
    number: '12954',
    name: 'August Kranti Rajdhani',
    type: 'Rajdhani',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '17:15', haltMinutes: 0, day: 1, distanceKm: 0, platform: '5' },
      { stationCode: 'KOTA', arrivalTime: '22:05', departureTime: '22:15', haltMinutes: 10, day: 1, distanceKm: 465, platform: '2' },
      { stationCode: 'BRC', arrivalTime: '04:15', departureTime: '04:25', haltMinutes: 10, day: 2, distanceKm: 992, platform: '1' },
      { stationCode: 'ST', arrivalTime: '05:52', departureTime: '05:57', haltMinutes: 5, day: 2, distanceKm: 1121, platform: '2' },
      { stationCode: 'BCT', arrivalTime: '09:45', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1384, platform: '3' },
    ],
    classes: [
      { code: '3A', status: 'RAC', count: 8, baseFareFullRoute: 2410, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 11, baseFareFullRoute: 3380, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'WAITLIST', count: 4, baseFareFullRoute: 5690, coaches: ['H1'] },
    ],
  },
  {
    number: '22222',
    name: 'CSMT Rajdhani Superfast',
    type: 'Rajdhani',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '16:55', haltMinutes: 0, day: 1, distanceKm: 0, platform: '2' },
      { stationCode: 'BPL', arrivalTime: '00:25', departureTime: '00:35', haltMinutes: 10, day: 2, distanceKm: 702, platform: '1' },
      { stationCode: 'CSMT', arrivalTime: '11:15', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1542, platform: '16' },
    ],
    classes: [
      { code: '3A', status: 'AVAILABLE', count: 29, baseFareFullRoute: 2650, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 14, baseFareFullRoute: 3690, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'AVAILABLE', count: 4, baseFareFullRoute: 6150, coaches: ['H1'] },
    ],
  },
  {
    number: '12138',
    name: 'Punjab Mail Express',
    type: 'Superfast',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '05:15', haltMinutes: 0, day: 1, distanceKm: 0, platform: '7' },
      { stationCode: 'BPL', arrivalTime: '16:40', departureTime: '16:50', haltMinutes: 10, day: 1, distanceKm: 702, platform: '2' },
      { stationCode: 'PUNE', arrivalTime: '04:05', departureTime: '04:15', haltMinutes: 10, day: 2, distanceKm: 1350, platform: '1' },
      { stationCode: 'CSMT', arrivalTime: '07:35', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1542, platform: '12' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 64, baseFareFullRoute: 685, coaches: ['S1', 'S2', 'S3', 'S4'] },
      { code: '3A', status: 'AVAILABLE', count: 22, baseFareFullRoute: 1780, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'RAC', count: 5, baseFareFullRoute: 2540, coaches: ['A1'] },
      { code: '1A', status: 'AVAILABLE', count: 3, baseFareFullRoute: 4290, coaches: ['H1'] },
    ],
  },
  {
    number: '12302',
    name: 'Howrah Rajdhani Express',
    type: 'Rajdhani',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '16:50', haltMinutes: 0, day: 1, distanceKm: 0, platform: '9' },
      { stationCode: 'CNB', arrivalTime: '21:35', departureTime: '21:40', haltMinutes: 5, day: 1, distanceKm: 440, platform: '4' },
      { stationCode: 'PRYJ', arrivalTime: '23:45', departureTime: '23:48', haltMinutes: 3, day: 1, distanceKm: 634, platform: '1' },
      { stationCode: 'HWH', arrivalTime: '09:55', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1450, platform: '9' },
    ],
    classes: [
      { code: '3A', status: 'AVAILABLE', count: 44, baseFareFullRoute: 2590, coaches: ['B1', 'B2', 'B3', 'B4'] },
      { code: '2A', status: 'AVAILABLE', count: 19, baseFareFullRoute: 3610, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'AVAILABLE', count: 5, baseFareFullRoute: 5980, coaches: ['H1'] },
    ],
  },
  {
    number: '12304',
    name: 'Poorva Superfast Express',
    type: 'Superfast',
    runningDays: ['Wed', 'Thu', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '17:40', haltMinutes: 0, day: 1, distanceKm: 0, platform: '12' },
      { stationCode: 'CNB', arrivalTime: '22:55', departureTime: '23:05', haltMinutes: 10, day: 1, distanceKm: 440, platform: '2' },
      { stationCode: 'PRYJ', arrivalTime: '01:25', departureTime: '01:30', haltMinutes: 5, day: 2, distanceKm: 634, platform: '3' },
      { stationCode: 'HWH', arrivalTime: '16:50', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1450, platform: '14' },
    ],
    classes: [
      { code: 'SL', status: 'WAITLIST', count: 14, baseFareFullRoute: 635, coaches: ['S1', 'S2', 'S3'] },
      { code: '3A', status: 'AVAILABLE', count: 18, baseFareFullRoute: 1640, coaches: ['B1', 'B2'] },
      { code: '2A', status: 'AVAILABLE', count: 9, baseFareFullRoute: 2380, coaches: ['A1'] },
    ],
  },
  {
    number: '12004',
    name: 'Lucknow Swarna Shatabdi',
    type: 'Shatabdi',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '06:10', haltMinutes: 0, day: 1, distanceKm: 0, platform: '1' },
      { stationCode: 'CNB', arrivalTime: '11:20', departureTime: '11:25', haltMinutes: 5, day: 1, distanceKm: 440, platform: '1' },
      { stationCode: 'LKO', arrivalTime: '12:55', departureTime: null, haltMinutes: 0, day: 1, distanceKm: 512, platform: '1' },
    ],
    classes: [
      { code: 'CC', status: 'AVAILABLE', count: 52, baseFareFullRoute: 1180, coaches: ['C1', 'C2', 'C3'] },
      { code: '1A', status: 'AVAILABLE', count: 8, baseFareFullRoute: 2290, coaches: ['H1'] },
    ],
  },
  {
    number: '20607',
    name: 'Chennai - Bengaluru Vande Bharat',
    type: 'Vande Bharat',
    runningDays: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'MAS', arrivalTime: null, departureTime: '05:50', haltMinutes: 0, day: 1, distanceKm: 0, platform: '1' },
      { stationCode: 'SBC', arrivalTime: '10:20', departureTime: null, haltMinutes: 0, day: 1, distanceKm: 362, platform: '7' },
    ],
    classes: [
      { code: 'CC', status: 'AVAILABLE', count: 46, baseFareFullRoute: 1090, coaches: ['C1', 'C2', 'C3'] },
      { code: '1A', status: 'AVAILABLE', count: 10, baseFareFullRoute: 1940, coaches: ['H1'] },
    ],
  },
  {
    number: '12028',
    name: 'Bengaluru - Chennai Shatabdi',
    type: 'Shatabdi',
    runningDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'SBC', arrivalTime: null, departureTime: '06:00', haltMinutes: 0, day: 1, distanceKm: 0, platform: '1' },
      { stationCode: 'MAS', arrivalTime: '11:00', departureTime: null, haltMinutes: 0, day: 1, distanceKm: 362, platform: '3' },
    ],
    classes: [
      { code: 'CC', status: 'AVAILABLE', count: 31, baseFareFullRoute: 980, coaches: ['C1', 'C2'] },
      { code: '1A', status: 'RAC', count: 3, baseFareFullRoute: 1850, coaches: ['H1'] },
    ],
  },
  {
    number: '12628',
    name: 'Karnataka Express',
    type: 'Superfast',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '20:20', haltMinutes: 0, day: 1, distanceKm: 0, platform: '6' },
      { stationCode: 'BPL', arrivalTime: '06:25', departureTime: '06:35', haltMinutes: 10, day: 2, distanceKm: 702, platform: '3' },
      { stationCode: 'PUNE', arrivalTime: '20:10', departureTime: '20:20', haltMinutes: 10, day: 2, distanceKm: 1350, platform: '2' },
      { stationCode: 'SBC', arrivalTime: '12:00', departureTime: null, haltMinutes: 0, day: 3, distanceKm: 2295, platform: '4' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 48, baseFareFullRoute: 890, coaches: ['S1', 'S2', 'S3', 'S4'] },
      { code: '3A', status: 'AVAILABLE', count: 17, baseFareFullRoute: 2280, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 9, baseFareFullRoute: 3250, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'WAITLIST', count: 2, baseFareFullRoute: 5420, coaches: ['H1'] },
    ],
  },
  {
    number: '12724',
    name: 'Telangana Express',
    type: 'Superfast',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '16:00', haltMinutes: 0, day: 1, distanceKm: 0, platform: '4' },
      { stationCode: 'BPL', arrivalTime: '01:20', departureTime: '01:28', haltMinutes: 8, day: 2, distanceKm: 702, platform: '1' },
      { stationCode: 'NGP', arrivalTime: '07:15', departureTime: '07:25', haltMinutes: 10, day: 2, distanceKm: 1091, platform: '2' },
      { stationCode: 'SC', arrivalTime: '16:15', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1666, platform: '1' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 35, baseFareFullRoute: 710, coaches: ['S1', 'S2', 'S3'] },
      { code: '3A', status: 'RAC', count: 12, baseFareFullRoute: 1840, coaches: ['B1', 'B2'] },
      { code: '2A', status: 'AVAILABLE', count: 13, baseFareFullRoute: 2630, coaches: ['A1'] },
      { code: '1A', status: 'AVAILABLE', count: 4, baseFareFullRoute: 4410, coaches: ['H1'] },
    ],
  },
  {
    number: '12262',
    name: 'Howrah - Mumbai Duronto',
    type: 'Duronto',
    runningDays: ['Tue', 'Wed', 'Fri', 'Sat'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'HWH', arrivalTime: null, departureTime: '05:45', haltMinutes: 0, day: 1, distanceKm: 0, platform: '17' },
      { stationCode: 'NGP', arrivalTime: '19:45', departureTime: '19:55', haltMinutes: 10, day: 1, distanceKm: 1132, platform: '1' },
      { stationCode: 'PUNE', arrivalTime: '05:10', departureTime: '05:15', haltMinutes: 5, day: 2, distanceKm: 1776, platform: '3' },
      { stationCode: 'CSMT', arrivalTime: '08:15', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1968, platform: '14' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 41, baseFareFullRoute: 820, coaches: ['S1', 'S2', 'S3'] },
      { code: '3A', status: 'AVAILABLE', count: 27, baseFareFullRoute: 2140, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 12, baseFareFullRoute: 3090, coaches: ['A1'] },
      { code: '1A', status: 'AVAILABLE', count: 5, baseFareFullRoute: 5120, coaches: ['H1'] },
    ],
  },
  {
    number: '12958',
    name: 'Swarna Jayanti Rajdhani',
    type: 'Rajdhani',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'NDLS', arrivalTime: null, departureTime: '19:55', haltMinutes: 0, day: 1, distanceKm: 0, platform: '8' },
      { stationCode: 'JP', arrivalTime: '00:25', departureTime: '00:35', haltMinutes: 10, day: 2, distanceKm: 308, platform: '1' },
      { stationCode: 'ADI', arrivalTime: '09:30', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 934, platform: '2' },
    ],
    classes: [
      { code: '3A', status: 'AVAILABLE', count: 31, baseFareFullRoute: 2180, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 15, baseFareFullRoute: 2990, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'AVAILABLE', count: 6, baseFareFullRoute: 4860, coaches: ['H1'] },
    ],
  },
  {
    number: '20901',
    name: 'Mumbai Central - Ahmedabad Vande Bharat',
    type: 'Vande Bharat',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'BCT', arrivalTime: null, departureTime: '06:00', haltMinutes: 0, day: 1, distanceKm: 0, platform: '2' },
      { stationCode: 'ST', arrivalTime: '08:50', departureTime: '08:53', haltMinutes: 3, day: 1, distanceKm: 263, platform: '1' },
      { stationCode: 'BRC', arrivalTime: '10:08', departureTime: '10:11', haltMinutes: 3, day: 1, distanceKm: 392, platform: '2' },
      { stationCode: 'ADI', arrivalTime: '11:25', departureTime: null, haltMinutes: 0, day: 1, distanceKm: 492, platform: '1' },
    ],
    classes: [
      { code: 'CC', status: 'AVAILABLE', count: 68, baseFareFullRoute: 1320, coaches: ['C1', 'C2', 'C3'] },
      { code: '1A', status: 'AVAILABLE', count: 14, baseFareFullRoute: 2460, coaches: ['H1'] },
    ],
  },
  {
    number: '11013',
    name: 'Coimbatore - Mumbai LTT Express',
    type: 'Express',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: false,
    stops: [
      { stationCode: 'SBC', arrivalTime: null, departureTime: '16:15', haltMinutes: 0, day: 1, distanceKm: 0, platform: '5' },
      { stationCode: 'PUNE', arrivalTime: '10:45', departureTime: '10:55', haltMinutes: 10, day: 2, distanceKm: 945, platform: '4' },
      { stationCode: 'CSMT', arrivalTime: '14:25', departureTime: null, haltMinutes: 0, day: 2, distanceKm: 1137, platform: '11' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 54, baseFareFullRoute: 520, coaches: ['S1', 'S2', 'S3'] },
      { code: '3A', status: 'AVAILABLE', count: 19, baseFareFullRoute: 1380, coaches: ['B1', 'B2'] },
      { code: '2A', status: 'RAC', count: 4, baseFareFullRoute: 1990, coaches: ['A1'] },
    ],
  },
  {
    number: '12621',
    name: 'Tamil Nadu Superfast Express',
    type: 'Superfast',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    pantryAvailable: true,
    stops: [
      { stationCode: 'MAS', arrivalTime: null, departureTime: '22:00', haltMinutes: 0, day: 1, distanceKm: 0, platform: '5' },
      { stationCode: 'SC', arrivalTime: '09:10', departureTime: '09:20', haltMinutes: 10, day: 2, distanceKm: 710, platform: '2' },
      { stationCode: 'NGP', arrivalTime: '17:50', departureTime: '18:00', haltMinutes: 10, day: 2, distanceKm: 1285, platform: '1' },
      { stationCode: 'BPL', arrivalTime: '23:45', departureTime: '23:55', haltMinutes: 10, day: 2, distanceKm: 1674, platform: '2' },
      { stationCode: 'NDLS', arrivalTime: '06:35', departureTime: null, haltMinutes: 0, day: 3, distanceKm: 2182, platform: '4' },
    ],
    classes: [
      { code: 'SL', status: 'AVAILABLE', count: 32, baseFareFullRoute: 840, coaches: ['S1', 'S2', 'S3', 'S4'] },
      { code: '3A', status: 'AVAILABLE', count: 21, baseFareFullRoute: 2160, coaches: ['B1', 'B2', 'B3'] },
      { code: '2A', status: 'AVAILABLE', count: 8, baseFareFullRoute: 3110, coaches: ['A1', 'A2'] },
      { code: '1A', status: 'AVAILABLE', count: 2, baseFareFullRoute: 5250, coaches: ['H1'] },
    ],
  },
];

/**
 * Popular quick-fill routes displayed beneath the search panel.
 */
export const POPULAR_ROUTES = [
  { from: 'NDLS', to: 'BCT', label: 'New Delhi → Mumbai' },
  { from: 'NDLS', to: 'HWH', label: 'New Delhi → Howrah' },
  { from: 'MAS', to: 'SBC', label: 'Chennai → Bengaluru' },
  { from: 'NDLS', to: 'ADI', label: 'New Delhi → Ahmedabad' },
  { from: 'HWH', to: 'CSMT', label: 'Howrah → Mumbai CSMT' },
  { from: 'BCT', to: 'ADI', label: 'Mumbai → Ahmedabad' },
];

/**
 * Generates deterministic coach seat layout for a given train, class, and coach ID.
 * - SL / 3A: 32 berths shown cleanly in 4 bays of 8 (LB, MB, UB, LB, MB, UB, SL, SU)
 * - 2A: 24 berths in 4 bays of 6 (LB, UB, LB, UB, SL, SU)
 * - 1A: 16 berths in 4 cabins of 4 (LB, UB, LB, UB)
 * - CC: 35 seats in 7 rows of 5 (3+2: W, M, A | A, W)
 */
export function generateCoachSeats(trainNumber: string, travelClass: TravelClassCode, coachId: string): SeatNode[] {
  const seedBase = Number(trainNumber.replace(/\D/g, '')) + coachId.charCodeAt(0) * 17 + (coachId.charCodeAt(1) || 0) * 31;
  const isBooked = (seatNum: number) => {
    const hash = (seedBase + seatNum * 13) % 10;
    return hash === 1 || hash === 4 || hash === 7;
  };

  const seats: SeatNode[] = [];

  if (travelClass === 'SL' || travelClass === '3A') {
    const pattern: BerthType[] = ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
    for (let i = 1; i <= 32; i++) {
      seats.push({
        id: `${coachId}-${i}`,
        coach: coachId,
        number: i,
        berthType: pattern[(i - 1) % 8],
        status: isBooked(i) ? 'BOOKED' : 'AVAILABLE',
      });
    }
  } else if (travelClass === '2A') {
    const pattern: BerthType[] = ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'];
    for (let i = 1; i <= 24; i++) {
      seats.push({
        id: `${coachId}-${i}`,
        coach: coachId,
        number: i,
        berthType: pattern[(i - 1) % 6],
        status: isBooked(i) ? 'BOOKED' : 'AVAILABLE',
      });
    }
  } else if (travelClass === '1A') {
    const pattern: BerthType[] = ['LB', 'UB', 'LB', 'UB'];
    for (let i = 1; i <= 16; i++) {
      seats.push({
        id: `${coachId}-${i}`,
        coach: coachId,
        number: i,
        berthType: pattern[(i - 1) % 4],
        status: isBooked(i) ? 'BOOKED' : 'AVAILABLE',
      });
    }
  } else {
    // Chair Car (CC): 3+2 configuration -> W, M, A | A, W
    const pattern: BerthType[] = ['W', 'M', 'A', 'A', 'W'];
    for (let i = 1; i <= 35; i++) {
      seats.push({
        id: `${coachId}-${i}`,
        coach: coachId,
        number: i,
        berthType: pattern[(i - 1) % 5],
        status: isBooked(i) ? 'BOOKED' : 'AVAILABLE',
      });
    }
  }

  return seats;
}

/**
 * Helper to get YYYY-MM-DD offset from today.
 */
export function getOffsetDate(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Pre-seeded session bookings so My Bookings and PNR Status work immediately.
 */
export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    pnr: '4829104752',
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    trainType: 'Rajdhani',
    fromCode: 'NDLS',
    fromName: 'New Delhi',
    toCode: 'BCT',
    toName: 'Mumbai Central',
    travelDate: getOffsetDate(5),
    departureTime: '16:55',
    arrivalTime: '08:35',
    durationMinutes: 940,
    travelClass: '3A',
    passengers: [
      {
        name: 'Aarav Sharma',
        age: 31,
        gender: 'Male',
        bookingStatus: 'CNF / B2 / 17 / LB',
        currentStatus: 'CNF / B2 / 17 / LB',
        coach: 'B2',
        seatNumber: 17,
        berthType: 'LB',
      },
      {
        name: 'Meera Sharma',
        age: 29,
        gender: 'Female',
        bookingStatus: 'CNF / B2 / 20 / LB',
        currentStatus: 'CNF / B2 / 20 / LB',
        coach: 'B2',
        seatNumber: 20,
        berthType: 'LB',
      },
    ],
    contact: {
      email: 'aarav.sharma@example.com',
      phone: '9876543210',
    },
    fare: {
      baseFarePerPassenger: 2480,
      passengerCount: 2,
      subtotal: 4960,
      reservationFee: 80,
      convenienceFee: 35,
      gstAmount: 252,
      total: 5327,
    },
    paymentMethod: 'UPI (aarav@okaxis)',
    transactionId: 'TXN884129043',
    status: 'CONFIRMED',
    chartPrepared: false,
    bookedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    pnr: '6510392841',
    trainNumber: '20607',
    trainName: 'Chennai - Bengaluru Vande Bharat',
    trainType: 'Vande Bharat',
    fromCode: 'MAS',
    fromName: 'MGR Chennai Central',
    toCode: 'SBC',
    toName: 'KSR Bengaluru',
    travelDate: getOffsetDate(1),
    departureTime: '05:50',
    arrivalTime: '10:20',
    durationMinutes: 270,
    travelClass: 'CC',
    passengers: [
      {
        name: 'Priya Nair',
        age: 27,
        gender: 'Female',
        bookingStatus: 'CNF / C1 / 10 / W',
        currentStatus: 'CNF / C1 / 10 / W',
        coach: 'C1',
        seatNumber: 10,
        berthType: 'W',
      },
    ],
    contact: {
      email: 'priya.nair@example.com',
      phone: '9123456780',
    },
    fare: {
      baseFarePerPassenger: 1090,
      passengerCount: 1,
      subtotal: 1090,
      reservationFee: 40,
      convenienceFee: 35,
      gstAmount: 57,
      total: 1222,
    },
    paymentMethod: 'Visa Card (•••• 4242)',
    transactionId: 'TXN772109842',
    status: 'CONFIRMED',
    chartPrepared: true,
    bookedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

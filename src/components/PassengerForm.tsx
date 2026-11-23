import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, UserCheck } from 'lucide-react';
import { ContactInfo, MockUser, PassengerInput, SelectedSeat, TravelClassCode } from '../types/railway';
import { BERTH_LABELS } from '../utils/railwayHelpers';

interface PassengerFormProps {
  passengers: PassengerInput[];
  contact: ContactInfo;
  selectedSeats: SelectedSeat[];
  travelClass: TravelClassCode;
  user: MockUser | null;
  onChangePassengers: (next: PassengerInput[]) => void;
  onChangeContact: (next: ContactInfo) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface ValidationErrors {
  passengers: Record<string, { name?: string; age?: string }>;
  email?: string;
  phone?: string;
}

export const PassengerForm: React.FC<PassengerFormProps> = ({
  passengers,
  contact,
  selectedSeats,
  travelClass,
  user,
  onChangePassengers,
  onChangeContact,
  onBack,
  onContinue,
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({ passengers: {} });
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const berthOptions =
    travelClass === 'CC'
      ? (['No Preference', 'Window', 'Aisle'] as const)
      : travelClass === '1A' || travelClass === '2A'
      ? (['No Preference', 'Lower', 'Upper', 'Side Lower', 'Side Upper'] as const)
      : (['No Preference', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'] as const);

  const updatePassenger = (id: string, patch: Partial<PassengerInput>) => {
    onChangePassengers(passengers.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleAutoFillUser = () => {
    if (!user) return;
    onChangeContact({ email: user.email, phone: user.phone });
    if (passengers.length > 0 && !passengers[0].name.trim()) {
      updatePassenger(passengers[0].id, { name: user.name });
    }
  };

  const validate = (): boolean => {
    const nextErrors: ValidationErrors = { passengers: {} };
    let valid = true;

    passengers.forEach((p) => {
      const pErr: { name?: string; age?: string } = {};
      if (!p.name.trim() || p.name.trim().length < 2) {
        pErr.name = 'Enter full name (at least 2 characters).';
        valid = false;
      }
      const ageNum = Number(p.age);
      if (!p.age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        pErr.age = 'Age must be between 1 and 120.';
        valid = false;
      }
      if (pErr.name || pErr.age) {
        nextErrors.passengers[p.id] = pErr;
      }
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email.trim())) {
      nextErrors.email = 'Enter a valid email address for e-ticket delivery.';
      valid = false;
    }

    const digits = contact.phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      nextErrors.phone = 'Enter a valid 10-digit mobile number.';
      valid = false;
    }

    setErrors(nextErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (validate()) {
      onContinue();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Passenger Details</h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              Enter details matching a valid government photo ID for boarding verification.
            </p>
          </div>
          {user && (
            <button
              type="button"
              onClick={handleAutoFillUser}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 whitespace-nowrap shrink-0 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
            >
              <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Use Account Details</span>
            </button>
          )}
        </div>

        <div className="mt-5 divide-y divide-slate-200 dark:divide-slate-800">
          {passengers.map((pax, idx) => {
            const seat = selectedSeats[idx];
            const paxErr = errors.passengers[pax.id] || {};

            return (
              <div key={pax.id} className={idx === 0 ? 'pb-5' : 'py-5'}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Passenger {idx + 1}
                  </h3>
                  {seat ? (
                    <span className="font-mono text-xs font-medium text-blue-700 dark:text-blue-400">
                      Assigned Seat: {seat.coach} · {seat.seatNumber} ({BERTH_LABELS[seat.berthType]})
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-allocated at chart preparation
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
                  {/* Full Name */}
                  <div className="sm:col-span-5">
                    <label
                      htmlFor={`pax-name-${pax.id}`}
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`pax-name-${pax.id}`}
                      type="text"
                      value={pax.name}
                      onChange={(e) => {
                        updatePassenger(pax.id, { name: e.target.value });
                        if (submittedOnce) setTimeout(validate, 0);
                      }}
                      placeholder="e.g., Aarav Sharma"
                      aria-invalid={Boolean(paxErr.name)}
                      className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-slate-950 dark:text-slate-100 ${
                        paxErr.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {paxErr.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{paxErr.name}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`pax-age-${pax.id}`}
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`pax-age-${pax.id}`}
                      type="number"
                      min={1}
                      max={120}
                      value={pax.age}
                      onChange={(e) => {
                        updatePassenger(pax.id, { age: e.target.value });
                        if (submittedOnce) setTimeout(validate, 0);
                      }}
                      placeholder="Age"
                      aria-invalid={Boolean(paxErr.age)}
                      className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-slate-950 dark:text-slate-100 ${
                        paxErr.age ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {paxErr.age && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">{paxErr.age}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor={`pax-gender-${pax.id}`}
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Gender
                    </label>
                    <select
                      id={`pax-gender-${pax.id}`}
                      value={pax.gender}
                      onChange={(e) =>
                        updatePassenger(pax.id, {
                          gender: e.target.value as PassengerInput['gender'],
                        })
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                    </select>
                  </div>

                  {/* Berth Preference */}
                  <div className="sm:col-span-3">
                    <label
                      htmlFor={`pax-berth-${pax.id}`}
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Berth Preference
                    </label>
                    <select
                      id={`pax-berth-${pax.id}`}
                      value={pax.berthPreference}
                      onChange={(e) =>
                        updatePassenger(pax.id, {
                          berthPreference: e.target.value as PassengerInput['berthPreference'],
                        })
                      }
                      className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      {berthOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Contact Information</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Your e-ticket, PNR alerts, and refund notifications will be sent here.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="contact-email"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={contact.email}
              onChange={(e) => onChangeContact({ ...contact, email: e.target.value })}
              placeholder="name@example.com"
              aria-invalid={Boolean(errors.email)}
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-slate-950 dark:text-slate-100 ${
                errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="contact-phone"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Mobile Number (10 digits) <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              inputMode="numeric"
              value={contact.phone}
              onChange={(e) => onChangeContact({ ...contact, phone: e.target.value })}
              placeholder="9876543210"
              aria-invalid={Boolean(errors.phone)}
              className={`h-11 w-full rounded-lg border bg-white px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:bg-slate-950 dark:text-slate-100 ${
                errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
            )}
          </div>
        </div>

        {(Object.keys(errors.passengers).length > 0 || errors.email || errors.phone) && (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Please fix the highlighted passenger or contact fields before proceeding to payment.</span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Seat Selection</span>
          </button>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
};

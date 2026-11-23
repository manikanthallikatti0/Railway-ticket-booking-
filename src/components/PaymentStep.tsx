import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  XCircle,
} from 'lucide-react';
import { FareSummary, MatchedTrainSegment, PassengerInput, TravelClassCode } from '../types/railway';
import { formatCurrency, formatDisplayDate } from '../utils/railwayHelpers';

interface PaymentStepProps {
  segment: MatchedTrainSegment;
  travelClass: TravelClassCode;
  travelDate: string;
  passengers: PassengerInput[];
  fare: FareSummary;
  onBack: () => void;
  onPaymentSuccess: (paymentMethodLabel: string) => void;
}

type PaymentTab = 'UPI' | 'CARD' | 'NETBANKING';

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'];

export const PaymentStep: React.FC<PaymentStepProps> = ({
  segment,
  travelClass,
  travelDate,
  passengers,
  fare,
  onBack,
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('UPI');
  const [upiId, setUpiId] = useState('traveler@okaxis');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState(passengers[0]?.name || 'Aarav Sharma');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);

  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [paymentFailureMessage, setPaymentFailureMessage] = useState<string | null>(null);

  const validateInputs = (): boolean => {
    setValidationError(null);
    if (activeTab === 'UPI') {
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setValidationError('Enter a valid UPI ID (example: name@okaxis or mobile@ybl).');
        return false;
      }
      return true;
    }

    if (activeTab === 'CARD') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(digits)) {
        setValidationError('Enter a valid 16-digit card number.');
        return false;
      }
      if (!cardName.trim()) {
        setValidationError('Enter the cardholder name.');
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.trim())) {
        setValidationError('Enter card expiry in MM/YY format.');
        return false;
      }
      if (!/^\d{3,4}$/.test(cardCvv.trim())) {
        setValidationError('Enter a valid 3 or 4 digit CVV.');
        return false;
      }
      return true;
    }

    return Boolean(selectedBank);
  };

  const getMethodLabel = (): string => {
    if (activeTab === 'UPI') return `UPI (${upiId.trim()})`;
    if (activeTab === 'CARD') return `Card (•••• ${cardNumber.replace(/\s+/g, '').slice(-4)})`;
    return `Net Banking (${selectedBank})`;
  };

  const handleTriggerPayment = (simulateSuccess: boolean) => {
    setPaymentFailureMessage(null);
    if (!validateInputs()) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (simulateSuccess) {
        onPaymentSuccess(getMethodLabel());
      } else {
        setPaymentFailureMessage(
          `Payment declined by ${activeTab === 'UPI' ? 'UPI gateway' : activeTab === 'CARD' ? 'issuing bank' : selectedBank}. No funds were deducted. You may retry or switch payment methods.`
        );
      }
    }, 650);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Left: Payment Methods */}
      <div className="lg:col-span-8 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment</h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Choose a payment method and test either a successful or declined transaction.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Mock Checkout</span>
            </div>
          </div>

          {/* Method tabs */}
          <div
            role="tablist"
            aria-label="Payment methods"
            className="mt-5 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-950"
          >
            {(
              [
                { id: 'UPI', label: 'UPI', Icon: Smartphone },
                { id: 'CARD', label: 'Card', Icon: CreditCard },
                { id: 'NETBANKING', label: 'Net Banking', Icon: Building2 },
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveTab(id);
                    setValidationError(null);
                    setPaymentFailureMessage(null);
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-md px-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Payment panel content */}
          <div className="mt-5">
            {activeTab === 'UPI' && (
              <div className="space-y-3">
                <label htmlFor="upi-id" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enter UPI ID / VPA
                </label>
                <input
                  id="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@okaxis"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  {['@okaxis', '@ybl', '@okhdfcbank', '@paytm'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setUpiId(`${upiId.split('@')[0] || 'traveler'}${handle}`)}
                      className="rounded-md border border-slate-200 px-2.5 py-1 font-mono text-slate-600 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'CARD' && (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="card-num" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Card Number
                  </label>
                  <input
                    id="card-num"
                    type="text"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardNumber(formatted);
                    }}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="card-name" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cardholder Name
                  </label>
                  <input
                    id="card-name"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="card-exp" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Expiry (MM/YY)
                  </label>
                  <input
                    id="card-exp"
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="card-cvv" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    CVV
                  </label>
                  <input
                    id="card-cvv"
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {activeTab === 'NETBANKING' && (
              <div className="space-y-2.5">
                <label htmlFor="bank-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Your Bank
                </label>
                <select
                  id="bank-select"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {validationError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{validationError}</span>
            </div>
          )}

          {paymentFailureMessage && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
            >
              <div className="flex items-start gap-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
                <div>
                  <div className="font-semibold">Payment Failed</div>
                  <p className="mt-1 text-xs leading-relaxed">{paymentFailureMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons: Simulate Success & Simulate Failure */}
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <button
              type="button"
              disabled={processing}
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Edit Passengers</span>
            </button>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleTriggerPayment(false)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                <span>Simulate Failure</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleTriggerPayment(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>Pay {formatCurrency(fare.total)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Fare Breakdown */}
      <aside className="lg:col-span-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Fare Summary</h3>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {segment.train.number} · {segment.train.name} ({travelClass})
            <br />
            {segment.fromStation.code} → {segment.toStation.code} · {formatDisplayDate(travelDate)}
          </div>

          <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">
                Ticket Fare ({fare.passengerCount} × {formatCurrency(fare.baseFarePerPassenger)})
              </dt>
              <dd className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(fare.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Reservation Charges</dt>
              <dd className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(fare.reservationFee)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">Convenience Fee</dt>
              <dd className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(fare.convenienceFee)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600 dark:text-slate-400">GST (5% AC classes)</dt>
              <dd className="font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(fare.gstAmount)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
              <dt>Total Payable</dt>
              <dd className="font-mono tabular-nums text-blue-600 dark:text-blue-400">
                {formatCurrency(fare.total)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Travellers: {passengers.map((p) => p.name).join(', ')}
          </div>
        </div>
      </aside>
    </div>
  );
};

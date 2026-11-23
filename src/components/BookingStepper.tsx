import React from 'react';
import { Check } from 'lucide-react';
import { BookingStep } from '../types/railway';

interface BookingStepperProps {
  currentStep: BookingStep;
  onStepClick: (step: BookingStep) => void;
}

const STEPS: Array<{ id: BookingStep; number: number; label: string }> = [
  { id: 'SEARCH', number: 1, label: 'Select Train' },
  { id: 'SEATS', number: 2, label: 'Choose Seats' },
  { id: 'PASSENGERS', number: 3, label: 'Passengers' },
  { id: 'PAYMENT', number: 4, label: 'Payment' },
  { id: 'CONFIRMATION', number: 5, label: 'E-Ticket' },
];

export const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, onStepClick }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Booking progress" className="no-print mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900">
      <ol className="flex items-center justify-between gap-2 overflow-x-auto">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const canNavigateBack = isCompleted && currentStep !== 'CONFIRMATION';

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 min-w-fit">
              <button
                type="button"
                disabled={!canNavigateBack}
                onClick={() => canNavigateBack && onStepClick(step.id)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  canNavigateBack ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'border-2 border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'border border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.number}
                </span>
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    isCurrent
                      ? 'text-slate-900 font-semibold dark:text-white'
                      : isCompleted
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`hidden sm:block h-px flex-1 min-w-[20px] ${
                    index < currentIndex ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

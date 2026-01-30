import React from 'react';
import { User, Briefcase, MapPin, AlertCircle, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Personal Details', icon: User },
  { number: 2, title: 'Job Information', icon: Briefcase },
  { number: 3, title: 'Address', icon: MapPin },
  { number: 4, title: 'Emergency', icon: AlertCircle },
  { number: 5, title: 'Documents', icon: FileText },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isActive && 'bg-primary border-primary text-white',
                  isCompleted && 'border-green-500 bg-green-500 text-white',
                  !isActive && !isCompleted && 'border-gray-300 text-gray-400'
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  isActive && 'text-primary',
                  isCompleted && 'text-green-500',
                  !isActive && !isCompleted && 'text-gray-400'
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 transition-all',
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

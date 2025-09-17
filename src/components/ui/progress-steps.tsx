import { cn } from './utils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  completed?: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-6', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex-1 flex items-center">
          <div className="flex flex-col items-center">
            {/* Step circle */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
              step.completed || currentStep > step.id 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                : currentStep === step.id
                ? 'bg-pink-100 border-2 border-pink-500 text-pink-500'
                : 'bg-gray-100 border-2 border-gray-300 text-gray-400'
            )}>
              {step.completed || currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{step.id}</span>
              )}
            </div>
            
            {/* Step label */}
            <span className={cn(
              'text-xs mt-2 text-center max-w-16 leading-tight transition-colors',
              currentStep >= step.id ? 'text-pink-600' : 'text-gray-500'
            )}>
              {step.label}
            </span>
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-4 transition-colors duration-300',
              currentStep > step.id ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-gray-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
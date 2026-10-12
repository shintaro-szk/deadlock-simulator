import { motion } from 'framer-motion';
import { SimulationState } from '../core/types';

interface ProgressIndicatorProps {
  state: SimulationState;
  maxSteps?: number;
}

export function ProgressIndicator({ state, maxSteps = 10 }: ProgressIndicatorProps) {
  const progress = Math.min((state.currentStep / maxSteps) * 100, 100);
  const isComplete = state.currentStep >= maxSteps || state.isDeadlocked;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Simulation Progress
        </span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {state.currentStep} / {maxSteps}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className={`
            h-full rounded-full
            ${isComplete
              ? 'bg-deadlock'
              : state.isDeadlocked
              ? 'bg-waiting'
              : 'bg-safe'
            }
          `}
        />
      </div>

      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        {isComplete ? (
          <span className="font-semibold">
            {state.isDeadlocked ? 'Deadlock detected' : 'Simulation complete'}
          </span>
        ) : (
          <span>Step {state.currentStep + 1} in progress</span>
        )}
      </div>
    </div>
  );
}

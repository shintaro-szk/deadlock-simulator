import { motion } from 'framer-motion';
import { SimulationState } from '../core/types';

interface StatusPanelProps {
  state: SimulationState;
}

export function StatusPanel({ state }: StatusPanelProps) {
  const getStatusColor = () => {
    if (state.isDeadlocked) return 'text-deadlock';
    return 'text-safe';
  };

  const getStatusText = () => {
    if (state.isDeadlocked) return 'Deadlocked';
    return 'Running';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Simulation Status
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Current Step
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {state.currentStep}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Status
          </div>
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Processes
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {state.processes.length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
        >
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Resources
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {state.resources.length}
          </div>
        </motion.div>
      </div>

      {state.history.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Last Action
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
            {state.history[state.history.length - 1]?.action || 'No actions yet'}
          </div>
        </motion.div>
      )}
    </div>
  );
}

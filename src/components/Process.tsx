import { motion } from 'framer-motion';
import { Process as ProcessType } from '../core/types';

interface ProcessProps {
  process: ProcessType;
}

const stateStyles = {
  idle: 'bg-process text-white',
  waiting: 'bg-waiting text-white',
  running: 'bg-safe text-white',
  blocked: 'bg-deadlock text-white',
};

const stateLabels = {
  idle: 'Idle',
  waiting: 'Waiting',
  running: 'Running',
  blocked: 'Blocked',
};

export function Process({ process }: ProcessProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        rounded-lg p-4 shadow-lg transition-colors duration-300
        ${stateStyles[process.state]}
      `}
    >
      <div className="font-semibold text-lg">{process.name}</div>
      <div className="text-sm opacity-90 mt-1">{stateLabels[process.state]}</div>
      
      {process.heldResources.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium mb-1">Holding:</div>
          <div className="flex flex-wrap gap-1">
            {process.heldResources.map((resourceId) => (
              <span
                key={resourceId}
                className="text-xs bg-white/20 px-2 py-0.5 rounded"
              >
                {resourceId}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {process.requestedResources.length > 0 && (
        <div className="mt-2">
          <div className="text-xs font-medium mb-1">Requesting:</div>
          <div className="flex flex-wrap gap-1">
            {process.requestedResources.map((resourceId) => (
              <span
                key={resourceId}
                className="text-xs bg-white/20 px-2 py-0.5 rounded"
              >
                {resourceId}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

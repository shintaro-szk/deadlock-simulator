import { motion } from 'framer-motion';

interface DeadlockConditionsPanelProps {}

export function DeadlockConditionsPanel({}: DeadlockConditionsPanelProps) {
  const conditions = [
    {
      name: 'Mutual Exclusion',
      description: 'Resources cannot be shared. Only one process can use a resource at a time.',
      example: 'A printer can only print one document at a time.',
    },
    {
      name: 'Hold and Wait',
      description: 'Processes hold resources while waiting for other resources.',
      example: 'Process A holds Resource 1 while waiting for Resource 2.',
    },
    {
      name: 'No Preemption',
      description: 'Resources cannot be taken away from a process. They must be released voluntarily.',
      example: 'A process cannot force another to give up a resource.',
    },
    {
      name: 'Circular Wait',
      description: 'A set of processes wait for each other in a circle.',
      example: 'Process A waits for B, B waits for C, and C waits for A.',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Four Necessary Conditions for Deadlock
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        All four conditions must be present simultaneously for a deadlock to occur.
        Removing any one condition prevents deadlock.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditions.map((condition, index) => (
          <motion.div
            key={condition.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-process"
          >
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {index + 1}. {condition.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {condition.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 italic">
              Example: {condition.example}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-deadlock/10 border border-deadlock rounded-lg"
      >
        <p className="text-sm text-deadlock font-semibold">
          Prevention Strategy: Break any one condition to prevent deadlock.
        </p>
      </motion.div>
    </div>
  );
}

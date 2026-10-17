import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DeadlockConditionsPanelProps {}

export function DeadlockConditionsPanel({}: DeadlockConditionsPanelProps) {
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  const conditions = [
    {
      id: 'mutual-exclusion',
      name: 'Mutual Exclusion',
      description: 'At least one resource cannot be shared; only one process at a time can use it.',
      example: 'A printer can only print one document at a time.',
      details: 'If another process requests the resource, it must wait until it is released. Prevention only works if the resource is shareable. Eliminating mutual exclusion is not possible for all types of resources.',
    },
    {
      id: 'hold-wait',
      name: 'Hold and Wait',
      description: 'A process holds at least one resource and waits to acquire additional resources held by other processes.',
      example: 'Process 2 holds a printer, but it is waiting for disk access (Process 1).',
      details: 'Creates the "waiting chain" essential to deadlocks. Prevention: Request all resources before starting (low resource utilization) OR release all resources before new request (may cause starvation).',
    },
    {
      id: 'no-preemption',
      name: 'No Preemption',
      description: 'Resources cannot be forcibly taken away; they must be released voluntarily.',
      example: 'If a process holds a lock on a file, the OS cannot just snatch it away.',
      details: 'Ensures fairness but risks deadlock. Prevention: Processes release resources voluntarily. If request unavailable, release all held resources and wait. Works well for CPU/memory, not for devices like printers.',
    },
    {
      id: 'circular-wait',
      name: 'Circular Wait',
      description: 'A closed chain of processes exists where each holds a resource the next one needs.',
      example: 'Process A waits for B, B waits for C, and C waits for A.',
      details: 'Forms a cycle, locking them forever. Prevention: Resource ordering - assign each resource a strict order/number. Processes request only in increasing order. Breaks the cycle.',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedCondition(expandedCondition === id ? null : id);
  };

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
            key={condition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-process overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(condition.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedCondition === condition.id}
            >
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {index + 1}. {condition.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {condition.description}
                </p>
              </div>
              {expandedCondition === condition.id ? (
                <ChevronUp size={20} className="text-process flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown size={20} className="text-process flex-shrink-0 ml-2" />
              )}
            </button>

            <AnimatePresence>
              {expandedCondition === condition.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-2">
                      Example: {condition.example}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {condition.details}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-deadlock/10 border border-deadlock rounded-lg"
      >
        <p className="text-sm text-deadlock font-semibold mb-2">
          Prevention Strategy: Break any one condition to prevent deadlock.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-resource/10 border border-resource rounded-lg"
      >
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Characterization & Implications
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          If any one of those conditions is broken, deadlock cannot happen. Many prevention strategies aim to violate one condition.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          In Resource Allocation Graphs (RAG): a cycle implies deadlock for single-instance resources. For multiple-instance resources, a cycle is necessary but not sufficient (must check availability).
        </p>
      </motion.div>
    </div>
  );
}

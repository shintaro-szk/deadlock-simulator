import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface PreventionStrategiesPanelProps {}

export function PreventionStrategiesPanel({}: PreventionStrategiesPanelProps) {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const strategies = [
    {
      id: 'mutual-exclusion',
      name: 'Eliminate Mutual Exclusion',
      description: 'Make resources shareable so multiple processes can use them simultaneously.',
      example: 'Read-only files can be accessed by multiple processes at the same time.',
      details: 'Prevention only works if the resource is shareable. Not possible for all resource types like printers.',
      pros: ['Eliminates deadlock for shareable resources', 'Simple to implement for read-only data'],
      cons: ['Not possible for non-sharable resources (printers, exclusive locks)', 'Limited applicability'],
      possible: false,
    },
    {
      id: 'hold-wait',
      name: 'Eliminate Hold and Wait',
      description: 'Processes must request all resources before starting or release all before requesting new ones.',
      example: 'Process requests all needed resources at initialization time.',
      details: 'Two approaches: (1) Request all resources before starting (low resource utilization) OR (2) Release all resources before new request (may cause starvation).',
      pros: ['Breaks the waiting chain', 'Prevents circular wait condition'],
      cons: ['Low resource utilization', 'May cause starvation', 'Processes may wait indefinitely for all resources'],
      possible: true,
    },
    {
      id: 'no-preemption',
      name: 'Eliminate No Preemption',
      description: 'Allow resources to be forcibly taken away from processes and reassigned.',
      example: 'If a process needs a resource held by another, the OS can preempt it.',
      details: 'Processes release resources voluntarily. If request unavailable, release all held resources and wait. Works well for CPU/memory, not for devices like printers.',
      pros: ['Prevents deadlock by breaking resource holding', 'Works well for CPU and memory'],
      cons: ['Not possible for devices like printers', 'Cannot steal resources mid-task', 'May cause data corruption'],
      possible: true,
    },
    {
      id: 'circular-wait',
      name: 'Eliminate Circular Wait',
      description: 'Assign a strict ordering to resources and require processes to request them in order.',
      example: 'Printer = 1, Scanner = 2. Process holding 1 can request 2, but cannot go back to request 1.',
      details: 'Resource ordering - assign each resource a strict order/number. Processes request only in increasing order. This rule breaks the cycle.',
      pros: ['Effectively prevents circular wait', 'Simple to understand and implement', 'No starvation if ordering is fair'],
      cons: ['Requires global resource ordering', 'May not match natural resource usage patterns', 'Inflexible for dynamic resource needs'],
      possible: true,
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedStrategy(expandedStrategy === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Deadlock Prevention Strategies
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Deadlock prevention ensures that at least one of the four deadlock conditions never occurs.
        By breaking one condition in advance, the system prevents deadlock from happening.
      </p>

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 overflow-hidden"
            style={{ borderColor: strategy.possible ? '#10b981' : '#f43f5e' }}
          >
            <button
              onClick={() => toggleExpand(strategy.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedStrategy === strategy.id}
            >
              <div className="flex items-center gap-3">
                {strategy.possible ? (
                  <Check size={20} className="text-safe flex-shrink-0" />
                ) : (
                  <X size={20} className="text-deadlock flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {strategy.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strategy.description}
                  </p>
                </div>
              </div>
              {expandedStrategy === strategy.id ? (
                <ChevronUp size={20} className="text-process flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown size={20} className="text-process flex-shrink-0 ml-2" />
              )}
            </button>

            <AnimatePresence>
              {expandedStrategy === strategy.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
                      Example: {strategy.example}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {strategy.details}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-safe/10 border border-safe rounded-lg p-3">
                        <h5 className="font-semibold text-safe text-sm mb-2">Pros</h5>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {strategy.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-deadlock/10 border border-deadlock rounded-lg p-3">
                        <h5 className="font-semibold text-deadlock text-sm mb-2">Cons</h5>
                        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                          {strategy.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
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
        className="mt-6 p-4 bg-resource/10 border border-resource rounded-lg"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Note:</strong> The most practical prevention strategies are eliminating circular wait (resource ordering) and eliminating hold and wait (request all resources upfront).
          Eliminating mutual exclusion is often not possible for many system resources.
        </p>
      </motion.div>
    </div>
  );
}

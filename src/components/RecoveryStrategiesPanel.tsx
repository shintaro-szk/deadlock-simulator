import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trash2, RotateCcw, AlertTriangle, Shield } from 'lucide-react';

interface RecoveryStrategiesPanelProps {}

export function RecoveryStrategiesPanel({}: RecoveryStrategiesPanelProps) {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const strategies = [
    {
      id: 'process-termination',
      name: 'Process Termination',
      icon: Trash2,
      description: 'Abort one or more processes in the deadlock cycle to break the deadlock.',
      details: 'Abort either all at once or one at a time until the deadlock cycle breaks. The selection is based on: priority, execution time, resource usage, and restart cost.',
      criteria: [
        'Priority: Higher priority processes may be terminated first or last depending on policy.',
        'Execution time: Processes with shorter execution times may be preferred for termination.',
        'Resource usage: Processes holding many resources may be targeted.',
        'Restart cost: Processes with high restart cost may be preserved.',
      ],
      pros: ['Simple to implement', 'Immediately breaks deadlock'],
      cons: ['Data loss if process was not checkpointed', 'May need to redo work', 'Can affect system performance'],
    },
    {
      id: 'process-rollback',
      name: 'Process Rollback / Checkpointing',
      icon: RotateCcw,
      description: 'Rollback deadlocked processes to a previously saved state where deadlock did not exist.',
      details: 'Requires checkpointing to periodically save the state of processes. When deadlock is detected, roll back to a safe checkpoint and continue execution.',
      criteria: [
        'Checkpoint frequency: More frequent checkpoints reduce rollback distance but increase overhead.',
        'State size: Larger process states require more storage and time for rollback.',
        'Dependency tracking: Must track resource dependencies to ensure safe rollback.',
      ],
      pros: ['Preserves work done before checkpoint', 'No data loss if checkpointed properly', 'Can resume from safe state'],
      cons: ['Requires periodic checkpointing overhead', 'May need to redo work since last checkpoint', 'Complex to implement'],
    },
    {
      id: 'resource-preemption',
      name: 'Resource Preemption',
      icon: AlertTriangle,
      description: 'Preempt resources from deadlocked processes and allocate to others to recover.',
      details: 'Resources are taken away from processes involved in the deadlock and preempted resources are allocated to other processes. This may cause starvation.',
      criteria: [
        'Resource type: Some resources cannot be preempted (e.g., printers mid-print).',
        'Preemption cost: Cost of rolling back process after preemption.',
        'Starvation prevention: Need mechanisms to prevent indefinite waiting.',
      ],
      pros: ['Can recover without terminating processes', 'Resources can be reused', 'Flexible approach'],
      cons: ['May cause starvation', 'Not possible for all resource types', 'Complex to manage'],
    },
    {
      id: 'concurrency-control',
      name: 'Concurrency Control',
      icon: Shield,
      description: 'Prevent errors when multiple processes access same data simultaneously.',
      details: 'Manages resource access so processes do not block each other. Ensures the system runs smoothly even when many processes work together.',
      criteria: [
        'Lock granularity: Fine-grained locks reduce contention but increase overhead.',
        'Lock ordering: Consistent ordering prevents deadlocks.',
        'Timeout mechanisms: Prevent indefinite waiting.',
      ],
      pros: ['Prevents deadlocks proactively', 'Ensures data consistency', 'Improves system reliability'],
      cons: ['May reduce concurrency', 'Adds overhead to operations', 'Complex to implement correctly'],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedStrategy(expandedStrategy === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Deadlock Recovery Strategies
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        The goal of deadlock recovery is to resolve a deadlock after it is detected. Recovery methods range from terminating processes to preempting resources.
      </p>

      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-deadlock overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(strategy.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedStrategy === strategy.id}
            >
              <div className="flex items-center gap-3">
                <strategy.icon size={20} className="text-deadlock flex-shrink-0" />
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {strategy.details}
                    </p>

                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2">
                        Selection Criteria
                      </h5>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                        {strategy.criteria.map((criterion, i) => (
                          <li key={i}>{criterion}</li>
                        ))}
                      </ul>
                    </div>

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
          <strong>Recovery Trade-offs:</strong> Process termination is simplest but causes data loss. Rollback preserves work but requires checkpointing overhead. Resource preemption is flexible but may cause starvation. Concurrency control prevents deadlocks proactively but adds complexity.
        </p>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Shield, AlertTriangle } from 'lucide-react';

interface BankerAlgorithmPanelProps {}

export function BankerAlgorithmPanel({}: BankerAlgorithmPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'overview',
      title: 'Banker\'s Algorithm Overview',
      icon: Shield,
      content: 'The Banker\'s Algorithm is a resource allocation and deadlock avoidance algorithm used in operating systems. It ensures the system stays in a safe state by only granting resource requests if doing so will not lead to deadlock.',
    },
    {
      id: 'safe-state',
      title: 'Safe State vs Unsafe State',
      icon: Shield,
      content: 'A safe state means the system can allocate resources to all processes without causing deadlock. An unsafe state means the system may enter deadlock if resource requests are granted. The algorithm always maintains a safe state.',
    },
    {
      id: 'steps',
      title: 'Step-by-Step Algorithm',
      icon: Shield,
      steps: [
        '1. When a process requests resources, the algorithm checks if the request is valid (request ≤ need and request ≤ available).',
        '2. The algorithm tentatively allocates the resources and checks if the resulting state is safe.',
        '3. To check safety: Find a process whose needs can be satisfied with available resources.',
        '4. If found, assume the process finishes and releases its resources back to the available pool.',
        '5. Repeat until all processes can finish (safe) or no process can proceed (unsafe).',
        '6. If the state is safe, grant the request. Otherwise, deny it and the process must wait.',
      ],
    },
    {
      id: 'rag-algorithm',
      title: 'Resource Allocation Graph Algorithm',
      icon: AlertTriangle,
      content: 'The RAG algorithm is a visual model showing process-resource interaction. It identifies potential deadlocks through graphical relationships. Best used when each resource has only one instance. A cycle in the graph indicates deadlock for single-instance resources.',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Deadlock Avoidance: Banker's Algorithm
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        In deadlock avoidance, we do not break any deadlock conditions. Instead, the system avoids unsafe states by checking every resource request before granting it.
      </p>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-process overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(section.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedSection === section.id}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} className="text-process flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h4>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp size={20} className="text-process flex-shrink-0 ml-2" />
              ) : (
                <ChevronDown size={20} className="text-process flex-shrink-0 ml-2" />
              )}
            </button>

            <AnimatePresence>
              {expandedSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    {section.steps ? (
                      <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                        {section.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {section.content}
                      </p>
                    )}
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
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-4 bg-safe/10 border border-safe rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-safe" />
            <h4 className="font-semibold text-safe">Safe State</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            System can allocate resources to all processes without causing deadlock.
          </p>
        </div>
        <div className="p-4 bg-deadlock/10 border border-deadlock rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-deadlock" />
            <h4 className="font-semibold text-deadlock">Unsafe State</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            System may enter deadlock if resource requests are granted.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-resource/10 border border-resource rounded-lg"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Key Insight:</strong> The Banker's Algorithm is more flexible than prevention strategies because it doesn't break any deadlock conditions. However, it requires knowledge of maximum resource needs for each process and may deny valid requests to maintain safety.
        </p>
      </motion.div>
    </div>
  );
}

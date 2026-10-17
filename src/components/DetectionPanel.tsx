import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Clock, Activity } from 'lucide-react';

interface DetectionPanelProps {}

export function DetectionPanel({}: DetectionPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'purpose',
      title: 'Detection Purpose',
      icon: Search,
      content: 'The purpose of Deadlock Detection is to identify when a system has entered a deadlock state. Detection frequency can be periodic (run at regular intervals) or on-demand (run when requested).',
    },
    {
      id: 'single-instance',
      title: 'Single Instance Detection (RAG)',
      icon: Activity,
      content: 'Graph model with processes (circles) and resources (squares). Arrow from process → resource: process is requesting it. Arrow from resource → process: resource is allocated. If there is a cycle in the graph, it means processes are stuck waiting for each other → deadlock. Example: P1 → R1 → P2 → R2 → P1 forms a cycle → deadlock.',
    },
    {
      id: 'single-wfg',
      title: 'Single Instance Detection (WFG)',
      icon: Activity,
      content: 'Simplified version of RAG that removes resource nodes. Only shows processes and who they are waiting on. Arrow from Pi → Pj: Pi is waiting for a resource held by Pj. If there is a cycle, it means the processes are deadlocked. Example: P1 → P2 → P3 → P1 forms a cycle → deadlock.',
    },
    {
      id: 'multiple-instance',
      title: 'Multiple Instance Detection',
      icon: Clock,
      content: 'Works when resources have more than one copy (e.g., memory blocks, CPU cores). The system uses tables/matrices to keep track of: Available (how many resource instances are free), Allocation (how many each process already has), Request/Need (how many more each process may need).',
    },
    {
      id: 'multiple-algorithm',
      title: 'Multiple Instance Algorithm',
      icon: Activity,
      steps: [
        '1. Start with the Available resources.',
        '2. See if at least one process can finish with what is available.',
        '3. If yes → mark it as finished and add its allocated resources back to Available.',
        '4. Repeat until either all processes finish (no deadlock) or some are stuck (deadlock).',
        '5. Example: P1 needs 2 more, but only 1 is free → cannot finish. P2 can finish with what is free → releases resources. After P2 finishes, P1 now has enough → system is safe.',
      ],
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Deadlock Detection Methods
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Deadlock detection identifies when a system has entered a deadlock state. The detection method depends on the resource type (single or multiple instances).
      </p>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-waiting overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(section.id)}
              className="w-full p-4 text-left flex items-center justify-between"
              aria-expanded={expandedSection === section.id}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} className="text-waiting flex-shrink-0" />
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
        <div className="p-4 bg-process/10 border border-process rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} className="text-process" />
            <h4 className="font-semibold text-process">Single Instance</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Use RAG or WFG graphs. Cycle detection is sufficient.
          </p>
        </div>
        <div className="p-4 bg-resource/10 border border-resource rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-resource" />
            <h4 className="font-semibold text-resource">Multiple Instance</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Use matrix-based algorithm with Available, Allocation, and Request tables.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 p-4 bg-deadlock/10 border border-deadlock rounded-lg"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Key Difference:</strong> For single-instance resources, a cycle in the graph is both necessary and sufficient for deadlock. For multiple-instance resources, a cycle is necessary but not sufficient - the algorithm must also check resource availability.
        </p>
      </motion.div>
    </div>
  );
}

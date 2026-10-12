import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface GlossaryPanelProps {
  isOpen?: boolean;
}

export function GlossaryPanel({ isOpen = false }: GlossaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  const terms = [
    {
      term: 'Process',
      definition: 'A program in execution. Processes compete for system resources.',
    },
    {
      term: 'Resource',
      definition: 'Anything that a process needs to complete its task (e.g., memory, files, printers).',
    },
    {
      term: 'Deadlock',
      definition: 'A situation where processes wait indefinitely for resources held by each other.',
    },
    {
      term: 'Circular Wait',
      definition: 'A set of processes where each waits for a resource held by the next process in the chain.',
    },
    {
      term: 'Banker\'s Algorithm',
      definition: 'A deadlock avoidance algorithm that checks if a resource request leads to a safe state.',
    },
    {
      term: 'Safe State',
      definition: 'A state where the system can allocate resources to all processes without causing deadlock.',
    },
    {
      term: 'Mutual Exclusion',
      definition: 'A condition where only one process can use a resource at a time.',
    },
    {
      term: 'Preemption',
      definition: 'The ability to take a resource away from a process and give it to another.',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="text-process" size={20} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Glossary
          </h3>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-3"
          >
            {terms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-l-2 border-resource pl-3"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.term}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {item.definition}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';

interface ExplanationPanelProps {
  title: string;
  content: string;
  isDeadlocked?: boolean;
}

export function ExplanationPanel({ title, content, isDeadlocked = false }: ExplanationPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-lg p-6 shadow-lg
        ${isDeadlocked 
          ? 'bg-deadlock/10 border-2 border-deadlock' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }
      `}
    >
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          font-bold text-xl mb-3
          ${isDeadlocked ? 'text-deadlock' : 'text-gray-900 dark:text-gray-100'}
        `}
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-700 dark:text-gray-300 leading-relaxed"
      >
        {content}
      </motion.p>

      {isDeadlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-deadlock/20 rounded-lg"
        >
          <p className="text-deadlock font-semibold text-sm">
            Deadlock detected! The system is in an unsafe state.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

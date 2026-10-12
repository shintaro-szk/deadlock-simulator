import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  isDeadlocked: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function ControlPanel({
  isPlaying,
  isDeadlocked,
  onPlay,
  onPause,
  onStep,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isPlaying ? onPause : onPlay}
          disabled={isDeadlocked}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            ${isDeadlocked
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-process hover:bg-process-hover text-white'
            }
            transition-colors duration-200
          `}
          aria-label={isPlaying ? 'Pause simulation' : 'Start simulation'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          {isPlaying ? 'Pause' : 'Play'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStep}
          disabled={isDeadlocked}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium
            ${isDeadlocked
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-safe hover:bg-green-600 text-white'
            }
            transition-colors duration-200
          `}
          aria-label="Step forward one action"
        >
          <SkipForward size={20} />
          Step
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-200"
          aria-label="Reset simulation"
        >
          <RotateCcw size={20} />
          Reset
        </motion.button>
      </div>

      {isDeadlocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-deadlock font-semibold"
        >
          Deadlock detected. Reset to try again.
        </motion.div>
      )}
    </div>
  );
}

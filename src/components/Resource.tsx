import { motion } from 'framer-motion';
import { Resource as ResourceType } from '../core/types';

interface ResourceProps {
  resource: ResourceType;
}

export function Resource({ resource }: ResourceProps) {
  const instances = [];
  for (let i = 0; i < resource.totalInstances; i++) {
    const isAvailable = i < resource.availableInstances;
    instances.push(
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.05 }}
        whileHover={{ scale: 1.1 }}
        className={`
          w-8 h-8 rounded-full border-2
          ${isAvailable 
            ? 'bg-resource border-resource' 
            : 'bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500'
          }
        `}
      />
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
        {resource.name}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {resource.availableInstances} / {resource.totalInstances} available
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        {instances}
      </div>
      
      {resource.heldBy.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Held by:
          </div>
          <div className="flex flex-wrap gap-1">
            {resource.heldBy.map((processId) => (
              <span
                key={processId}
                className="text-xs bg-process/20 text-process px-2 py-0.5 rounded"
              >
                {processId}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

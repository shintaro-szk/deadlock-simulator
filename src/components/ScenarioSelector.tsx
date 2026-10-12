import { motion } from 'framer-motion';
import { Scenario } from '../core/types';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenario: string;
  onSelect: (scenarioId: string) => void;
}

export function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
        Select Scenario
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((scenario) => (
          <motion.button
            key={scenario.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(scenario.id)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all duration-200
              ${selectedScenario === scenario.id
                ? 'border-process bg-process/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            aria-label={`Select ${scenario.name} scenario`}
          >
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {scenario.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {scenario.description}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

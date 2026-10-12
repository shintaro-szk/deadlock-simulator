import { useState, useEffect } from 'react';
import { Process } from './components/Process';
import { Resource } from './components/Resource';
import { ExplanationPanel } from './components/ExplanationPanel';
import { ProcessState } from './core/types';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const testProcess = {
    id: 'p1',
    name: 'Process 1',
    heldResources: ['r1'],
    requestedResources: ['r2'],
    state: 'waiting' as ProcessState,
  };

  const testResource = {
    id: 'r1',
    name: 'Resource 1',
    totalInstances: 3,
    availableInstances: 1,
    heldBy: ['p1'],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Deadlock Simulator
        </h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
        >
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Process process={testProcess} />
        <Resource resource={testResource} />
      </div>
      
      <ExplanationPanel
        title="Test Explanation"
        content="This is a test of the explanation panel component."
        isDeadlocked={false}
      />
    </div>
  );
}

export default App;

# Deadlock Simulator

An educational web application that visualizes operating system deadlock concepts through interactive simulations.

## Overview

This tool helps students understand deadlocks in operating systems. It provides visual simulations of processes requesting, holding, and releasing resources. Users can observe deadlock conditions and prevention algorithms in real-time.

## Features

- Interactive simulation of process-resource allocation
- Visual resource allocation graph with SVG rendering
- Three pre-built scenarios: safe execution, circular wait, Banker's algorithm
- Step-by-step execution with play, pause, and reset controls
- Real-time deadlock detection and cycle highlighting
- Educational panels explaining deadlock conditions and terminology
- Dark mode support
- Keyboard shortcuts for accessibility
- Responsive design for desktop and mobile

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal.

## Build for Production

Run the following command to create an optimized production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Run Tests

Execute the unit tests with Vitest:

```bash
npm test
```

## How to Use

1. Select a scenario from the scenario selector.
2. Use the control panel to start, pause, step through, or reset the simulation.
3. Watch the visual representation of processes and resources.
4. Read the explanation panel to understand the current state.
5. Observe how deadlocks occur and how prevention algorithms work.

## Keyboard Shortcuts

- Space: Play or pause the simulation
- Arrow Right: Step forward one action

## Educational Concepts

The simulator demonstrates the four necessary conditions for deadlock:

- **Mutual Exclusion**: Resources cannot be shared. Only one process can use a resource at a time.
- **Hold and Wait**: Processes hold resources while waiting for other resources.
- **No Preemption**: Resources cannot be taken away from a process. They must be released voluntarily.
- **Circular Wait**: A set of processes wait for each other in a circle.

The simulator also shows prevention strategies like the Banker's Algorithm.

## Project Structure

```
src/
├── components/          # React UI components
│   ├── ControlPanel.tsx
│   ├── ScenarioSelector.tsx
│   ├── SimulationCanvas.tsx
│   ├── StatusPanel.tsx
│   ├── ExplanationPanel.tsx
│   ├── Process.tsx
│   ├── Resource.tsx
│   ├── DeadlockConditionsPanel.tsx
│   ├── GlossaryPanel.tsx
│   └── ProgressIndicator.tsx
├── core/               # Core logic and algorithms
│   ├── types.ts
│   ├── deadlockDetector.ts
│   ├── bankerAlgorithm.ts
│   └── simulationEngine.ts
├── scenarios/          # Pre-built scenarios
│   ├── safeScenario.ts
│   ├── deadlockScenario.ts
│   └── preventionScenario.ts
└── App.tsx             # Main application component
```

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Vitest for unit testing

## License

MIT
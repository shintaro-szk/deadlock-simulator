# Deadlock Simulator

An educational web application that visualizes operating system deadlock concepts through interactive simulations.

## About This Project

This project was developed for educational purposes as a personal project and initiative for my BSIT 2nd Year course, COMP 007 — Operating Systems, at university. The tool demonstrates and simulates how deadlocks work in operating systems, made for and used during our group presentation and classroom learning about deadlocks in OS.

### Development Methodology

This project was developed through Intent-Driven Software Development and Generative AI-assisted development as part of the engineering and development process. The implementation follows a phase-gated approach to ensure systematic development and verification at each stage.

## Overview

Students use this tool to understand deadlocks in operating systems. The tool provides visual simulations of processes requesting, holding, and releasing resources. Observe deadlock conditions, prevention algorithms, avoidance strategies, detection methods, and recovery techniques in real-time.

## Features

- Interactive simulation of process-resource allocation
- Visual resource allocation graph (RAG) with SVG rendering
- Wait-for graph (WFG) visualization for deadlock cycle detection
- Three pre-built scenarios: safe execution, circular wait, Banker's algorithm
- Step-by-step execution with play, pause, and reset controls
- Real-time deadlock detection and cycle highlighting
- Enhanced deadlock conditions panel with detailed examples and expandable sections
- Deadlock prevention strategies panel with pros and cons for each method
- Banker's algorithm educational panel with step-by-step explanations
- Deadlock detection methods panel for single and multiple-instance resources
- Deadlock recovery strategies panel with selection criteria
- References and resources panel with scientific citations
- Educational glossary panel for OS terminology
- Progress indicator showing simulation completion
- Dark mode support
- Keyboard shortcuts for accessibility
- Responsive design for desktop and mobile

## Setup Instructions

1. Install dependencies.
   ```bash
   npm install
   ```

2. Start the development server.
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal.

## Build for Production

Run this command to create an optimized production build.

```bash
npm run build
```

The build output is in the `dist` directory.

## Run Tests

Execute the unit tests with Vitest.

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

The simulator demonstrates these deadlock concepts.

### Four Necessary Conditions for Deadlock
- **Mutual Exclusion**: Resources cannot be shared. One process uses a resource at a time.
- **Hold and Wait**: Processes hold resources while they wait for other resources.
- **No Preemption**: Resources cannot be taken away. Processes release them voluntarily.
- **Circular Wait**: Processes wait for each other in a circle.

### Deadlock Handling Approaches
- **Prevention**: Break one of the four necessary conditions.
- **Avoidance**: Use algorithms to maintain safe states.
- **Detection**: Identify deadlocks through graphs or matrix methods.
- **Recovery**: Terminate processes, roll back, preempt resources, or control concurrency.

### Graph-Based Visualization
- **Resource Allocation Graph (RAG)**: Shows processes as circles and resources as squares. Request edges go from process to resource. Assignment edges go from resource to process.
- **Wait-for Graph (WFG)**: Shows only processes and wait relationships.

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
│   ├── ProgressIndicator.tsx
│   ├── RAGVisualization.tsx           # Resource Allocation Graph visualization
│   ├── WFGVisualization.tsx           # Wait-for Graph visualization
│   ├── PreventionStrategiesPanel.tsx  # Deadlock prevention strategies
│   ├── BankerAlgorithmPanel.tsx      # Banker's algorithm educational panel
│   ├── DetectionPanel.tsx            # Deadlock detection methods
│   ├── RecoveryStrategiesPanel.tsx    # Deadlock recovery strategies
│   └── ReferencesPanel.tsx           # References and resources
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

## Implementation Phases

The project uses a phase-gated development approach.

- **Phase 1-9**: Core application setup, simulation engine, base UI components, scenarios, and documentation
- **Phase 10**: Enhanced Deadlock Conditions Panel with examples and expandable sections
- **Phase 11**: RAG and WFG Visualization components for graph-based deadlock detection
- **Phase 12**: Deadlock Prevention Strategies panel with four prevention methods
- **Phase 13**: Banker's Algorithm educational panel with step-by-step explanations
- **Phase 14**: Deadlock Detection Methods panel for single and multiple-instance resources
- **Phase 15**: Deadlock Recovery Strategies panel with selection criteria
- **Phase 16**: References and Resources panel with scientific citations

## License

This project is licensed under the MIT License - see the LICENSE file for details.
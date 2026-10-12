# Deadlock Simulator

An educational web application that visualizes operating system deadlock concepts through interactive simulations.

## Overview

This tool helps students understand deadlocks in operating systems. It provides visual simulations of processes requesting, holding, and releasing resources. Users can observe deadlock conditions and prevention algorithms in real-time.

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

## How to Use

1. Select a scenario from the scenario selector.
2. Use the control panel to start, pause, step through, or reset the simulation.
3. Watch the visual representation of processes and resources.
4. Read the explanation panel to understand the current state.
5. Observe how deadlocks occur and how prevention algorithms work.

## Educational Concepts

The simulator demonstrates the four necessary conditions for deadlock:
- Mutual Exclusion
- Hold and Wait
- No Preemption
- Circular Wait

It also shows prevention strategies like the Banker's Algorithm.

## Tech Stack

- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
export type ProcessState = 'idle' | 'waiting' | 'running' | 'blocked';

export interface Process {
  id: string;
  name: string;
  heldResources: string[];
  requestedResources: string[];
  state: ProcessState;
}

export interface Resource {
  id: string;
  name: string;
  totalInstances: number;
  availableInstances: number;
  heldBy: string[];
}

export interface SimulationState {
  processes: Process[];
  resources: Resource[];
  currentStep: number;
  isDeadlocked: boolean;
  deadlockCycle: string[];
  history: SimulationStep[];
}

export interface SimulationStep {
  stepNumber: number;
  action: string;
  processId?: string;
  resourceId?: string;
  state: SimulationState;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  initialState: SimulationState;
}

export interface DeadlockDetectionResult {
  isDeadlocked: boolean;
  cycle: string[];
}

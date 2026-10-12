import { SimulationState, Process, Resource, SimulationStep } from './types';
import { DeadlockDetector } from './deadlockDetector';

export class SimulationEngine {
  private state: SimulationState;
  private detector: DeadlockDetector;
  private isPlaying: boolean = false;
  private stepInterval: number | null = null;

  constructor(initialState: SimulationState) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.detector = new DeadlockDetector();
  }

  getState(): SimulationState {
    return JSON.parse(JSON.stringify(this.state));
  }

  start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
  }

  pause(): void {
    this.isPlaying = false;
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }

  reset(): void {
    this.pause();
    this.state.currentStep = 0;
    this.state.isDeadlocked = false;
    this.state.deadlockCycle = [];
    this.state.history = [];
  }

  step(): void {
    if (this.state.isDeadlocked) return;

    const nextAction = this.getNextAction();
    if (!nextAction) {
      return;
    }

    this.executeAction(nextAction);
    this.checkDeadlock();
  }

  private getNextAction(): { action: string; processId?: string; resourceId?: string } | null {
    const waitingProcesses = this.state.processes.filter(p => p.state === 'waiting');
    
    if (waitingProcesses.length > 0) {
      const process = waitingProcesses[0];
      const requestedResource = process.requestedResources[0];
      
      if (requestedResource) {
        const resource = this.state.resources.find(r => r.id === requestedResource);
        if (resource && resource.availableInstances > 0) {
          return {
            action: 'allocate',
            processId: process.id,
            resourceId: requestedResource,
          };
        }
      }
    }

    const idleProcesses = this.state.processes.filter(p => p.state === 'idle');
    if (idleProcesses.length > 0) {
      const process = idleProcesses[0];
      return {
        action: 'request',
        processId: process.id,
      };
    }

    const runningProcesses = this.state.processes.filter(p => p.state === 'running');
    if (runningProcesses.length > 0) {
      const process = runningProcesses[0];
      if (process.heldResources.length > 0) {
        return {
          action: 'release',
          processId: process.id,
          resourceId: process.heldResources[0],
        };
      }
    }

    return null;
  }

  private executeAction(action: { action: string; processId?: string; resourceId?: string }): void {
    const { action: actionType, processId, resourceId } = action;

    if (!processId) return;

    const process = this.state.processes.find(p => p.id === processId);
    if (!process) return;

    const step: SimulationStep = {
      stepNumber: this.state.currentStep + 1,
      action: actionType,
      processId,
      resourceId,
      state: JSON.parse(JSON.stringify(this.state)),
    };

    switch (actionType) {
      case 'request':
        if (resourceId) {
          const resource = this.state.resources.find(r => r.id === resourceId);
          if (resource && resource.availableInstances > 0) {
            this.allocateResource(process, resource);
            process.state = 'running';
          } else {
            process.requestedResources.push(resourceId);
            process.state = 'waiting';
          }
        }
        break;

      case 'allocate':
        if (resourceId) {
          const resource = this.state.resources.find(r => r.id === resourceId);
          if (resource) {
            this.allocateResource(process, resource);
            process.state = 'running';
            const reqIndex = process.requestedResources.indexOf(resourceId);
            if (reqIndex > -1) {
              process.requestedResources.splice(reqIndex, 1);
            }
          }
        }
        break;

      case 'release':
        if (resourceId) {
          const resource = this.state.resources.find(r => r.id === resourceId);
          if (resource) {
            this.releaseResource(process, resource);
            if (process.heldResources.length === 0) {
              process.state = 'idle';
            }
          }
        }
        break;
    }

    this.state.currentStep++;
    this.state.history.push(step);
  }

  private allocateResource(process: Process, resource: Resource): void {
    if (resource.availableInstances > 0) {
      resource.availableInstances--;
      process.heldResources.push(resource.id);
      resource.heldBy.push(process.id);
    }
  }

  private releaseResource(process: Process, resource: Resource): void {
    const heldIndex = process.heldResources.indexOf(resource.id);
    if (heldIndex > -1) {
      process.heldResources.splice(heldIndex, 1);
    }

    const heldByIndex = resource.heldBy.indexOf(process.id);
    if (heldByIndex > -1) {
      resource.heldBy.splice(heldByIndex, 1);
    }

    resource.availableInstances++;
  }

  private checkDeadlock(): void {
    const result = this.detector.detectDeadlock(this.state.processes, this.state.resources);
    this.state.isDeadlocked = result.isDeadlocked;
    this.state.deadlockCycle = result.cycle;

    if (this.state.isDeadlocked) {
      this.state.processes.forEach(p => {
        if (p.state === 'waiting') {
          p.state = 'blocked';
        }
      });
      this.pause();
    }
  }

  loadState(newState: SimulationState): void {
    this.pause();
    this.state = JSON.parse(JSON.stringify(newState));
  }
}

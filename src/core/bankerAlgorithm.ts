import { Process } from './types';

export interface AllocationMatrix {
  [processId: string]: { [resourceId: string]: number };
}

export interface MaxMatrix {
  [processId: string]: { [resourceId: string]: number };
}

export interface AvailableVector {
  [resourceId: string]: number;
}

export class BankerAlgorithm {
  private allocation: AllocationMatrix = {};
  private max: MaxMatrix = {};
  private available: AvailableVector = {};

  constructor(
    allocation: AllocationMatrix,
    max: MaxMatrix,
    available: AvailableVector
  ) {
    this.allocation = allocation;
    this.max = max;
    this.available = available;
  }

  isSafeState(processes: Process[]): boolean {
    const work: AvailableVector = { ...this.available };
    const finish: { [processId: string]: boolean } = {};

    processes.forEach(p => {
      finish[p.id] = false;
    });

    let safeSequence: string[] = [];
    let count = 0;

    while (count < processes.length) {
      let found = false;

      for (const process of processes) {
        if (!finish[process.id]) {
          const need = this.calculateNeed(process.id);

          if (this.isLessThanOrEqual(need, work)) {
            for (const resourceId of Object.keys(work)) {
              work[resourceId] += this.allocation[process.id]?.[resourceId] || 0;
            }

            finish[process.id] = true;
            safeSequence.push(process.id);
            count++;
            found = true;
          }
        }
      }

      if (!found) {
        return false;
      }
    }

    return true;
  }

  requestResources(
    processId: string,
    request: { [resourceId: string]: number }
  ): boolean {
    if (!this.isValidRequest(processId, request)) {
      return false;
    }

    const tempAvailable = { ...this.available };
    const tempAllocation = JSON.parse(JSON.stringify(this.allocation));

    for (const resourceId of Object.keys(request)) {
      tempAvailable[resourceId] -= request[resourceId];
      tempAllocation[processId][resourceId] += request[resourceId];
    }

    const tempBanker = new BankerAlgorithm(tempAllocation, this.max, tempAvailable);
    const processes = this.getProcessesFromAllocation();

    if (tempBanker.isSafeState(processes)) {
      this.available = tempAvailable;
      this.allocation = tempAllocation;
      return true;
    }

    return false;
  }

  private calculateNeed(processId: string): { [resourceId: string]: number } {
    const need: { [resourceId: string]: number } = {};
    const maxResources = this.max[processId] || {};
    const allocatedResources = this.allocation[processId] || {};

    for (const resourceId of Object.keys(maxResources)) {
      need[resourceId] = maxResources[resourceId] - (allocatedResources[resourceId] || 0);
    }

    return need;
  }

  private isLessThanOrEqual(
    a: { [resourceId: string]: number },
    b: { [resourceId: string]: number }
  ): boolean {
    for (const resourceId of Object.keys(a)) {
      if (a[resourceId] > (b[resourceId] || 0)) {
        return false;
      }
    }
    return true;
  }

  private isValidRequest(
    processId: string,
    request: { [resourceId: string]: number }
  ): boolean {
    const need = this.calculateNeed(processId);

    for (const resourceId of Object.keys(request)) {
      if (request[resourceId] > (need[resourceId] || 0)) {
        return false;
      }
      if (request[resourceId] > (this.available[resourceId] || 0)) {
        return false;
      }
    }

    return true;
  }

  private getProcessesFromAllocation(): Process[] {
    const processes: Process[] = [];
    for (const processId of Object.keys(this.allocation)) {
      processes.push({
        id: processId,
        name: `Process ${processId}`,
        heldResources: [],
        requestedResources: [],
        state: 'idle',
      });
    }
    return processes;
  }
}

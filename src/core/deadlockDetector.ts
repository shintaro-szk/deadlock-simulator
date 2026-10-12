import { Process, Resource, DeadlockDetectionResult } from './types';

export class DeadlockDetector {
  private adjacencyList: Map<string, string[]> = new Map();
  private visited: Set<string> = new Set();
  private recursionStack: Set<string> = new Set();
  private cycle: string[] = [];

  detectDeadlock(processes: Process[], resources: Resource[]): DeadlockDetectionResult {
    this.buildGraph(processes, resources);
    this.visited.clear();
    this.recursionStack.clear();
    this.cycle = [];

    const allNodes = this.getAllNodes(processes, resources);

    for (const node of allNodes) {
      if (!this.visited.has(node)) {
        if (this.hasCycle(node)) {
          return { isDeadlocked: true, cycle: [...this.cycle] };
        }
      }
    }

    return { isDeadlocked: false, cycle: [] };
  }

  private buildGraph(processes: Process[], resources: Resource[]): void {
    this.adjacencyList.clear();

    processes.forEach(process => {
      this.adjacencyList.set(process.id, []);
    });

    resources.forEach(resource => {
      this.adjacencyList.set(resource.id, []);
    });

    processes.forEach(process => {
      process.requestedResources.forEach(resourceId => {
        this.addEdge(process.id, resourceId);
      });
    });

    resources.forEach(resource => {
      resource.heldBy.forEach(processId => {
        this.addEdge(resource.id, processId);
      });
    });
  }

  private addEdge(from: string, to: string): void {
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    this.adjacencyList.get(from)!.push(to);
  }

  private getAllNodes(processes: Process[], resources: Resource[]): string[] {
    const nodes: string[] = [];
    processes.forEach(p => nodes.push(p.id));
    resources.forEach(r => nodes.push(r.id));
    return nodes;
  }

  private hasCycle(node: string): boolean {
    this.visited.add(node);
    this.recursionStack.add(node);

    const neighbors = this.adjacencyList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!this.visited.has(neighbor)) {
        if (this.hasCycle(neighbor)) {
          this.cycle.push(node);
          return true;
        }
      } else if (this.recursionStack.has(neighbor)) {
        this.cycle.push(node);
        this.cycle.push(neighbor);
        return true;
      }
    }

    this.recursionStack.delete(node);
    return false;
  }
}

/**
 * All reading text in the app. The source is the Group 8 presentation
 * "Deadlocks in Operating Systems: Concepts, Handling, and Recovery".
 * The text uses ASD-STE100 style. It does not add claims that the presentation does not make.
 */

export type ChapterId =
  | 'concept'
  | 'conditions'
  | 'rag'
  | 'prevention'
  | 'avoidance'
  | 'detection'
  | 'recovery'
  | 'importance'
  | 'references';

/** One labelled line inside a topic. `tone` marks a downside from the PDF. */
export interface Point {
  readonly label?: string;
  readonly text: string;
  readonly tone?: 'downside' | 'works' | 'fails';
}

export type Block =
  | { readonly kind: 'lead'; readonly text: string }
  | { readonly kind: 'para'; readonly text: string }
  | { readonly kind: 'quote'; readonly text: string }
  | { readonly kind: 'list'; readonly title?: string; readonly ordered?: boolean; readonly items: readonly Point[] }
  | {
      readonly kind: 'topic';
      readonly id: string;
      readonly title: string;
      readonly body: readonly string[];
      readonly points?: readonly Point[];
      readonly ordered?: boolean;
      readonly example?: string;
    }
  | { readonly kind: 'approaches'; readonly title: string; readonly columns: readonly ApproachColumn[] }
  | { readonly kind: 'references'; readonly groups: readonly ReferenceGroup[] };

export interface ApproachColumn {
  readonly title: string;
  readonly groups: readonly { readonly title: string; readonly chapter: ChapterId; readonly items: readonly string[] }[];
}

export interface Reference {
  readonly title: string;
  readonly detail: string;
  readonly href?: string;
}

export interface ReferenceGroup {
  readonly title: string;
  readonly items: readonly Reference[];
}

export interface Chapter {
  readonly id: ChapterId;
  readonly number: string;
  /** Short name for the chapter rail. */
  readonly short: string;
  readonly title: string;
  readonly blocks: readonly Block[];
}

export const deck = {
  title: 'Deadlocks in Operating Systems',
  subtitle: 'Concepts, handling, and recovery',
} as const;

/** The author and the source code of this app. The footer and the chapter rail show these values. */
export const credits = {
  author: 'Shintaro A. Suzuki',
  authorLabel: 'Developed by',
  repoUrl: 'https://github.com/shintaro-szk/deadlock-simulator',
  repoPath: 'shintaro-szk/deadlock-simulator',
  repoLabel: 'View source on GitHub',
  newTab: '(opens in a new tab)',
  basedOn: `Based on the presentation “${deck.title}: ${deck.subtitle}”.`,
} as const;

export const chapters: readonly Chapter[] = [
  {
    id: 'concept',
    number: '01',
    short: 'Concept',
    title: 'What a deadlock is',
    blocks: [
      {
        kind: 'lead',
        text: 'A deadlock is a situation where a set of processes become permanently blocked. Each process waits for a resource that another process holds, so no process can continue.',
      },
      { kind: 'para', text: 'Deadlocks occur because processes hold some resources while they wait for others.' },
    ],
  },
  {
    id: 'conditions',
    number: '02',
    short: 'Conditions',
    title: 'The four conditions',
    blocks: [
      { kind: 'lead', text: 'A deadlock needs all four conditions at the same time.' },
      {
        kind: 'topic',
        id: 'mutual-exclusion',
        title: 'Mutual exclusion',
        body: [
          'At least one resource cannot be shared. Only one process at a time can use it.',
          'If another process requests the resource, it must wait until the resource is released.',
        ],
        example: 'A printer can print only one document at a time.',
      },
      {
        kind: 'topic',
        id: 'hold-and-wait',
        title: 'Hold and wait',
        body: [
          'A process holds at least one resource and waits to get more resources that other processes hold.',
          'This creates the waiting chain that a deadlock needs.',
        ],
        example: 'Process 2 holds a printer, but it waits for disk access that Process 1 holds.',
      },
      {
        kind: 'topic',
        id: 'no-preemption',
        title: 'No preemption',
        body: [
          'The system cannot take a resource away by force. The process must release it voluntarily.',
          'This ensures fairness, but it risks deadlock.',
        ],
        example: 'If a process holds a lock on a file, the OS cannot take the lock away.',
      },
      {
        kind: 'topic',
        id: 'circular-wait',
        title: 'Circular wait',
        body: [
          'A closed chain of processes exists. Each process holds a resource that the next process in the chain needs.',
          'This forms a cycle that locks the processes forever.',
        ],
      },
      {
        kind: 'list',
        title: 'What this means',
        items: [
          { text: 'If any one of the conditions is broken, deadlock cannot happen. Many prevention strategies break one condition.' },
          { text: 'In a Resource Allocation Graph with single-instance resources, a cycle means deadlock.' },
          { text: 'With multiple-instance resources, a cycle is necessary but not sufficient. The system must also check availability.' },
        ],
      },
    ],
  },
  {
    id: 'rag',
    number: '03',
    short: 'Allocation graph',
    title: 'Resource Allocation Graph',
    blocks: [
      {
        kind: 'lead',
        text: 'A system resource-allocation graph is a directed graph that describes deadlock. It has a set of vertices V and a set of edges E.',
      },
      {
        kind: 'list',
        title: 'V has two types of vertices',
        items: [
          { label: 'P = {P1, P2, …, Pn}', text: 'All processes in the system.' },
          { label: 'R = {R1, R2, …, Rm}', text: 'All resource types in the system.' },
        ],
      },
      {
        kind: 'list',
        title: 'E has two types of edges',
        items: [
          { label: 'Request edge', text: 'Directed edge Pi → Rj.' },
          { label: 'Assignment edge', text: 'Directed edge Rj → Pi.' },
        ],
      },
      {
        kind: 'approaches',
        title: 'Approaches in handling deadlock',
        columns: [
          {
            title: 'Prevention and avoidance',
            groups: [
              {
                title: 'Deadlock prevention',
                chapter: 'prevention',
                items: ['Eliminate mutual exclusion', 'Eliminate hold and wait', 'Eliminate no preemption', 'Eliminate circular wait'],
              },
              { title: 'Deadlock avoidance', chapter: 'avoidance', items: ["Banker's Algorithm", 'Resource Allocation Graph (RAG)'] },
            ],
          },
          {
            title: 'Detection and recovery',
            groups: [
              {
                title: 'Deadlock detection',
                chapter: 'detection',
                items: ['Resource Allocation Graph (RAG)', 'Wait-for Graph (WFG)', 'Multiple-instance resources'],
              },
              {
                title: 'Deadlock recovery',
                chapter: 'recovery',
                items: ['Process termination', 'Process rollback / checkpointing', 'Concurrency control in recovery'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prevention',
    number: '04',
    short: 'Prevention',
    title: 'Deadlock prevention',
    blocks: [
      {
        kind: 'lead',
        text: 'Deadlock prevention makes sure that at least one of the four conditions never occurs. When the system breaks one condition in advance, deadlock cannot happen.',
      },
      {
        kind: 'topic',
        id: 'mutual-exclusion',
        title: 'Eliminate mutual exclusion',
        body: [
          'Some resources, such as a printer, cannot be shared, so this condition is difficult to break.',
          'Sharable resources, such as read-only files, can be used by many processes at the same time.',
        ],
        points: [
          { tone: 'works', text: 'Works only if the resource is shareable.' },
          { tone: 'fails', text: 'Not possible for all types of resources.' },
        ],
      },
      {
        kind: 'topic',
        id: 'hold-and-wait',
        title: 'Eliminate hold and wait',
        body: ['A process holds resources while it requests more. There are two ways to break this.'],
        points: [
          { label: 'Eliminate wait', text: 'A process requests all its resources before it starts.' },
          { tone: 'downside', text: 'Low resource utilization.' },
          { label: 'Eliminate hold', text: 'A process releases all the resources that it holds before it makes a new request.' },
          { tone: 'downside', text: 'May cause starvation.' },
        ],
      },
      {
        kind: 'topic',
        id: 'no-preemption',
        title: 'Eliminate no preemption',
        body: ['No preemption means that the system cannot take resources away after it allocates them.'],
        points: [
          { label: 'Release voluntarily', text: 'A process gives up resources when it finishes with them.' },
          {
            label: 'Avoid partial allocation',
            text: 'If a requested resource is not available, the process releases all the resources it holds. It waits until all required resources are free.',
          },
          { tone: 'works', text: 'Works well for CPU and memory.' },
          { tone: 'fails', text: 'Not possible for devices such as printers. You cannot take a printer away in the middle of a task.' },
        ],
      },
      {
        kind: 'topic',
        id: 'circular-wait',
        title: 'Eliminate circular wait',
        body: [
          'Circular wait occurs when processes wait for each other in a loop: A waits for B, B waits for C, C waits for A.',
          'Resource ordering: give each resource a strict order number. Processes can request resources only in increasing order.',
        ],
        example: 'Printer = 1, Scanner = 2. A process that holds 1 can request 2. It cannot go back and request 1. This rule breaks the cycle.',
      },
    ],
  },
  {
    id: 'avoidance',
    number: '05',
    short: 'Avoidance',
    title: 'Deadlock avoidance',
    blocks: [
      {
        kind: 'lead',
        text: 'Deadlock avoidance does not break a deadlock condition. The system checks each resource request before it grants it, and it avoids unsafe states.',
      },
      { kind: 'quote', text: 'If I give this resource, will the system remain safe?' },
      {
        kind: 'list',
        items: [
          { label: 'Yes', text: 'The OS allocates the resource.' },
          { label: 'No', text: 'The OS denies the request for now.' },
        ],
      },
      {
        kind: 'para',
        text: 'Avoidance is more flexible than prevention. It is also more complex, because the OS must know the maximum resource needs of each process.',
      },
      {
        kind: 'topic',
        id: 'banker',
        title: "Banker's Algorithm",
        body: [
          "The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm. It makes sure that the system stays in a safe state.",
          'It grants a request only if the request does not lead to deadlock. It helps the system manage how programs use resources, such as memory or CPU time.',
        ],
      },
      {
        kind: 'topic',
        id: 'rag-algorithm',
        title: 'Resource Allocation Graph algorithm',
        body: ['A Resource Allocation Graph is a visual model of how processes and resources interact. It helps identify possible deadlocks.'],
        points: [
          { text: 'Shows which resources are allocated and which are requested.' },
          { text: 'Helps detect deadlocks by finding cycles in the graph.' },
          { text: 'Easier to read than tables, especially for simple systems.' },
          { text: 'Best when each resource has only one instance.' },
        ],
      },
    ],
  },
  {
    id: 'detection',
    number: '06',
    short: 'Detection',
    title: 'Deadlock detection',
    blocks: [
      {
        kind: 'lead',
        text: 'Deadlock detection finds out when the system has entered a deadlock state. Detection can run periodically or on demand.',
      },
      { kind: 'para', text: 'The method depends on the resource type: single instance (RAG, WFG) or multiple instance.' },
      {
        kind: 'topic',
        id: 'rag-single',
        title: 'Resource Allocation Graph (single instance)',
        body: ['Processes are circles. Resources are squares.'],
        points: [
          { label: 'Process → resource', text: 'The process requests the resource.' },
          { label: 'Resource → process', text: 'The resource is allocated to the process.' },
          { label: 'Cycle', text: 'The processes wait for each other: deadlock.' },
        ],
        example: 'P1 → R1 → P2 → R2 → P1 forms a cycle → deadlock.',
      },
      {
        kind: 'topic',
        id: 'wfg',
        title: 'Wait-for Graph (single instance)',
        body: ['A simplified RAG without resource nodes. It shows only the processes and who they wait for.'],
        points: [
          { label: 'Pi → Pj', text: 'Pi waits for a resource that Pj holds.' },
          { label: 'Cycle', text: 'The processes are deadlocked.' },
        ],
        example: 'P1 → P2 → P3 → P1 forms a cycle → deadlock.',
      },
      {
        kind: 'topic',
        id: 'multi-instance',
        title: 'Multiple-instance resources',
        body: ['This method works when resources have more than one copy, such as memory blocks or CPU cores. The system keeps three tables.'],
        points: [
          { label: 'Available', text: 'How many instances are free.' },
          { label: 'Allocation', text: 'How many instances each process has.' },
          { label: 'Request (Need)', text: 'How many more instances each process may need.' },
        ],
      },
      {
        kind: 'list',
        title: 'The algorithm',
        ordered: true,
        items: [
          { text: 'Start with the Available resources.' },
          { text: 'Find a process that can finish with what is available.' },
          { text: 'If one exists, mark it as finished and add its allocated resources back to Available.' },
          { text: 'Repeat until all processes finish (no deadlock) or some processes are stuck (deadlock).' },
        ],
      },
      {
        kind: 'para',
        text: 'Example: P1 needs 2 more, but only 1 is free, so P1 cannot finish. P2 can finish with what is free, so it releases its resources. After P2 finishes, P1 has enough. The system is safe.',
      },
    ],
  },
  {
    id: 'recovery',
    number: '07',
    short: 'Recovery',
    title: 'Deadlock recovery',
    blocks: [
      { kind: 'lead', text: 'Deadlock recovery resolves a deadlock after the system detects it.' },
      {
        kind: 'topic',
        id: 'terminate',
        title: 'Killing the process',
        body: ['Abort one or more processes in the deadlock cycle, all at once or one at a time, until the cycle breaks. Select the victim by:'],
        ordered: true,
        points: [{ text: 'Priority' }, { text: 'Execution time' }, { text: 'Resource usage' }, { text: 'Restart cost' }],
      },
      {
        kind: 'topic',
        id: 'rollback',
        title: 'Process rollback / checkpointing',
        body: [
          'Roll back the deadlocked processes to a saved state where the deadlock condition did not exist.',
          'This requires checkpoints that save the state of processes periodically.',
        ],
      },
      {
        kind: 'topic',
        id: 'preempt',
        title: 'Resource preemption',
        body: ['Take resources from the processes in the deadlock and give them to other processes, so that the system can recover.'],
        points: [{ tone: 'downside', text: 'This can cause starvation.' }],
      },
      {
        kind: 'topic',
        id: 'concurrency',
        title: 'Concurrency control in recovery',
        body: [
          'Concurrency control prevents errors when many processes use the same data at the same time.',
          'It manages resource access so that processes do not block each other. It keeps the system running smoothly when many processes work together.',
        ],
      },
    ],
  },
  {
    id: 'importance',
    number: '08',
    short: 'Importance',
    title: 'Why deadlock management matters',
    blocks: [
      {
        kind: 'list',
        ordered: true,
        items: [
          { text: 'It shows the need for coordination in multiprogramming.' },
          { text: 'It drives the development of resource control mechanisms.' },
          { text: 'It keeps the system stable and efficient.' },
          { text: 'It supports data consistency and integrity.' },
          { text: 'It improves overall system reliability.' },
        ],
      },
    ],
  },
  {
    id: 'references',
    number: '09',
    short: 'References',
    title: 'References and resources',
    blocks: [
      {
        kind: 'references',
        groups: [
          {
            title: 'Scientific reference',
            items: [
              {
                title: "Lang, S.-D. (1999). An extended banker's algorithm for deadlock avoidance.",
                detail: 'IEEE Transactions on Software Engineering, 25(3), 428–432.',
                href: 'https://doi.org/10.1109/32.798330',
              },
            ],
          },
          {
            title: 'Educational resources',
            items: [
              {
                title: 'Operating System Concepts (Silberschatz, Galvin, and Gagne)',
                detail: "Textbook definitions of mutual exclusion, hold and wait, RAGs, and the Banker's Algorithm.",
              },
              { title: 'Yale University CS - Chapter 7: Deadlocks', detail: 'Course chapter on deadlocks.' },
              {
                title: 'University of Virginia CS3130 - Deadlock',
                detail: 'The four necessary deadlock conditions, first defined by E. G. Coffman in 1971.',
              },
              {
                title: 'TutorialsPoint - Operating System Resource Allocation Graph',
                detail: 'Single-instance and multi-instance RAGs, and how cycles translate to deadlock states.',
              },
            ],
          },
        ],
      },
    ],
  },
];

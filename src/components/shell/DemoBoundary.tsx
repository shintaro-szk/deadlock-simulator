import { Component, type ErrorInfo, type ReactNode } from 'react';
import { uiText } from '../../content/demoText';

interface DemoBoundaryProps {
  readonly children: ReactNode;
}

interface DemoBoundaryState {
  readonly failed: boolean;
}

/**
 * Stop an error in one demo from removing the whole page.
 * The chapter text stays. The demo shows a message and a button to try again.
 */
export class DemoBoundary extends Component<DemoBoundaryProps, DemoBoundaryState> {
  state: DemoBoundaryState = { failed: false };

  static getDerivedStateFromError(): DemoBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Demo failed to render.', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-lg border border-signal/50 bg-surface p-5">
        <p className="font-display text-lg font-semibold text-signal-strong">{uiText.demoErrorTitle}</p>
        <p className="mt-1 text-sm text-fg-muted">{uiText.demoErrorBody}</p>
        <button
          type="button"
          onClick={() => this.setState({ failed: false })}
          className="mt-4 rounded border border-line-strong px-3 py-1.5 text-sm text-fg hover:border-fg-muted coarse:min-h-11"
        >
          {uiText.demoErrorRetry}
        </button>
      </div>
    );
  }
}

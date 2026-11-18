import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { Policy, Scenario, SimState } from '../core/model';
import { createSim, step } from '../core/engine';

export const SPEEDS = [0.5, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];

/** Time between two autoplay steps at 1× speed. */
const BASE_INTERVAL_MS = 850;
/** The history keeps this many states for step back. */
const HISTORY_LIMIT = 400;

interface SimStore {
  readonly history: readonly SimState[];
  readonly index: number;
  readonly playing: boolean;
  readonly speed: Speed;
}

type Action =
  | { readonly type: 'reset'; readonly scenario: Scenario; readonly policy: Policy }
  | { readonly type: 'forward' }
  | { readonly type: 'back' }
  | { readonly type: 'play' }
  | { readonly type: 'pause' }
  | { readonly type: 'speed'; readonly speed: Speed }
  | { readonly type: 'apply'; readonly update: (state: SimState) => SimState };

const current = (store: SimStore) => store.history[store.index];

/** Add a state after the current one. Any "redo" states after the current one drop off. */
function push(store: SimStore, next: SimState): SimStore {
  const kept = store.history.slice(0, store.index + 1);
  const history = [...kept, next].slice(-HISTORY_LIMIT);
  return { ...store, history, index: history.length - 1 };
}

function reducer(store: SimStore, action: Action): SimStore {
  switch (action.type) {
    case 'reset':
      return { ...store, history: [createSim(action.scenario, action.policy)], index: 0, playing: false };
    case 'forward': {
      if (store.index < store.history.length - 1) return { ...store, index: store.index + 1 };
      const now = current(store);
      const next = step(now);
      if (next === now) return { ...store, playing: false };
      const pushed = push(store, next);
      return next.outcome === 'running' ? pushed : { ...pushed, playing: false };
    }
    case 'back':
      return { ...store, index: Math.max(0, store.index - 1), playing: false };
    case 'play':
      return current(store).outcome === 'running' || store.index < store.history.length - 1 ? { ...store, playing: true } : store;
    case 'pause':
      return { ...store, playing: false };
    case 'speed':
      return { ...store, speed: action.speed };
    case 'apply':
      return { ...push(store, action.update(current(store))), playing: false };
  }
}

export interface SimulationControls {
  readonly state: SimState;
  readonly playing: boolean;
  readonly speed: Speed;
  readonly canBack: boolean;
  readonly canForward: boolean;
  readonly play: () => void;
  readonly pause: () => void;
  readonly toggle: () => void;
  readonly forward: () => void;
  readonly back: () => void;
  readonly reset: () => void;
  readonly setSpeed: (speed: Speed) => void;
  /** Replace the current state with a new one, for example after a recovery action. */
  readonly apply: (update: (state: SimState) => SimState) => void;
}

export interface UseSimulationOptions {
  /** Listen to Space, the arrow keys, and R. Only the visible chapter should listen. */
  readonly keyboard?: boolean;
}

/**
 * Run a scenario under a policy. Autoplay uses requestAnimationFrame, so steps stay in time with
 * the display and stop when the tab is hidden.
 */
export function useSimulation(scenario: Scenario, policy: Policy, options: UseSimulationOptions = {}): SimulationControls {
  const [store, dispatch] = useReducer(reducer, undefined, () => ({
    history: [createSim(scenario, policy)],
    index: 0,
    playing: false,
    speed: 1 as Speed,
  }));

  // Start again when the scenario or the policy changes.
  useEffect(() => {
    dispatch({ type: 'reset', scenario, policy });
  }, [scenario, policy]);

  // Autoplay loop.
  useEffect(() => {
    if (!store.playing) return;
    const interval = BASE_INTERVAL_MS / store.speed;
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      elapsed += now - last;
      last = now;
      if (elapsed >= interval) {
        elapsed = 0;
        dispatch({ type: 'forward' });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onHide = () => {
      if (document.hidden) dispatch({ type: 'pause' });
    };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [store.playing, store.speed]);

  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const forward = useCallback(() => dispatch({ type: 'forward' }), []);
  const back = useCallback(() => dispatch({ type: 'back' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset', scenario, policy }), [scenario, policy]);
  const setSpeed = useCallback((speed: Speed) => dispatch({ type: 'speed', speed }), []);
  const apply = useCallback((update: (state: SimState) => SimState) => dispatch({ type: 'apply', update }), []);
  const toggle = useCallback(() => dispatch({ type: store.playing ? 'pause' : 'play' }), [store.playing]);

  // Keyboard shortcuts.
  useEffect(() => {
    if (!options.keyboard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.code === 'Space') {
        // A focused button or link already acts on Space.
        if (tag === 'BUTTON' || tag === 'A') return;
        e.preventDefault();
        toggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        forward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        back();
      } else if (e.code === 'KeyR') {
        reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options.keyboard, toggle, forward, back, reset]);

  const state = current(store);
  return useMemo(
    () => ({
      state,
      playing: store.playing,
      speed: store.speed,
      canBack: store.index > 0,
      canForward: store.index < store.history.length - 1 || state.outcome === 'running',
      play,
      pause,
      toggle,
      forward,
      back,
      reset,
      setSpeed,
      apply,
    }),
    [state, store.playing, store.speed, store.index, store.history.length, play, pause, toggle, forward, back, reset, setSpeed, apply],
  );
}

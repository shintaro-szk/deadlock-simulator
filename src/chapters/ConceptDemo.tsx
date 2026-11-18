import { useEffect, useRef } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { circularWait } from '../scenarios/circularWait';

/** Chapter 01: three processes run into a circular wait with no deadlock handling. */
export default function ConceptDemo() {
  const active = useIsActiveChapter('concept');
  const sim = useSimulation(circularWait, 'none', { keyboard: active });
  const started = useRef(false);
  const { play, state } = sim;

  // Play once, the first time the chapter comes into view.
  useEffect(() => {
    if (!active || started.current || state.step > 0) return;
    started.current = true;
    play();
  }, [active, play, state.step]);

  return <SimPanel sim={sim} title={circularWait.title} />;
}

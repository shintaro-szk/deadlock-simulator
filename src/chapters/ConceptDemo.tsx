import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { circularWait } from '../scenarios/circularWait';

/** Chapter 01: three processes run into a circular wait with no deadlock handling. */
export default function ConceptDemo() {
  const sim = useSimulation(circularWait, 'none', { keyboard: useIsActiveChapter('concept') });
  return <SimPanel sim={sim} title={circularWait.title} />;
}

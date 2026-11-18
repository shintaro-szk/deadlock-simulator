import { lazy, Suspense, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import type { ChapterId } from './content/deadlocks';
import { AppShell } from './components/shell/AppShell';
import { DemoBoundary } from './components/shell/DemoBoundary';
import { DemoFallback } from './components/shell/DemoFallback';

// Each demo loads in its own chunk, so the first paint needs only the text.
const ConceptDemo = lazy(() => import('./chapters/ConceptDemo'));
const ConditionsDemo = lazy(() => import('./chapters/ConditionsDemo'));
const RagDemo = lazy(() => import('./chapters/RagDemo'));
const PreventionDemo = lazy(() => import('./chapters/PreventionDemo'));

const withFallback = (node: ReactNode) => (
  <DemoBoundary>
    <Suspense fallback={<DemoFallback />}>{node}</Suspense>
  </DemoBoundary>
);

const demos: Partial<Record<ChapterId, ReactNode>> = {
  concept: withFallback(<ConceptDemo />),
  conditions: withFallback(<ConditionsDemo />),
  rag: withFallback(<RagDemo />),
  prevention: withFallback(<PreventionDemo />),
};

export default function App() {
  return (
    // Framer Motion follows the "reduce motion" setting of the operating system.
    <MotionConfig reducedMotion="user">
      <AppShell demos={demos} />
    </MotionConfig>
  );
}

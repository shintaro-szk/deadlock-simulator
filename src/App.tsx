import { lazy, Suspense, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import type { ChapterId } from './content/deadlocks';
import { AppShell } from './components/shell/AppShell';
import { DemoFallback } from './components/shell/DemoFallback';

// Each demo loads in its own chunk, so the first paint needs only the text.
const ConceptDemo = lazy(() => import('./chapters/ConceptDemo'));

const withFallback = (node: ReactNode) => <Suspense fallback={<DemoFallback />}>{node}</Suspense>;

const demos: Partial<Record<ChapterId, ReactNode>> = {
  concept: withFallback(<ConceptDemo />),
};

export default function App() {
  return (
    // Framer Motion follows the "reduce motion" setting of the operating system.
    <MotionConfig reducedMotion="user">
      <AppShell demos={demos} />
    </MotionConfig>
  );
}

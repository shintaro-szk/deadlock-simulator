import { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { useIsActiveChapter } from '../components/shell/activeChapter';
import { SimPanel } from '../components/sim/SimPanel';
import { OptionGroup } from '../components/ui/OptionGroup';
import { circularWait } from '../scenarios/circularWait';
import {
  conditionChoices,
  conditionNames,
  conditionNote,
  conditionPolicy,
  type ConditionChoice,
} from '../content/demoText';

const conditionKeys = Object.keys(conditionNames) as (keyof typeof conditionNames)[];

/** Chapter 02: break one condition and run the same circular wait again. */
export default function ConditionsDemo() {
  const [choice, setChoice] = useState<ConditionChoice>('all');
  const sim = useSimulation(circularWait, conditionPolicy[choice], { keyboard: useIsActiveChapter('conditions') });

  const controls = (
    <div className="space-y-3">
      <OptionGroup label="Break one condition" options={conditionChoices} value={choice} onChange={setChoice} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4" aria-label="Condition state">
        {conditionKeys.map((key) => {
          const broken = key === choice;
          return (
            <li key={key} className="flex items-baseline gap-2 text-xs">
              <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 shrink-0 ${broken ? 'bg-fg-faint' : 'bg-signal'}`} />
              <span className={broken ? 'text-fg-faint line-through' : 'text-fg-muted'}>{conditionNames[key]}</span>
              <span className="sr-only">{broken ? 'broken' : 'holds'}</span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-fg-muted">{conditionNote[choice]}</p>
    </div>
  );

  return <SimPanel sim={sim} title={circularWait.title} controls={controls} />;
}

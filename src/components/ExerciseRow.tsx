import {
  clamp,
  displayDistance,
  exerciseFraction,
  formatAmount,
  formatDistance,
  nativeDistance,
  STEP,
  type Category,
  type DistanceUnit,
} from '../lib/progress';
import type { Exercise } from '../data/programme';

interface Props {
  exercise: Exercise;
  done: number;
  category: Category;
  distanceUnit: DistanceUnit;
  onChange: (value: number) => void;
}

export function ExerciseRow({ exercise, done, category, distanceUnit, onChange }: Props) {
  const { target, unit } = exercise;
  const complete = done >= target;
  const isDistance = unit === 'mi';
  const weight = exercise.weightKg?.[category];

  // `done` / `target` are always stored natively in miles; convert only for display + input.
  const toDisplay = (v: number) => (isDistance ? displayDistance(v, distanceUnit) : v);
  const toNative = (v: number) => (isDistance ? nativeDistance(v, distanceUnit) : v);

  const step = isDistance ? 1 : STEP[unit];
  const displayDone = Math.round(toDisplay(done) * 10) / 10;

  const set = (displayValue: number) => {
    const native = toNative(displayValue);
    onChange(clamp(Math.round(native * 10) / 10, 0, target * 3));
  };

  const targetLabel = isDistance
    ? formatDistance(target, distanceUnit)
    : `${formatAmount(target, unit)}${unit === 'reps' ? ' reps' : ''}`;

  return (
    <li className={`exercise${complete ? ' complete' : ''}`}>
      <div className="exercise-head">
        <div>
          <h3>{exercise.name}</h3>
          <p className="meta">
            {unit === 'done' ? 'Complete the challenge' : `Target ${targetLabel}`}
            {weight !== undefined && <span className="tag">{weight}kg</span>}
            {exercise.incline !== undefined && <span className="tag">inc {exercise.incline}</span>}
          </p>
        </div>
        <button
          className={`check${complete ? ' on' : ''}`}
          aria-pressed={complete}
          aria-label={complete ? `Reset ${exercise.name}` : `Mark ${exercise.name} complete`}
          onClick={() => set(complete ? 0 : toDisplay(target))}
        >
          {complete ? '★' : 'DONE'}
        </button>
      </div>

      {unit !== 'done' && (
        <>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(done, target)}>
            <span style={{ width: `${exerciseFraction(done, exercise) * 100}%` }} />
          </div>
          <div className="stepper">
            <button aria-label={`Minus ${step}`} onClick={() => set(displayDone - step)} disabled={done <= 0}>
              −
            </button>
            <label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={isDistance ? 0.5 : 1}
                value={displayDone}
                aria-label={`${exercise.name} completed`}
                onChange={(e) => set(e.target.value === '' ? 0 : Number(e.target.value))}
              />
              <span>/ {targetLabel}</span>
            </label>
            <button aria-label={`Plus ${step}`} onClick={() => set(displayDone + step)}>
              +{step}
            </button>
          </div>
        </>
      )}
    </li>
  );
}

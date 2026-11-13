import { clamp, exerciseFraction, formatAmount, STEP, type Category } from '../lib/progress';
import type { Exercise } from '../data/programme';

interface Props {
  exercise: Exercise;
  done: number;
  category: Category;
  onChange: (value: number) => void;
}

export function ExerciseRow({ exercise, done, category, onChange }: Props) {
  const { target, unit } = exercise;
  const complete = done >= target;
  const step = STEP[unit];
  const set = (v: number) => onChange(clamp(Math.round(v * 10) / 10, 0, target * 3));
  const weight = exercise.weightKg?.[category];

  return (
    <li className={`exercise${complete ? ' complete' : ''}`}>
      <div className="exercise-head">
        <div>
          <h3>{exercise.name}</h3>
          <p className="meta">
            {unit === 'done' ? 'Complete the challenge' : `Target ${formatAmount(target, unit)}${unit === 'reps' ? ' reps' : ''}`}
            {weight !== undefined && <span className="tag">{weight}kg</span>}
            {exercise.incline !== undefined && <span className="tag">inc {exercise.incline}</span>}
          </p>
        </div>
        <button
          className={`check${complete ? ' on' : ''}`}
          aria-pressed={complete}
          aria-label={complete ? `Reset ${exercise.name}` : `Mark ${exercise.name} complete`}
          onClick={() => set(complete ? 0 : target)}
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
            <button aria-label={`Minus ${step}`} onClick={() => set(done - step)} disabled={done <= 0}>
              −
            </button>
            <label>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={unit === 'mi' ? 0.5 : 1}
                value={done}
                aria-label={`${exercise.name} completed`}
                onChange={(e) => set(e.target.value === '' ? 0 : Number(e.target.value))}
              />
              <span>
                / {target.toLocaleString('en-IE')} {unit}
              </span>
            </label>
            <button aria-label={`Plus ${step}`} onClick={() => set(done + step)}>
              +{step}
            </button>
          </div>
        </>
      )}
    </li>
  );
}

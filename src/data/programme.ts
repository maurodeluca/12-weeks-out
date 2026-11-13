export type Unit = 'mi' | 'm' | 'reps' | 'done';

export interface Exercise {
  id: string;
  name: string;
  target: number;
  unit: Unit;
  /** Kit weight in kg, per category. */
  weightKg?: { men: number; women: number };
  /** Treadmill incline for ruck sessions. */
  incline?: number;
}

export interface Week {
  week: number;
  title?: string;
  exercises: Exercise[];
}

export const PROGRAMME_NAME = 'Flutter Gym Programme';
export const PROGRAMME_TAGLINE = '12 Weeks Out';
export const START_DATE = '2026-09-14';
export const END_DATE = '2026-12-11';

const ex = (
  id: string,
  name: string,
  target: number,
  unit: Unit,
  extra: Pick<Exercise, 'weightKg' | 'incline'> = {},
): Exercise => ({ id, name, target, unit, ...extra });

const RUCK = { men: 20, women: 10 };
const LUNGE = { men: 10, women: 7.5 };
const SQUAT_PRESS = { men: 7.5, women: 5 };

export const WEEKS: Week[] = [
  {
    week: 1,
    exercises: [
      ex('run', 'Run', 5, 'mi'),
      ex('squats', 'Squats', 200, 'reps'),
      ex('push-ups', 'Push ups', 50, 'reps'),
      ex('sit-ups', 'Sit ups', 50, 'reps'),
      ex('row', 'Row', 2000, 'm'),
    ],
  },
  {
    week: 2,
    exercises: [
      ex('run', 'Run', 8, 'mi'),
      ex('ski', 'Ski erg', 2000, 'm'),
      ex('burpees', 'Burpees', 30, 'reps'),
      ex('sit-ups', 'Sit ups', 50, 'reps'),
    ],
  },
  {
    week: 3,
    exercises: [
      ex('run', 'Run', 5, 'mi'),
      ex('push-ups', 'Push ups', 100, 'reps'),
      ex('squats', 'Squats', 200, 'reps'),
      ex('sit-ups', 'Sit ups', 50, 'reps'),
      ex('row', 'Row', 3000, 'm'),
    ],
  },
  {
    week: 4,
    exercises: [
      ex('run', 'Run', 8, 'mi'),
      ex('burpees', 'Burpees', 100, 'reps'),
      ex('row', 'Row', 3000, 'm'),
      ex('sit-ups', 'Sit ups', 100, 'reps'),
      ex('tricep-dips', 'Bench tricep dips', 100, 'reps'),
    ],
  },
  {
    week: 5,
    exercises: [
      ex('ruck', 'Ruck', 5, 'mi', { weightKg: RUCK, incline: 6 }),
      ex('burpees', 'Burpees', 200, 'reps'),
      ex('run', 'Run', 10, 'mi'),
      ex('bench-dips', 'Bench dips', 100, 'reps'),
      ex('sit-ups', 'Sit ups', 200, 'reps'),
      ex('lunges', 'Lunges', 100, 'm', { weightKg: LUNGE }),
    ],
  },
  {
    week: 6,
    exercises: [
      ex('ruck', 'Ruck', 8, 'mi', { weightKg: RUCK, incline: 6 }),
      ex('push-ups', 'Push ups', 200, 'reps'),
      ex('sit-ups', 'Sit ups', 250, 'reps'),
      ex('squat-press', 'Squat to press', 150, 'reps', { weightKg: SQUAT_PRESS }),
      ex('run', 'Run', 5, 'mi'),
    ],
  },
  {
    week: 7,
    exercises: [
      ex('ruck', 'Ruck', 10, 'mi', { weightKg: RUCK, incline: 8 }),
      ex('burpees', 'Burpees', 200, 'reps'),
      ex('bench-dips', 'Bench dips', 150, 'reps'),
      ex('lunges', 'Lunges', 100, 'm', { weightKg: LUNGE }),
      ex('run', 'Run', 10, 'mi'),
    ],
  },
  {
    week: 8,
    exercises: [
      ex('run', 'Run', 15, 'mi'),
      ex('row', 'Row', 2000, 'm'),
      ex('ski', 'Ski erg', 2000, 'm'),
      ex('squat-press', 'Squat to press', 100, 'reps', { weightKg: SQUAT_PRESS }),
      ex('run-2', 'Run', 5, 'mi'),
    ],
  },
  {
    week: 9,
    exercises: [
      ex('ruck', 'Ruck', 12, 'mi', { weightKg: RUCK, incline: 8 }),
      ex('burpees', 'Burpees', 150, 'reps'),
      ex('sit-ups', 'Sit ups', 200, 'reps'),
      ex('push-press', 'Push press', 100, 'reps', { weightKg: LUNGE }),
      ex('run', 'Run', 10, 'mi'),
    ],
  },
  {
    week: 10,
    exercises: [
      ex('seal-burpees', 'Navy Seal burpees', 150, 'reps'),
      ex('lunges', 'Lunges', 100, 'm', { weightKg: LUNGE }),
      ex('row', 'Row', 5000, 'm'),
      ex('ski', 'Ski', 5000, 'm'),
      ex('sit-ups', 'Sit ups', 200, 'reps'),
      ex('run', 'Run', 10, 'mi'),
    ],
  },
  {
    week: 11,
    exercises: [
      ex('ruck', 'Ruck', 12, 'mi', { weightKg: RUCK, incline: 8 }),
      ex('push-ups', 'Push ups', 200, 'reps'),
      ex('lunges', 'Lunges', 100, 'm', { weightKg: LUNGE }),
      ex('bear-crawl', 'Bear crawl', 200, 'm'),
      ex('sit-ups', 'Sit ups', 200, 'reps'),
      ex('run', 'Run', 10, 'mi'),
    ],
  },
  {
    week: 12,
    title: 'The Long Walk',
    exercises: [ex('long-walk', 'The Long Walk', 1, 'done')],
  },
];

/** Week 12 details are still to be announced by the instructor. */
export const WEEK_12_TBA = ['Location', 'Weight', 'Distance', 'Gradient'];

import { useEffect, useState } from 'react';
import type { DistanceUnit } from './progress';

const KEY = '12-weeks-out:distance-unit';

function load(): DistanceUnit {
  return localStorage.getItem(KEY) === 'km' ? 'km' : 'mi';
}

/** Purely a display preference — stored locally per device, not synced to Supabase. */
export function useDistanceUnit() {
  const [unit, setUnit] = useState<DistanceUnit>(load);

  useEffect(() => {
    localStorage.setItem(KEY, unit);
  }, [unit]);

  return [unit, setUnit] as const;
}

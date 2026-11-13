import { useCallback, useEffect, useState } from 'react';
import { initialState, importState, type State } from './progress';

const KEY = '12-weeks-out:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? importState(raw) : initialState;
  } catch {
    return initialState;
  }
}

export function useProgress() {
  const [state, setState] = useState<State>(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);
  const replace = useCallback((s: State) => setState(s), []);

  return { state, update, replace };
}

import { describe, expect, it } from 'vitest';
import { errorMessage } from './cloud';

describe('errorMessage', () => {
  it('reads .message off a real Error', () => {
    expect(errorMessage(new Error('boom'), 'fallback')).toBe('boom');
  });

  it('reads .message off a plain object, like a Supabase/Postgrest error', () => {
    expect(errorMessage({ message: 'relation "profiles" does not exist', code: '42P01' }, 'fallback')).toBe(
      'relation "profiles" does not exist',
    );
  });

  it('falls back for anything without a usable message', () => {
    expect(errorMessage('a plain string', 'fallback')).toBe('fallback');
    expect(errorMessage(null, 'fallback')).toBe('fallback');
    expect(errorMessage(undefined, 'fallback')).toBe('fallback');
    expect(errorMessage({ code: '42P01' }, 'fallback')).toBe('fallback');
  });
});

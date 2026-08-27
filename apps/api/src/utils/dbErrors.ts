// Postgres error codes. https://www.postgresql.org/docs/current/errcodes-appendix.html
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function hasCode(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === code;
}

// Drizzle wraps the raw pg error (which has .code) inside a DrizzleQueryError as `.cause`.
function matchesCode(err: unknown, code: string): boolean {
  if (hasCode(err, code)) return true;
  if (err instanceof Error && err.cause) return hasCode(err.cause, code);
  return false;
}

export function isUniqueViolation(err: unknown): boolean {
  return matchesCode(err, UNIQUE_VIOLATION);
}

export function isForeignKeyViolation(err: unknown): boolean {
  return matchesCode(err, FOREIGN_KEY_VIOLATION);
}

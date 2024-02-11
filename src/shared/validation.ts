import {Check, Violation} from 'check-compiler';

export class DomainError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, readonly details?: Violation[]) {
    super(message, 'ENOENT');
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, readonly details?: Violation[]) {
    super(message, 'EINVAL');
  }
}

export function makeAssetValid<T>(check: Check<T>): (input: T) => void {
  return (input: T) => {
    const violations: Violation[] = [];
    check(input, violations);
    if (violations.length > 0) {
      throw new ValidationError(
        'There is one or more field violations.',
        violations,
      );
    }
  };
}

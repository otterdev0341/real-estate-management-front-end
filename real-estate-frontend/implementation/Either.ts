// Define the Left and Right types, mirroring Java's Either<L, R> pattern.
// This is a "discriminated union" that TypeScript natively understands.
interface Left<L> {
  type: 'left';
  value: L;
}

interface Right<R> {
  type: 'right';
  value: R;
}

// The core Either type that can be either a Left or a Right.
// This is the functional equivalent of a try/catch block.
type Either<L, R> = Left<L> | Right<R>;

// --- Helper Functions to Create Either Objects ---
// These factory functions make it easy to create new Either instances.

/**
 * Creates a new Left object, typically for an error value.
 * @param value The value to be wrapped in the Left type.
 */
export function left<L, R>(value: L): Either<L, R> {
  return { type: 'left', value };
}

/**
 * Creates a new Right object, typically for a successful value.
 * @param value The value to be wrapped in the Right type.
 */
export function right<L, R>(value: R): Either<L, R> {
  return { type: 'right', value };
}

// --- Helper Functions to Check the Type (isLeft/isRight) ---
// These functions use a "type guard" to tell TypeScript which branch the result is.

/**
 * Checks if the Either object is a Left.
 * @param either The Either object to check.
 * @returns True if the either is a Left, false otherwise.
 */
export function isLeft<L, R>(either: Either<L, R>): either is Left<L> {
  return either.type === 'left';
}

/**
 * Checks if the Either object is a Right.
 * @param either The Either object to check.
 * @returns True if the either is a Right, false otherwise.
 */
export function isRight<L, R>(either: Either<L, R>): either is Right<R> {
  return either.type === 'right';
}

// --- Getter Functions (getLeftValue/getRightValue) ---
// These functions provide a safe way to access the value.

/**
 * Gets the value from a Left instance.
 * Returns undefined if the Either is a Right.
 * @param either The Either object to get the value from.
 * @returns The left value if it exists, otherwise undefined.
 */
export function getLeftValue<L, R>(either: Either<L, R>): L | undefined {
  if (isLeft(either)) {
    return either.value;
  }
  return undefined;
}

/**
 * Gets the value from a Right instance.
 * Returns undefined if the Either is a Left.
 * @param either The Either object to get the value from.
 * @returns The right value if it exists, otherwise undefined.
 */
export function getRightValue<L, R>(either: Either<L, R>): R | undefined {
  if (isRight(either)) {
    return either.value;
  }
  return undefined;
}


export default Either;

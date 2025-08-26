/**
 * @file This file contains a TypeScript implementation of a ServiceError
 * discriminated union, mirroring a Java sealed interface pattern.
 */

// --- BaseError Interfaces and ErrorType Enum ---
// These are the foundational types for the ServiceError.
export type ErrorType = 'VALIDATION' | 'BUSINESS_RULE' | 'TECHNICAL' | 'NOT_FOUND' | 'UNEXPECTED' | 'UNAUTHORIZED';

export interface BaseError {
  /** The unique error code for the specific error type. */
  code: string;
  /** The category or classification of the error. */
  type: ErrorType;
  /** A human-readable message describing the error. */
  message: string;
  /** The name of the service that generated the error. */
  serviceName: string;
  /** The underlying cause of the error, for creating a chain of errors. */
  cause?: unknown;
}

// --- ServiceError Discriminated Union ---
// This union type represents all possible concrete ServiceError types.
// The 'type' property acts as the discriminator, allowing TypeScript to
// perform type narrowing.
export type ServiceError =
  | CreateFailed
  | FetchFailed
  | UpdateFailed
  | DeleteFailed
  | Unauthorized
  | UnexpectedError;


// --- ServiceError Classes with Static Factory Methods ---
// Each class extends the BaseError interface and has a static 'create' method
// that acts like a static constructor.

export class CreateFailed implements BaseError {
  public readonly kind = 'CreateFailed';
  public readonly code = 'SVC_001';
  public readonly type = 'VALIDATION';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new CreateFailed instance. */
  public static create(serviceName: string, message: string, cause?: unknown): CreateFailed {
    return new CreateFailed(serviceName, message, cause);
  }
}

export class FetchFailed implements BaseError {
  public readonly kind = 'FetchFailed';
  public readonly code = 'SVC_002';
  public readonly type = 'BUSINESS_RULE';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new FetchFailed instance. */
  public static create(serviceName: string, message: string, cause?: unknown): FetchFailed {
    return new FetchFailed(serviceName, message, cause);
  }
}

export class UpdateFailed implements BaseError {
  public readonly kind = 'UpdateFailed';
  public readonly code = 'SVC_003';
  public readonly type = 'TECHNICAL';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new UpdateFailed instance. */
  public static create(serviceName: string, message: string, cause?: unknown): UpdateFailed {
    return new UpdateFailed(serviceName, message, cause);
  }
}

export class DeleteFailed implements BaseError {
  public readonly kind = 'DeleteFailed';
  public readonly code = 'SVC_004';
  public readonly type = 'VALIDATION';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new DeleteFailed instance. */
  public static create(serviceName: string, message: string, cause?: unknown): DeleteFailed {
    return new DeleteFailed(serviceName, message, cause);
  }
}

export class Unauthorized implements BaseError {
  public readonly kind = 'Unauthorized';
  public readonly code = 'SVC_005';
  public readonly type = 'UNAUTHORIZED';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new Unauthorized instance. */
  public static create(serviceName: string, message: string, cause?: unknown): Unauthorized {
    return new Unauthorized(serviceName, message, cause);
  }
}

export class UnexpectedError implements BaseError {
  public readonly kind = 'UnexpectedError';
  public readonly code = 'SVC_006';
  public readonly type = 'UNEXPECTED';

  private constructor(public readonly serviceName: string, public readonly message: string, public readonly cause?: unknown) {}

  /** Creates a new UnexpectedError instance, optionally wrapping the original error. */
  public static create(serviceName: string, message: string, cause?: unknown): UnexpectedError {
    // We use a private constructor to ensure that all instances are created via the factory method
    return new UnexpectedError(serviceName, message, cause);
  }
}


// --- Type Guards for ServiceError ---
// These functions allow you to check the specific type of an error
// and narrow the type for safe access to its properties.
export function isCreateFailed(error: ServiceError): error is CreateFailed {
  return error.kind === 'CreateFailed';
}

export function isFetchFailed(error: ServiceError): error is FetchFailed {
  return error.kind === 'FetchFailed';
}

export function isUpdateFailed(error: ServiceError): error is UpdateFailed {
  return error.kind === 'UpdateFailed';
}

export function isUnauthorized(error: ServiceError): error is Unauthorized {
  return error.kind === 'Unauthorized';
}


/**
 * @file This file contains a TypeScript implementation of the Optional class,
 * inspired by Java's java.util.Optional. It provides a type-safe way to handle
 * potentially null or undefined values.
 */

/**
 * An immutable container object that may or may not contain a non-null value.
 * This class is designed to handle optional values in a functional style,
 * helping to avoid null checks.
 * @template T The type of the value held by the Optional.
 */
export class Optional<T> {
  private constructor(private readonly value: T | null | undefined) {}

  /**
   * Returns an Optional with the specified present non-null value.
   * Throws an error if the value is null or undefined.
   * @param value The value to be wrapped in an Optional.
   * @returns An Optional containing the specified value.
   */
  public static of<T>(value: T): Optional<T> {
    if (value === null || value === undefined) {
      throw new Error("Cannot create Optional.of() with a null or undefined value.");
    }
    return new Optional(value);
  }

  /**
   * Returns an Optional describing the specified value, if non-null,
   * otherwise returns an empty Optional.
   * @param value The value to be wrapped in an Optional.
   * @returns An Optional with the specified value, or an empty Optional if the value is null or undefined.
   */
  public static ofNullable<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }

  /**
   * Returns an empty Optional instance.
   * @returns An empty Optional.
   */
  public static empty<T>(): Optional<T> {
    return new Optional(null as T);
  }

    /**
   * If a value is present, returns the value, otherwise throws an error.
   * This method should be used with caution, as it re-introduces the risk of runtime errors
   * that Optional is designed to prevent.
   * @returns The non-null value held by this Optional.
   * @throws {Error} if there is no value present.
   */
  public get(): T {
    if (!this.isPresent()) {
      throw new Error("No value present in Optional.");
    }
    return this.value as T;
  }



  /**
   * Returns true if a value is present in this Optional, otherwise false.
   * @returns A boolean indicating if a value is present.
   */
  public isPresent(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  /**
   * If a value is present, performs the given action with the value.
   * @param action The function to be executed if a value is present.
   */
  public ifPresent(action: (value: T) => void): void {
    if (this.isPresent()) {
      action(this.value as T);
    }
  }

  /**
   * If a value is present, applies the provided mapping function to it,
   * and returns an Optional describing the result. Otherwise, returns an empty Optional.
   * @param mapper The mapping function to apply to the value.
   * @returns An Optional describing the result of the mapping function.
   */
  public map<U>(mapper: (value: T) => U | null | undefined): Optional<U> {
    if (!this.isPresent()) {
      return Optional.empty<U>();
    }
    return Optional.ofNullable(mapper(this.value as T));
  }

  /**
   * Returns the value if present, otherwise returns other.
   * @param other The value to be returned if this Optional is empty.
   * @returns The value if present, otherwise the other value.
   */
  public orElse(other: T): T {
    return this.isPresent() ? (this.value as T) : other;
  }
}

// // --- Example Usage ---

// interface User {
//   id: number;
//   name: string;
// }

// // Function that might return a User or null
// function findUserById(id: number): User | null {
//   const users: User[] = [
//     { id: 1, name: 'Alice' },
//     { id: 2, name: 'Bob' },
//   ];

//   const user = users.find(u => u.id === id);
//   return user || null;
// }

// // Using Optional with a value that may be present
// const user1 = Optional.ofNullable(findUserById(1));
// user1.ifPresent(u => console.log(`Found user: ${u.name}`)); // Logs "Found user: Alice"

// // Using Optional with a value that is not present
// const user3 = Optional.ofNullable(findUserById(3));
// const userName = user3.map(u => u.name).orElse('Guest');
// console.log(`User name: ${userName}`); // Logs "User name: Guest"

// // Chaining operations with map
// const welcomeMessage = Optional.ofNullable(findUserById(2))
//   .map(user => `Welcome, ${user.name}!`)
//   .orElse('Welcome, Guest!');
// console.log(welcomeMessage); // Logs "Welcome, Bob!"

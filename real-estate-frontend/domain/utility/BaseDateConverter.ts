/**
 * @class BaseDateConverter
 * @description
 * An abstract base class that provides common utility methods for date conversion.
 * Other classes can extend this class to inherit its functionality.
 */
export abstract class BaseDateConverter {
  /**
   * @protected
   * A helper function to pad a number with a leading zero if it's a single digit.
   * @param num The number to pad.
   * @param size The total length of the padded string (default is 2).
   */
  protected pad(num: number, size = 2): string {
    return String(num).padStart(size, '0');
  }

  /**
   * @public
   * Formats a given Date object into a string with microseconds precision.
   * This method can be accessed by any class that extends BaseDateConverter.
   * @param date The Date object to format.
   * @returns A formatted date string in the format "YYYY-MM-DDTHH:mm:ss.SSSSSS".
   */
  public formatDateToMicroseconds(date: Date): string {
    const year = date.getFullYear();
    const month = this.pad(date.getMonth() + 1);
    const day = this.pad(date.getDate());
    const hours = this.pad(date.getHours());
    const minutes = this.pad(date.getMinutes());
    const seconds = this.pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Append '000' to the milliseconds to get microseconds precision.
    const microseconds = milliseconds + '000';

    // Use 'T' between date and time for ISO-8601
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}`;
  }

  /**
   * Converts a formatted backend date string into a Date object.
   *
   * @param dateString The date string from the backend, e.g., "2025-08-31 16:37:08.329135".
   * @returns A new Date object.
   */
  public convertStringToDate(dateString: string): Date {
    if (!dateString || typeof dateString !== "string") return null as any;

    // Support both " " and "T" as separator
    const [datePart, timePart] = dateString.includes('T')
      ? dateString.split('T')
      : dateString.split(' ');

    if (!datePart || !timePart) return null as any;

    const [year, month, day] = datePart.split('-').map(Number);

    const [timeWithoutMicroseconds, microsecondsPart] = timePart.split('.');
    const [hours, minutes, seconds] = timeWithoutMicroseconds.split(':').map(Number);
    const milliseconds = microsecondsPart ? Math.floor(Number(microsecondsPart) / 1000) : 0;

    return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
  }
}

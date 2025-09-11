export default function formatDateToMicroseconds(date: Date): string {

    const pad = (num: number, size = 2): string => {
      return String(num).padStart(size, '0');
    }

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

    // Append '000' to the milliseconds to get microseconds precision.
    const microseconds = milliseconds + '000';

    // Use 'T' between date and time for ISO-8601
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}`;
  }
const formatDateToMicroseconds = (date: Date): string => {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // เติมศูนย์ให้ครบ 6 หลัก (จาก ms 3 หลัก → microseconds 6 หลัก)
  const microseconds = milliseconds + '000';

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}`;
}

export default formatDateToMicroseconds;
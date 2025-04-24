import dayjs from "dayjs";

interface TimeOptions {
  time?: string | Date;
  // "2024-03-15" (YYYY-MM-DD)
  // "2024-03-15 12:00:00" (YYYY-MM-DD HH:mm:ss)
  // "2024-03-15T12:00:00" (ISO 8601)
  // "2024-03-15T12:00:00+09:00" (ISO 8601 with timezone)
  minutes?: number;
  days?: number;
  timezone?: number; // 기본값 9 (한국 시간)
}

export default function dbDayjs({
  time,
  minutes = 0,
  days = 0,
  timezone = 9,
}: TimeOptions = {}): Date {
  const base = dayjs(time || undefined);
  return base
    .add(minutes, "minute")
    .add(days, "day")
    .add(time ? -timezone : timezone, "hour")
    .toDate();
}

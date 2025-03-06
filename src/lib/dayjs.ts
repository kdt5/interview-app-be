import dayjs from "dayjs";

interface TimeOptions {
  time?: string | Date;
  minutes?: number;
  timezone?: number; // 기본값 9 (한국 시간)
}

export default function dbDayjs({
  time,
  minutes = 0,
  timezone = 9,
}: TimeOptions = {}): Date {
  const base = dayjs(time || undefined);
  return base
    .add(minutes, "minute")
    .add(time ? -timezone : timezone, "hour")
    .toDate();
}

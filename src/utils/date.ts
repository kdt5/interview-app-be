import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);

export function getWeekStartDate(startDate?: Date | string) {
  return dayjs(startDate)
    .tz("Asia/Seoul")
    .startOf("week")
    .add(1, "day")
    .toDate();
}

export function getWeeklyLabel(date: Date) {
  const convertedDate = dayjs(date).tz("Asia/Seoul");
  const month = convertedDate.month() + 1;
  // Calculate the week of the month (1-5) for the given date.
  const weekOfMonth =
    convertedDate.week() - convertedDate.startOf("month").week() + 1;

  return `M-${month}-W-${weekOfMonth}`;
}

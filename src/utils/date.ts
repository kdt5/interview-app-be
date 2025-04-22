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

export function getWeeklyFormattedDate(date: Date) {
  return `M-${dayjs(date).tz("Asia/Seoul").format("MM")}-W-${dayjs(date)
    .tz("Asia/Seoul")
    .week()}`;
}

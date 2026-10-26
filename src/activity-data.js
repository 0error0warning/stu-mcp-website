// Shared validation and calendar arithmetic for the browser and public API.
export const ACTIVITY_REPOSITORY = '0error0warning/stu-mcp';
const DAY = 86_400_000;

export function utcDay(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && utcDay(`${value}T00:00:00Z`) === value;
}

export function validateActivity(data) {
  if (!data || data.schemaVersion !== 1 || data.repository !== ACTIVITY_REPOSITORY
      || typeof data.branch !== 'string' || !data.branch
      || !Number.isFinite(Date.parse(data.generatedAt))
      || !Array.isArray(data.days) || data.days.length < 1 || data.days.length > 400) {
    throw new Error('Invalid activity response');
  }
  let previous = null;
  let total = 0;
  for (const day of data.days) {
    if (!day || !validDate(day.date) || !Number.isSafeInteger(day.count) || day.count < 0
        || (previous && Date.parse(day.date) - Date.parse(previous) !== DAY)) {
      throw new Error('Activity days must be complete, ordered, and nonnegative');
    }
    previous = day.date;
    total += day.count;
  }
  if (!Number.isSafeInteger(total) || data.totalCommits !== total
      || data.dateRange?.start !== data.days[0].date
      || data.dateRange?.end !== data.days.at(-1).date
      || data.dateRange?.days !== data.days.length) {
    throw new Error('Activity totals or range do not match');
  }
  return data;
}

export function activityRange(data, length = 30) {
  const days = data.days.slice(-length);
  return {
    start: days[0].date,
    end: days.at(-1).date,
    days,
    total: days.reduce((sum, day) => sum + day.count, 0),
  };
}

export function groupActivityWeeks(days) {
  const weeks = [];
  for (const day of days) {
    const time = Date.parse(`${day.date}T00:00:00Z`);
    const weekday = (new Date(time).getUTCDay() + 6) % 7;
    const key = utcDay(time - weekday * DAY);
    let week = weeks.at(-1);
    if (!week || week.key !== key) {
      week = { key, start: day.date, end: day.date, count: 0, days: 0 };
      weeks.push(week);
    }
    week.count += day.count;
    week.end = day.date;
    week.days += 1;
  }
  return weeks;
}

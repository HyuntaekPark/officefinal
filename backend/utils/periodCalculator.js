const PERIODS = [
  { period: 1, start: "08:30", end: "09:20" },
  { period: 2, start: "09:30", end: "10:20" },
  { period: 3, start: "10:30", end: "11:20" },
  { period: 4, start: "11:30", end: "12:20" },
  { period: 5, start: "13:30", end: "14:20" },
  { period: 6, start: "14:30", end: "15:20" },
  { period: 7, start: "15:30", end: "16:20" },
  { period: 8, start: "16:30", end: "17:20" }
];

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getKoreanDate(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: values.weekday,
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function getCurrentPeriod(now = new Date()) {
  const current = getKoreanDate(now);
  const day = current.day;

  if (!["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day)) {
    return null;
  }

  const matchedPeriod = PERIODS.find(({ start, end }) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return current.minutes >= startMinutes && current.minutes <= endMinutes;
  });

  if (!matchedPeriod) {
    return null;
  }

  return {
    day,
    period: matchedPeriod.period
  };
}

module.exports = {
  PERIODS,
  getCurrentPeriod
};

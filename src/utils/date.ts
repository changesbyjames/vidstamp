import { UTCDate } from '@date-fns/utc';
import { getDayOfYear, setDayOfYear, setHours, setMinutes, setSeconds, subYears } from 'date-fns';
import { useEffect, useState } from 'react';
import { timestamp } from './timestamp';

export function useDate() {
  const [date, setDate] = useState(new UTCDate());
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new UTCDate());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return date;
}

export const recreateDateFromTimestamp = (ts: ReturnType<typeof timestamp.deserialise>) => {
  let date = new UTCDate();
  const currentDayOfYear = getDayOfYear(date);
  if (currentDayOfYear < ts.dayOfYear) {
    date = subYears(date, 1);
  }
  date = setDayOfYear(date, ts.dayOfYear);
  date = setHours(date, ts.hour);
  date = setMinutes(date, ts.minute);
  date = setSeconds(date, ts.second);
  return date;
};

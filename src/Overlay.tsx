import { format, getDayOfYear, getHours, getMinutes, getSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useState } from 'react';
import { Code } from './Code';
import { useDate } from './utils/date';
import { timestamp } from './utils/timestamp';

export function Overlay() {
  const utcDate = useDate();
  const [size] = useState(4);

  const date = toZonedTime(utcDate, 'America/Chicago');
  const second = getSeconds(date);
  const minute = getMinutes(date);
  const hour = getHours(date);
  const dayOfYear = getDayOfYear(date);
  const cam = 0;

  const ts = timestamp.serialise({
    second,
    minute,
    hour,
    dayOfYear,
    cam
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <Code data={ts.data} size={size} />
      </div>
      <div style={{ backgroundColor: 'white', padding: 30, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: 70, margin: 0 }}>{format(date, 'HH:mm:ss')}</p>
        <p>{ts.rep}</p>
        <p>{ts.bin}</p>
      </div>
    </div>
  );
}

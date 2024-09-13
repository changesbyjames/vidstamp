import { BitStruct } from './bitstruct';

// Defining the size of each field in the timestamp
export const timestamp = new BitStruct(
  {
    second: 6, // 6 bits for seconds (0-59)
    minute: 6, // 6 bits for minutes (0-59)
    hour: 5, // 5 bits for hours (0-23)
    dayOfYear: 9, // 9 bits for day of the year (0-366)
    cam: 4 // 4 bits for camera (0-15)
  },
  { wordSize: 3 }
);

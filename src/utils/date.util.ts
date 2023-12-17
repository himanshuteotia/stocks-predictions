import { Timeframes, Timings } from '../enums/exchange.enum';
import { CustomTimeFormat } from '../interfaces/angle-one.interface';
import moment from 'moment';
import 'moment-timezone';
import { holidays } from '../data/holidays';

interface TimeframeMap {
  [key: string]: number;
}

interface TimeframeResult {
  startDate: string;
  endDate: string;
}

// const numberOfDays = 14; // Specify the number of days in the date range
// const holidays = ['2023-01-03', '2023-01-10']; // Array of holiday dates in "YYYY-MM-DD" format
export function generateDateRange(
  days: number = 14,
  holidays: string[] = []
): CustomTimeFormat[] {
  const dates: CustomTimeFormat[] = [];
  const currentDate = new Date();
  const lastDate = new Date();

  lastDate.setHours(15);
  lastDate.setMinutes(15);

  while (dates.length < days) {
    if (
      currentDate.getDay() !== 0 && // Skip Sundays (0)
      currentDate.getDay() !== 6 && // Skip Saturdays (6)
      !holidays.includes(currentDate.toISOString().slice(0, 10)) // Skip holidays
    ) {
      const date = currentDate.toISOString().slice(0, 10);
      const time =
        dates.length === days - 1
          ? Timings.START_TIME // Start date time is set to 09:15
          : Timings.END_TIME; // Default time is set to 03:15

      const dateTime = `${date} ${time}` as CustomTimeFormat;
      dates.push(dateTime);
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  dates.reverse(); // Reverse the dates to get them in chronological order

  return dates;
}

export function createIntradayTimeframe(
  timePeriods: number,
  timeframe: keyof TimeframeMap
): TimeframeResult {
  const timeframes: TimeframeMap = {
    ONE_MINUTE: 1,
    THREE_MINUTE: 3,
    FIVE_MINUTE: 5,
    TEN_MINUTE: 10,
    FIFTEEN_MINUTE: 15
  };

  const startTime: Date = new Date();
  startTime.setHours(9, 15, 0, 0);
  const endTime: Date = new Date(
    startTime.getTime() + timeframes[timeframe] * timePeriods * 60000
  );

  const startDateTimeString: string = startTime
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
  const endDateTimeString: string = endTime
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');

  return { startDate: startDateTimeString, endDate: endDateTimeString };
}

export function isOutsideTradingTime() {
  const currentDateTime = new Date();
  const tradingStartTime = new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
    9,
    15,
    0
  );
  const tradingEndTime = new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
    15,
    15,
    0
  );

  return currentDateTime < tradingStartTime || currentDateTime > tradingEndTime;
}

// I want date series in this string format like ["2021-02-07 14:45","2021-02-07 14:50"]
// I have timeframes

//  ONE_MINUTE = 'ONE_MINUTE',
//   THREE_MINUTE = 'THREE_MINUTE',
//   FIVE_MINUTE = 'FIVE_MINUTE',
//   TEN_MINUTE = 'TEN_MINUTE',
//   FIFTEEN_MINUTE = 'FIFTEEN_MINUTE',
//   THIRTY_MINUTE = 'THIRTY_MINUTE',
//   ONE_HOUR = 'ONE_HOUR',
//   ONE_DAY = 'ONE_DAY'

// Trading time everyday 9:15 to 15:15 (expect holidays and weekends)

// Lets say if on current time I say that I want 10 time periods date series

// then it will go on past time to  create series

// exp : current time is 2021-02-08 09:30
// I provided timePeriods 10
// and time frame is 5 minute then all time series has time difference of 5 minutes in the past

// then the time series would be you can see the last time is exactly the start time(current time)

// [2021-02-07 14:45,2021-02-07 14:50,2021-02-07 14:55,2021-02-07 15:00,2021-02-07 15:05,2021-02-07 15:10,2021-02-08 09:15,2021-02-08 09:20,2021-02-08 09:25,2021-02-08 09:30]

// Things to note :
// 1. list of holidays should be skip
// 2. Saturday Sunday should be skip
// 3. If todays current time is after 15:15 and before next day 9:15 then it should start subtracting the time series from end time of today like [2021-02-07 15:00,2021-02-07 15:05,2021-02-07 15:10,2021-02-07 15:15] you can see the last element is todays end time of trading time

export function generateTimestamps(
  currentTime: string,
  timeframe: Timeframes,
  periods: number
) {
  let current = moment.tz(currentTime, 'Asia/Kolkata');
  let timestamps: string[] = [];

  while (timestamps.length < periods) {
    if (!isHolidayOrWeekend(current) && isTradingTime(current)) {
      timestamps.push(current.format('YYYY-MM-DD HH:mm'));
    }

    let subtractTime = timeframe;

    // Get start of trading day
    let tradingStart = current
      .clone()
      .startOf('day')
      .add(9, 'hours')
      .add(15, 'minutes');

    if (current.isBefore(tradingStart)) {
      current = moveToPreviousTradingTime(current);
    } else {
      let diff = current.diff(tradingStart, 'minutes');

      if (diff < timeframe) {
        subtractTime = diff;
        current = moveToPreviousTradingTime(current);
        let remainingTime = timeframe - subtractTime;
        current.subtract(remainingTime, 'minutes');
      } else {
        current.subtract(subtractTime, 'minutes');
      }
    }
  }

  return timestamps.reverse();
}

function isHolidayOrWeekend(date: moment.Moment) {
  const day = date.day();
  const formattedDate = date.format('YYYY-MM-DD');

  // Saturday or Sunday or holiday
  return day === 0 || day === 6 || holidays.includes(formattedDate);
}

function isTradingTime(time: moment.Moment) {
  const start = moment(time).startOf('day').add(9, 'hours').add(15, 'minutes');
  const end = moment(time).startOf('day').add(15, 'hours').add(30, 'minutes');

  // Check if the time is between the start and end of the trading hours
  return time.isBetween(start, end, undefined, '[]');
}

function moveToPreviousTradingTime(time: moment.Moment): moment.Moment {
  // move to end of trading time of previous day
  let previousTradingDay = time.clone().subtract(1, 'days').hour(15).minute(30);

  // If the previous day is a holiday or weekend, keep subtracting days until a trading day is found
  while (isHolidayOrWeekend(previousTradingDay)) {
    previousTradingDay.subtract(1, 'days');
  }

  return previousTradingDay;
}

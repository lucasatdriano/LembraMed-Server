import { addDays, addHours, isAfter, isBefore } from 'date-fns';
import { dateTime } from '../formatters/date-time.js';
import { AppError } from '../errors/app.error.js';

export const calculateNextSchedule = (
    lastScheduledTime,
    intervalInHours,
    referenceDate = null,
) => {
    const now = resolveNow(referenceDate);

    if (intervalInHours >= 24 && intervalInHours % 24 === 0) {
        return calculateDailyIntervalSchedule(
            lastScheduledTime,
            intervalInHours,
            now,
        );
    }

    return calculateHourlyIntervalSchedule(
        lastScheduledTime,
        intervalInHours,
        now,
    );
};

const getNextTimeOccurrence = (timeString, referenceDate = null) => {
    const now = resolveNow(referenceDate);

    const todayTime = dateTime.timeStringToDate(timeString, now);

    if (now <= todayTime || dateTime.isSameTime(now, todayTime)) {
        return todayTime;
    }

    const tomorrowTime = dateTime.timeStringToDate(timeString, addDays(now, 1));

    return tomorrowTime;
};

const resolveNow = (referenceDate) => {
    return referenceDate ? dateTime.now(referenceDate) : dateTime.now();
};

const calculateDailyIntervalSchedule = (
    lastScheduledTime,
    intervalInHours,
    now,
) => {
    const daysToAdd = intervalInHours / 24;

    const nextOccurrence = getNextTimeOccurrence(lastScheduledTime, now);

    return isAfter(now, nextOccurrence)
        ? addDays(nextOccurrence, daysToAdd)
        : nextOccurrence;
};

const calculateHourlyIntervalSchedule = (
    lastScheduledTime,
    intervalInHours,
    now,
) => {
    const lastDateTime = dateTime.timeStringToDate(lastScheduledTime, now);

    let nextDateTime = addHours(lastDateTime, intervalInHours);

    if (!intervalInHours || intervalInHours <= 0) {
        throw new AppError('Invalid intervalInHours', 400);
    }

    while (isBefore(nextDateTime, now)) {
        nextDateTime = addHours(nextDateTime, intervalInHours);
    }

    return nextDateTime;
};

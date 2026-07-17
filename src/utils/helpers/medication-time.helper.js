import { addHours, isBefore } from 'date-fns';
import { dateTime } from '../formatters/date-time.js';
import { AppError } from '../errors/app.error.js';

export const calculateNextSchedule = (
    lastScheduledTime,
    intervalInHours,
    referenceDate = null,
) => {
    const now = resolveNow(referenceDate);

    if (!lastScheduledTime) {
        throw new AppError('Invalid lastScheduledTime', 400);
    }

    if (!intervalInHours || intervalInHours <= 0) {
        throw new AppError('Invalid intervalInHours', 400);
    }

    let nextDate =
        typeof lastScheduledTime === 'string'
            ? new Date(lastScheduledTime)
            : new Date(lastScheduledTime);

    while (isBefore(nextDate, now)) {
        nextDate = addHours(nextDate, intervalInHours);
    }

    return nextDate;
};

export const calculateNextDoseFromLastTaken = (
    lastTakenTime,
    intervalInHours,
    referenceDate = null,
) => {
    const now = resolveNow(referenceDate);
    const lastDate =
        typeof lastTakenTime === 'string'
            ? new Date(lastTakenTime)
            : lastTakenTime;

    let nextDateTime = addHours(lastDate, intervalInHours);

    while (isBefore(nextDateTime, now)) {
        nextDateTime = addHours(nextDateTime, intervalInHours);
    }

    return nextDateTime;
};

const resolveNow = (referenceDate) => {
    return referenceDate ? dateTime.now(referenceDate) : dateTime.now();
};

export const extractTimeFromTimestamp = (timestamp) => {
    if (!timestamp) return null;
    const date =
        typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return dateTime.format(date, 'HH:mm:ss');
};

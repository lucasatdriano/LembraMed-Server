import { dateTime } from '../formatters/date-time.js';
import { calculateNextSchedule } from './medication-time.helper.js';

export const recalculateNextDoseTime = (
    lastScheduledTime,
    intervalInHours,
    referenceDate = null,
) => {
    const nextDate = calculateNextSchedule(
        lastScheduledTime,
        intervalInHours,
        referenceDate,
    );

    return dateTime.toTimeString(nextDate);
};

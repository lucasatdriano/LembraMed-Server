import { toZonedTime, format as formatWithTimezone } from 'date-fns-tz';
import { startOfDay as startOfDayFns, endOfDay as endOfDayFns } from 'date-fns';

const TIMEZONE = 'America/Sao_Paulo';

export const dateTime = {
    now(date = Date.now()) {
        return toZonedTime(new Date(date), TIMEZONE);
    },

    startOfDay(date) {
        if (!date) return null;

        const parsed = this.parseDateOnly(date);

        return startOfDayFns(parsed);
    },

    endOfDay(date) {
        if (!date) return null;

        const parsed = this.parseDateOnly(date);

        return endOfDayFns(parsed);
    },

    toTimeString(date) {
        if (!date) return null;

        return formatWithTimezone(date, 'HH:mm', {
            timeZone: TIMEZONE,
        });
    },

    timeStringToDate(timeString, baseDate = null) {
        if (!timeString) {
            return null;
        }

        const base = baseDate ? this.now(baseDate) : this.now();
        const [hours, minutes] = timeString.split(':').map(Number);

        const adjustedDate = new Date(base);
        adjustedDate.setHours(hours, minutes, 0, 0);

        return adjustedDate;
    },

    isSameTime(date1, date2) {
        return this.toTimeString(date1) === this.toTimeString(date2);
    },

    parseDateOnly(date) {
        if (typeof date === 'string' && date.length === 10) {
            const [year, month, day] = date.split('-').map(Number);
            return new Date(year, month - 1, day);
        }

        return date;
    },
};

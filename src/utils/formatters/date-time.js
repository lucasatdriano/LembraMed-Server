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

    format(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
        if (!date) return null;

        const parsed = date instanceof Date ? date : new Date(date);

        if (isNaN(parsed.getTime())) return null;

        return formatWithTimezone(parsed, formatStr, {
            timeZone: TIMEZONE,
        });
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

    toTimestamp(value, referenceDate = null) {
        if (!value) return null;

        if (value instanceof Date) return value;

        if (typeof value === 'string' && value.includes('T')) {
            return new Date(value);
        }

        if (typeof value === 'string' && value.includes(':')) {
            const base = referenceDate ? new Date(referenceDate) : this.now();
            return this.timeStringToDate(value, base);
        }

        if (typeof value === 'number') {
            return new Date(value);
        }

        return new Date(value);
    },

    toISO(value) {
        if (!value) return null;

        const date = value instanceof Date ? value : new Date(value);

        if (isNaN(date.getTime())) return null;

        return date.toISOString();
    },

    toISOWithTimezone(value) {
        if (!value) return null;

        const date = value instanceof Date ? value : new Date(value);

        if (isNaN(date.getTime())) return null;

        return formatWithTimezone(date, "yyyy-MM-dd'T'HH:mm:ssXXX", {
            timeZone: TIMEZONE,
        });
    },

    extractTime(timestamp) {
        if (!timestamp) return null;

        const date =
            typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

        if (isNaN(date.getTime())) return null;

        return this.toTimeString(date);
    },
};

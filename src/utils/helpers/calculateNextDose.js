import { timezone } from '../formatters/timezone.js';

export function calculateNextDose(lastDoseTime, intervalinhours) {
    const [hours, minutes] = lastDoseTime.split(':').map(Number);
    const date = timezone.now();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    date.setHours(date.getHours() + intervalinhours);

    return date.toTimeString().slice(0, 5);
}

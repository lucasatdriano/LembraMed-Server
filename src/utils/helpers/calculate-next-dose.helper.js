import { timezone } from '../formatters/timezone.js';

export function calculateNextDose(lastDoseTime, intervalinhours) {
    if (!lastDoseTime || !intervalinhours) return null;

    const [hours, minutes] = lastDoseTime.split(':').map(Number);

    const now = timezone.now();

    const nextDoseDate = new Date(now);
    nextDoseDate.setHours(hours, minutes, 0, 0);

    nextDoseDate.setHours(nextDoseDate.getHours() + intervalinhours);

    return nextDoseDate.toTimeString().slice(0, 5);
}

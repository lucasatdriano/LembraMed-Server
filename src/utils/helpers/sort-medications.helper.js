import { isAfter, isBefore, differenceInMinutes, parseISO } from 'date-fns';

const getMinutesOfDay = (timestamp) => {
    if (!timestamp) return Infinity;

    const date =
        typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
};

const isMedicationOverdue = (medication, currentDate) => {
    if (!medication.status || !medication.hournextdose) return false;
    if (medication.pendingconfirmation) return false;

    const doseDate =
        typeof medication.hournextdose === 'string'
            ? parseISO(medication.hournextdose)
            : medication.hournextdose;

    return isBefore(doseDate, currentDate);
};

export const sortMedicationsByPriority = (
    medications,
    currentDate = new Date(),
) => {
    if (!medications || !Array.isArray(medications)) {
        return [];
    }

    return [...medications].sort((a, b) => {
        const aFinished = !a.status;
        const bFinished = !b.status;

        if (aFinished && !bFinished) return 1;
        if (!aFinished && bFinished) return -1;
        if (aFinished && bFinished) return 0;

        const aOverdue = isMedicationOverdue(a, currentDate);
        const bOverdue = isMedicationOverdue(b, currentDate);

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        const aTime = getMinutesOfDay(a.hournextdose);
        const bTime = getMinutesOfDay(b.hournextdose);

        return aTime - bTime;
    });
};

export const isDoseOverdue = (medication, currentDate = new Date()) => {
    if (!medication?.status || !medication?.hournextdose) return false;
    if (medication.pendingconfirmation) return false;

    const doseDate =
        typeof medication.hournextdose === 'string'
            ? parseISO(medication.hournextdose)
            : medication.hournextdose;

    return isBefore(doseDate, currentDate);
};

export const getMinutesUntilNextDose = (
    medication,
    currentDate = new Date(),
) => {
    if (!medication?.hournextdose) return Infinity;

    const doseDate =
        typeof medication.hournextdose === 'string'
            ? parseISO(medication.hournextdose)
            : medication.hournextdose;

    return differenceInMinutes(doseDate, currentDate);
};

export const formatDoseTime = (timestamp, format = 'HH:mm') => {
    if (!timestamp) return '--:--';

    const date =
        typeof timestamp === 'string' ? parseISO(timestamp) : timestamp;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (format === 'HH:mm') return `${hours}:${minutes}`;
    if (format === 'HH:mm:ss') {
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    return date.toLocaleString();
};

export const groupMedicationsByPriority = (
    medications,
    currentDate = new Date(),
) => {
    const sorted = sortMedicationsByPriority(medications, currentDate);

    return {
        overdue: sorted.filter(
            (m) => m.status && isMedicationOverdue(m, currentDate),
        ),
        pending: sorted.filter(
            (m) => m.status && !isMedicationOverdue(m, currentDate),
        ),
        inactive: sorted.filter((m) => !m.status),
        all: sorted,
    };
};

export const isTodaysDoseTaken = (
    medicationHistory,
    medicationId,
    currentDate = new Date(),
) => {
    if (!medicationHistory || !Array.isArray(medicationHistory)) return false;

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return medicationHistory.some(
        (history) =>
            history.medicationid === medicationId &&
            history.taken === true &&
            isAfter(history.scheduleddate, today) &&
            isBefore(history.scheduleddate, tomorrow),
    );
};

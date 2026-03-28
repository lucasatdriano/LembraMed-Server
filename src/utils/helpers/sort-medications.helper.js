const timeToMinutes = (timeStr) => {
    if (!timeStr) return Infinity;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const isMedicationOverdue = (medication, currentTotalMinutes) => {
    if (!medication.status || !medication.hournextdose) return false;
    if (medication.pendingconfirmation) return false;

    const doseMinutes = timeToMinutes(medication.hournextdose);
    return currentTotalMinutes > doseMinutes;
};

export const sortMedicationsByPriority = (
    medications,
    currentDate = new Date(),
) => {
    if (!medications || !Array.isArray(medications)) {
        return [];
    }

    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return [...medications].sort((a, b) => {
        const aFinished = !a.status;
        const bFinished = !b.status;

        if (aFinished && !bFinished) return 1;
        if (!aFinished && bFinished) return -1;
        if (aFinished && bFinished) return 0;

        const aOverdue = isMedicationOverdue(a, currentTotalMinutes);
        const bOverdue = isMedicationOverdue(b, currentTotalMinutes);

        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        const aTime = timeToMinutes(a.hournextdose);
        const bTime = timeToMinutes(b.hournextdose);

        return aTime - bTime;
    });
};

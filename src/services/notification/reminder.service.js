export class ReminderService {
    static buildReminder(reminderType, medicationName, doseTime, medicationId) {
        switch (reminderType) {
            case 'initial':
                return {
                    title: '💊 Hora do Medicamento',
                    message: `Está na hora de tomar ${medicationName} (${doseTime}).`,
                    tag: `med-${medicationId}-initial`,
                };

            case 'reminder':
                return {
                    title: '⏰ Lembrete de Medicamento',
                    message: `Ainda não confirmou ${medicationName}.`,
                    tag: `med-${medicationId}-reminder`,
                };

            default:
                return {
                    title: '💊 Lembrete',
                    message: `Não esqueça de tomar ${medicationName}`,
                    tag: `med-${medicationId}`,
                };
        }
    }
}

export class ReminderService {
    static buildReminder(reminderType, medicationName, doseTime, medicationId) {
        switch (reminderType) {
            case 'initial':
                return {
                    title: '💊 Hora do Medicamento',
                    message: `Está na hora de tomar ${medicationName} (${doseTime}).`,
                    tag: `medication-${medicationId}-initial`,
                };

            case 'reminder':
                return {
                    title: '⏰ Lembrete de Medicamento',
                    message: `Ainda não confirmou ${medicationName}.`,
                    tag: `medication-${medicationId}-reminder`,
                };

            case 'missed':
                return {
                    title: '⚠️ Dose Perdida',
                    message: `Você perdeu a dose de ${medicationName}. Se atente para não perder a próxima.`,
                    tag: `medication-${medicationId}-missed`,
                };

            case 'expired':
                return {
                    title: '📆 Medicamento Terminado',
                    message: `O medicamento ${medicationName} terminou. Você pode ver o histórico de suas doses.`,
                    tag: `medication-${medicationId}-expired`,
                };

            default:
                return {
                    title: '💊 Lembrete',
                    message: `Não esqueça de tomar ${medicationName}`,
                    tag: `medication-${medicationId}`,
                };
        }
    }
}

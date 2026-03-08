import { timezone } from '../formatters/timezone.js';

import { models } from '../../models/index.js';

/**
 * Calcula a próxima data/hora completa para um medicamento
 * @param {Object} medication - Medicamento com doseinterval
 * @param {Date} [referenceDate=null] - Data de referência (padrão: agora)
 * @returns {Date|null} - Próxima data/hora ou null se fora do período
 */
export function calculateNextFullDateTime(medication, referenceDate = null) {
    const agora = referenceDate ? timezone.now(referenceDate) : timezone.now();

    if (medication.pendingconfirmation && medication.pendinguntil) {
        return timezone.now(medication.pendinguntil);
    }

    if (medication.periodend && timezone.now(medication.periodend) < agora) {
        return null;
    }

    if (
        medication.periodstart &&
        timezone.now(medication.periodstart) > agora
    ) {
        return timezone.now(medication.periodstart);
    }

    return findNextDoseFromHistory(medication, agora);
}

async function findNextDoseFromHistory(medication, agora) {
    try {
        const lastHistory = await models.MedicationHistory.findOne({
            where: { medicationid: medication.id },
            order: [['takendate', 'DESC']],
        });

        const intervaloHoras = medication.doseinterval?.intervalinhours || 0;
        const intervaloMs = intervaloHoras * 60 * 60 * 1000;

        let baseDate;

        if (lastHistory) {
            baseDate = timezone.now(lastHistory.takendate);

            if (lastHistory.taken) {
                baseDate = new Date(baseDate.getTime() + intervaloMs);
            }
        } else {
            if (medication.periodstart) {
                const periodStart = timezone.now(medication.periodstart);
                const [horas, minutos] = medication.hournextdose
                    .split(':')
                    .map(Number);

                baseDate = new Date(periodStart);
                baseDate.setHours(horas, minutos, 0, 0);

                if (baseDate < periodStart) {
                    baseDate = new Date(baseDate.getTime() + intervaloMs);
                }
            } else {
                baseDate = timezone.proximaOcorrenciaHorario(
                    medication.hournextdose,
                    agora,
                );
            }
        }

        while (baseDate < agora) {
            baseDate = new Date(baseDate.getTime() + intervaloMs);
        }

        return baseDate;
    } catch (error) {
        console.error('[NEXT_DATETIME] Erro:', error);
        return timezone.proximaOcorrenciaHorario(
            medication.hournextdose,
            agora,
        );
    }
}

/**
 * Converte hora (string) para Date completo no dia apropriado
 * @param {string} horaStr - Hora no formato "HH:MM"
 * @param {Date} dataReferencia - Data de referência
 * @returns {Date} - Data completa com a hora especificada
 */
export function horaToDateComDiaApropriado(horaStr, dataReferencia) {
    const [horas, minutos] = horaStr.split(':').map(Number);

    const tentativaHoje = new Date(dataReferencia);
    tentativaHoje.setHours(horas, minutos, 0, 0);

    const diffHoras = (dataReferencia - tentativaHoje) / (60 * 60 * 1000);

    if (diffHoras > 12) {
        const amanha = new Date(dataReferencia);
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(horas, minutos, 0, 0);
        return amanha;
    }

    return tentativaHoje;
}

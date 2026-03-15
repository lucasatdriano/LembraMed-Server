import { timezone } from '../formatters/timezone.js';
import {
    calcularProximoHorario,
    proximaOcorrenciaHorario,
} from './medication-time.helper.js';

export function calcularProximoHorarioCompleto(
    medicamento,
    dataReferencia = null,
) {
    const agora = timezone.now(dataReferencia);

    if (medicamento.pendinguntil) {
        return timezone.now(medicamento.pendinguntil);
    }

    if (medicamento.lasttakentime && medicamento.doseinterval) {
        return calcularProximoHorario(
            medicamento.lasttakentime,
            medicamento.doseinterval.intervalinhours,
            agora,
        );
    }

    return proximaOcorrenciaHorario(medicamento.hournextdose, agora);
}

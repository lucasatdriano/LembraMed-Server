import { timezone } from '../formatters/timezone.js';

export function horaParaDate(horaStr, dataBase = null) {
    return timezone.horaParaDate(horaStr, dataBase);
}

export function proximaOcorrenciaHorario(horarioStr, dataReferencia = null) {
    return timezone.proximaOcorrenciaHorario(horarioStr, dataReferencia);
}

export function horarioJaPassou(horarioStr, dataReferencia = null) {
    return timezone.horarioJaPassou(horarioStr, dataReferencia);
}

export function calcularProximoHorarioCompleto(
    medicamento,
    dataReferencia = null,
) {
    const agora = dataReferencia
        ? timezone.now(dataReferencia)
        : timezone.now();

    if (medicamento.pendinguntil) {
        return timezone.now(medicamento.pendinguntil);
    }

    if (medicamento.lasttakentime && medicamento.doseinterval) {
        const proximaDose = timezone.calcularProximoHorario(
            medicamento.lasttakentime,
            medicamento.doseinterval.intervalinhours,
            agora,
        );

        return proximaDose;
    }

    return timezone.proximaOcorrenciaHorario(medicamento.hournextdose, agora);
}

export function dentroDaTolerancia(dataAtual, dataProgramada, intervaloHoras) {
    return timezone.dentroDaTolerancia(
        dataAtual,
        dataProgramada,
        intervaloHoras,
    );
}

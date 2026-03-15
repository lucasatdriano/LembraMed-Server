import { addDays, addHours, isAfter, isBefore } from 'date-fns';
import { timezone } from '../formatters/timezone.js';

export const calcularProximoHorario = function (
    ultimoHorario,
    intervaloHoras,
    dataReferencia = null,
) {
    const agora = dataReferencia ? new Date(dataReferencia) : timezone.now();

    if (intervaloHoras >= 24 && intervaloHoras % 24 === 0) {
        const diasParaAdicionar = intervaloHoras / 24;
        const proximaOcorrencia = this.proximaOcorrenciaHorario(
            ultimoHorario,
            agora,
        );

        if (isAfter(agora, proximaOcorrencia)) {
            return addDays(proximaOcorrencia, diasParaAdicionar);
        }

        return proximaOcorrencia;
    }

    const ultimaData = timezone.horaParaDate(ultimoHorario, agora);
    let proximaData = addHours(ultimaData, intervaloHoras);

    while (isBefore(proximaData, agora)) {
        proximaData = addHours(proximaData, intervaloHoras);
    }

    return proximaData;
};

export const proximaOcorrenciaHorario = function (
    horarioStr,
    dataReferencia = null,
) {
    const agora = dataReferencia
        ? timezone.now(dataReferencia)
        : timezone.now();
    const horarioHoje = timezone.horaParaDate(horarioStr, agora);

    if (agora <= horarioHoje || timezone.isMesmoHorario(agora, horarioHoje)) {
        return horarioHoje;
    }

    const horarioAmanha = timezone.horaParaDate(horarioStr, addDays(agora, 1));
    return horarioAmanha;
};

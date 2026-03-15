import { calcularProximoHorario } from './medication-time.helper.js';

export const recalculateNextDose = function (
    ultimoHorario,
    intervaloHoras,
    dataReferencia = null,
) {
    const proximaData = calcularProximoHorario(
        ultimoHorario,
        intervaloHoras,
        dataReferencia,
    );

    const horas = proximaData.getHours().toString().padStart(2, '0');
    const minutos = proximaData.getMinutes().toString().padStart(2, '0');

    return `${horas}:${minutos}`;
};

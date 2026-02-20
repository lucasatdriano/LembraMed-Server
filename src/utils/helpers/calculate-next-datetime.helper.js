import { calcularProximoHorarioCompleto } from './dateTime.helper.js';

export function calculateNextDateTime(medication) {
    try {
        const proximaData = calcularProximoHorarioCompleto(medication);

        return proximaData;
    } catch (error) {
        console.error('Erro ao calcular próxima data/hora:', error);
        return null;
    }
}

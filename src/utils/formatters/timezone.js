import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import {
    addHours,
    addDays,
    isAfter,
    isBefore,
    startOfDay as fnsStartOfDay,
    endOfDay as fnsEndOfDay,
} from 'date-fns';

const TIMEZONE = 'America/Sao_Paulo';

export const timezone = {
    /**
     * Retorna a data atual no fuso brasileiro
     * @param {Date|number|string} [date] - Data opcional para converter
     * @returns {Date} Data no fuso brasileiro
     */
    now(date = new Date()) {
        if (date instanceof Date) {
            return toZonedTime(date, TIMEZONE);
        }

        if (typeof date === 'number' || typeof date === 'string') {
            return toZonedTime(new Date(date), TIMEZONE);
        }

        return toZonedTime(new Date(), TIMEZONE);
    },

    /**
     * Formata uma data no padrão brasileiro
     * @param {Date} date - Data a ser formatada
     * @param {string} [formatStr='yyyy-MM-dd HH:mm:ss'] - Formato desejado
     * @returns {string} Data formatada
     */
    format(date, formatStr = 'yyyy-MM-dd HH:mm:ss') {
        return tzFormat(date, formatStr, { timeZone: TIMEZONE });
    },

    /**
     * Ajusta uma data string para o início do dia no Brasil (00:00:00)
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @returns {Date|null} Data ajustada para UTC
     */
    startOfDay(dateString) {
        if (!dateString) return null;

        const [year, month, day] = dateString.split('-').map(Number);

        return new Date(Date.UTC(year, month - 1, day, 0, 1, 0));
    },

    /**
     * Ajusta uma data string para o fim do dia no Brasil (23:59:59)
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @returns {Date|null} Data ajustada para UTC
     */
    endOfDay(dateString) {
        if (!dateString) return null;

        const [year, month, day] = dateString.split('-').map(Number);

        return new Date(Date.UTC(year, month - 1, day, 23, 59, 0));
    },

    /**
     * Extrai apenas a data (YYYY-MM-DD) de uma data no fuso brasileiro
     * @param {Date} date - Data no fuso brasileiro
     * @returns {string} Data no formato YYYY-MM-DD
     */
    toDateString(date) {
        if (!date) return null;
        const zonedDate = toZonedTime(date, TIMEZONE);
        return tzFormat(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
    },

    /**
     * Extrai apenas a hora (HH:mm) de uma data no fuso brasileiro
     * @param {Date} date - Data no fuso brasileiro
     * @returns {string} Hora no formato HH:mm
     */
    toTimeString(date) {
        if (!date) return null;
        const zonedDate = toZonedTime(date, TIMEZONE);
        return tzFormat(zonedDate, 'HH:mm', { timeZone: TIMEZONE });
    },

    /**
     * Formata um timestamp UTC para exibição SEM aplicar fuso novamente
     * @param {Date|number} date - Data ou timestamp
     * @returns {string} Hora no formato HH:mm
     */
    formatUTCTime(date) {
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().substring(11, 16);
    },

    /**
     * Converte uma string de hora (HH:MM) em um objeto Date completo
     * @param {string} horaStr - Hora no formato HH:MM
     * @param {Date} [dataBase] - Data base para usar (padrão: agora)
     * @returns {Date} Data completa com a hora especificada
     */
    horaParaDate(horaStr, dataBase = null) {
        const data = dataBase ? this.now(dataBase) : this.now();
        const [horas, minutos] = horaStr.split(':').map(Number);

        const dataAjustada = new Date(data);
        dataAjustada.setHours(horas, minutos, 0, 0);

        return dataAjustada;
    },

    /**
     * Obtém a próxima ocorrência de um horário (hoje ou amanhã)
     * @param {string} horarioStr - Horário no formato HH:MM
     * @param {Date} [dataReferencia] - Data de referência
     * @returns {Date} Próxima ocorrência do horário
     */
    proximaOcorrenciaHorario(horarioStr, dataReferencia = null) {
        const agora = dataReferencia ? this.now(dataReferencia) : this.now();
        const horarioHoje = this.horaParaDate(horarioStr, agora);

        if (agora <= horarioHoje || this.isMesmoHorario(agora, horarioHoje)) {
            return horarioHoje;
        }

        const horarioAmanha = this.horaParaDate(horarioStr, addDays(agora, 1));
        return horarioAmanha;
    },

    /**
     * Verifica se duas datas têm o mesmo horário (ignora data)
     * @param {Date} data1 - Primeira data
     * @param {Date} data2 - Segunda data
     * @returns {boolean} True se têm o mesmo horário
     */
    isMesmoHorario(data1, data2) {
        return this.toTimeString(data1) === this.toTimeString(data2);
    },

    /**
     * Calcula o próximo horário baseado no último horário e intervalo
     * @param {string} ultimoHorario - Último horário no formato HH:MM
     * @param {number} intervaloHoras - Intervalo em horas
     * @param {Date} [dataReferencia] - Data de referência
     * @returns {Date} Próxima data/hora
     */
    calcularProximoHorario(
        ultimoHorario,
        intervaloHoras,
        dataReferencia = null,
    ) {
        const agora = dataReferencia ? new Date(dataReferencia) : this.now();

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

        const ultimaData = this.horaParaDate(ultimoHorario, agora);
        let proximaData = addHours(ultimaData, intervaloHoras);

        while (isBefore(proximaData, agora)) {
            proximaData = addHours(proximaData, intervaloHoras);
        }

        return proximaData;
    },

    /**
     * Ajusta uma data para o início do dia (00:00:00)
     * @param {Date} data - Data a ser ajustada
     * @returns {Date} Data no início do dia
     */
    inicioDoDia(data) {
        const dataZonada = this.now(data);
        return toZonedTime(fnsStartOfDay(dataZonada), TIMEZONE);
    },

    /**
     * Ajusta uma data para o fim do dia (23:59:59)
     * @param {Date} data - Data a ser ajustada
     * @returns {Date} Data no fim do dia
     */
    fimDoDia(data) {
        const dataZonada = this.now(data);
        return toZonedTime(fnsEndOfDay(dataZonada), TIMEZONE);
    },

    /**
     * Converte uma data para string ISO mantendo o fuso
     * @param {Date} date - Data a ser convertida
     * @returns {string} String ISO com fuso
     */
    toISOString(date) {
        if (!date) return null;
        const zonedDate = this.now(date);
        return zonedDate.toISOString();
    },
};

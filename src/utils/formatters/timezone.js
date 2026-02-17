import { toZonedTime, format as tzFormat } from 'date-fns-tz';

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
};

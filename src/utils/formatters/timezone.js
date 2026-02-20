import { toZonedTime, format as tzFormat } from 'date-fns-tz';
import {
    addHours,
    addDays,
    isAfter,
    isBefore,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds,
    startOfDay as fnsStartOfDay,
    endOfDay as fnsEndOfDay,
    differenceInMinutes,
    isSameDay,
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
        return d.toISOString().substring(11, 16); // Pega HH:mm do ISO string
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

        // Cria uma nova data baseada na data de referência (que já está no fuso)
        const dataAjustada = new Date(data);
        dataAjustada.setHours(horas, minutos, 0, 0);

        return dataAjustada; // Já está no fuso correto
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

        // Se o horário de hoje ainda não passou, usa hoje
        if (agora <= horarioHoje || this.isMesmoHorario(agora, horarioHoje)) {
            return horarioHoje;
        }

        // Se já passou, usa amanhã
        const horarioAmanha = this.horaParaDate(horarioStr, addDays(agora, 1));
        return horarioAmanha;
    },

    /**
     * Verifica se um horário já passou considerando a data
     * @param {string} horarioStr - Horário no formato HH:MM
     * @param {Date} [dataReferencia] - Data de referência
     * @returns {boolean} True se já passou
     */
    horarioJaPassou(horarioStr, dataReferencia = null) {
        const agora = dataReferencia ? new Date(dataReferencia) : this.now();
        const horarioHoje = this.horaParaDate(horarioStr, agora);

        return (
            isAfter(agora, horarioHoje) &&
            !this.isMesmoHorario(agora, horarioHoje)
        );
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
     * Verifica se uma data está dentro do período de tolerância
     * @param {Date} dataAtual - Data atual
     * @param {Date} dataProgramada - Data programada
     * @param {number} intervaloHoras - Intervalo em horas
     * @returns {boolean} True se está dentro da tolerância
     */
    dentroDaTolerancia(dataAtual, dataProgramada, intervaloHoras) {
        const diffMinutos = Math.abs(
            differenceInMinutes(dataAtual, dataProgramada),
        );
        const toleranciaMinutos = Math.floor(intervaloHoras * 60 * 0.25); // 25% do intervalo

        return diffMinutos <= toleranciaMinutos;
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

        // Se o intervalo é múltiplo de 24h, mantém o mesmo horário
        if (intervaloHoras >= 24 && intervaloHoras % 24 === 0) {
            const diasParaAdicionar = intervaloHoras / 24;
            const proximaOcorrencia = this.proximaOcorrenciaHorario(
                ultimoHorario,
                agora,
            );

            // Se a próxima ocorrência já passou, avança para o próximo ciclo
            if (isAfter(agora, proximaOcorrencia)) {
                return addDays(proximaOcorrencia, diasParaAdicionar);
            }

            return proximaOcorrencia;
        }

        // Para intervalos não múltiplos de 24h
        const ultimaData = this.horaParaDate(ultimoHorario, agora);
        let proximaData = addHours(ultimaData, intervaloHoras);

        // Garante que a próxima data é no futuro
        while (isBefore(proximaData, agora)) {
            proximaData = addHours(proximaData, intervaloHoras);
        }

        return proximaData;
    },

    /**
     * Verifica se uma dose é do dia anterior (para doses noturnas)
     * @param {string} horarioStr - Horário da dose
     * @param {Date} dataAtual - Data atual
     * @returns {boolean} True se a dose é do dia anterior
     */
    isDoseDoDiaAnterior(horarioStr, dataAtual) {
        const dataZonada = this.now(dataAtual);
        const horarioAtual = this.toTimeString(dataZonada);
        const [horaAtual] = horarioAtual.split(':').map(Number);
        const [horaDose] = horarioStr.split(':').map(Number);

        // Se são 00h-04h e a dose é 22h-23h, provavelmente é do dia anterior
        return (
            horaAtual >= 0 && horaAtual <= 4 && horaDose >= 20 && horaDose <= 23
        );
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
     * Verifica se duas datas são do mesmo dia
     * @param {Date} data1 - Primeira data
     * @param {Date} data2 - Segunda data
     * @returns {boolean} True se são do mesmo dia
     */
    mesmoDia(data1, data2) {
        return isSameDay(this.now(data1), this.now(data2));
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

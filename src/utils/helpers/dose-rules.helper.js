export function calcularTolerancia(intervaloHoras) {
    const intervaloMinutos = intervaloHoras * 60;
    // Tolerância = 25% do intervalo (1/4)
    const toleranciaMinutos = Math.floor(intervaloMinutos * 0.25);

    console.log(`⏱️ Intervalo: ${intervaloHoras}h (${intervaloMinutos}min)`);
    console.log(`⏱️ Tolerância: ${toleranciaMinutos}min (25% do intervalo)`);
    return toleranciaMinutos;
}

/**
 * Verifica se faltam 4 horas ou mais para a próxima dose
 * @param {Object} medication - Medicamento
 * @param {Date} agora - Data atual
 * @returns {Object} Resultado da validação
 */
export function verificarIntervaloMinimo(medication, agora) {
    // Se não tem última dose, pode tomar
    if (!medication.lasttakentime) {
        return { valido: true };
    }

    console.log(
        `\n⏰ [VERIFICAR_INTERVALO] ========== VERIFICANDO INTERVALO MÍNIMO ==========`,
    );

    // Converte a última dose tomada para Date completo
    const [ultimaHora, ultimoMinuto] = medication.lasttakentime
        .split(':')
        .map(Number);
    const dataUltimaDose = new Date(agora);
    dataUltimaDose.setHours(ultimaHora, ultimoMinuto, 0, 0);

    // Se a última dose parece ser no futuro (ex: 21h em relação às 11h), é do dia anterior
    if (dataUltimaDose > agora) {
        dataUltimaDose.setDate(dataUltimaDose.getDate() - 1);
        console.log(
            `⏰ [VERIFICAR_INTERVALO] Última dose ajustada para o dia anterior`,
        );
    }

    // Calcula o próximo horário permitido (última dose + 4 horas)
    const proximoHorarioPermitido = new Date(
        dataUltimaDose.getTime() + 2 * 60 * 60 * 1000,
    );

    const diffMinutosAtePermitido =
        (proximoHorarioPermitido.getTime() - agora.getTime()) / (60 * 1000);

    console.log(
        `⏰ [VERIFICAR_INTERVALO] Última dose: ${medication.lasttakentime} (${dataUltimaDose.toLocaleString()})`,
    );
    console.log(
        `⏰ [VERIFICAR_INTERVALO] Próximo horário permitido: ${proximoHorarioPermitido.toLocaleString()}`,
    );
    console.log(`⏰ [VERIFICAR_INTERVALO] Agora: ${agora.toLocaleString()}`);
    console.log(
        `⏰ [VERIFICAR_INTERVALO] Minutos até poder tomar: ${Math.round(diffMinutosAtePermitido)}`,
    );

    // Se faltam 4 horas ou mais para a próxima dose (diffMinutosAtePermitido > 0)
    if (diffMinutosAtePermitido > 4 * 60) {
        // Mais de 4 horas
        const horasRestantes = Math.floor(diffMinutosAtePermitido / 60);
        const minutosRestantes = Math.floor(diffMinutosAtePermitido % 60);

        let mensagem = `⏳ Faltam ${horasRestantes} hora${horasRestantes > 1 ? 's' : ''}`;
        if (minutosRestantes > 0) {
            mensagem += ` e ${minutosRestantes} minuto${minutosRestantes > 1 ? 's' : ''}`;
        }
        mensagem += ` para a próxima dose. O intervalo mínimo é de 4 horas.`;

        console.log(
            `⏰ [VERIFICAR_INTERVALO] ❌ FALTAM 4 HORAS OU MAIS - NÃO PODE TOMAR`,
        );
        console.log(`⏰ [VERIFICAR_INTERVALO] Mensagem: ${mensagem}`);

        return {
            valido: false,
            mensagem,
            detalhes: {
                faltamMinutos: Math.round(diffMinutosAtePermitido),
                faltamHoras: horasRestantes,
                faltamMinutosRestantes: minutosRestantes,
                ultimaDose: medication.lasttakentime,
                proximoHorarioPermitido: proximoHorarioPermitido.toISOString(),
            },
        };
    }

    console.log(`⏰ [VERIFICAR_INTERVALO] ✅ Intervalo mínimo respeitado`);
    console.log(`⏰ [VERIFICAR_INTERVALO] ========== FIM ==========\n`);

    return { valido: true };
}
